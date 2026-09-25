export interface ParsedCommand {
  raw: string;
  command: string;
  args: string[];
  redirect?: {
    file: string;
    append: boolean;
  };
  stdinFile?: string;
  heredoc?: string;
  pipeNext?: ParsedCommand;
}

export interface ChainStep {
  cmd: ParsedCommand;
  prevOp: ";" | "&&" | "||";
}

export function parseCommandLine(input: string): ChainStep[] {
  const steps: ChainStep[] = [];
  const rawCommandBlocks = extractCommandBlocksWithHeredocs(input.trim());

  for (const block of rawCommandBlocks) {
    const segments = splitChaining(block.cmd);

    for (const seg of segments) {
      const pipeParts = splitPipes(seg.cmd);

      let prevCmd: ParsedCommand | undefined = undefined;
      for (let i = pipeParts.length - 1; i >= 0; i--) {
        const part = pipeParts[i].trim();
        if (!part) continue;

        const parsed = parseSingleCommand(part);
        // Attach heredoc to the first command in pipeline
        if (i === 0 && block.heredoc !== undefined) {
          parsed.heredoc = block.heredoc;
        }

        if (prevCmd) {
          parsed.pipeNext = prevCmd;
        }
        prevCmd = parsed;
      }

      if (prevCmd) {
        steps.push({ cmd: prevCmd, prevOp: seg.prevOp });
      }
    }
  }

  return steps;
}

interface RawCommandBlock {
  cmd: string;
  heredoc?: string;
}

function extractCommandBlocksWithHeredocs(input: string): RawCommandBlock[] {
  // 1. Join lines with backslash continuations: '\' at line end
  const normalized = input.replace(/\\\r?\n\s*/g, " ");
  const lines = normalized.split("\n");
  const blocks: RawCommandBlock[] = [];

  let currentCmd = "";
  let activeHeredocDelim: string | null = null;
  let heredocBuffer: string[] = [];

  let inBraceGroup = false;
  let braceBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Inside heredoc body
    if (activeHeredocDelim !== null) {
      if (line.trim() === activeHeredocDelim) {
        blocks.push({
          cmd: currentCmd,
          heredoc: heredocBuffer.join("\n") + "\n",
        });
        currentCmd = "";
        activeHeredocDelim = null;
        heredocBuffer = [];
      } else {
        heredocBuffer.push(line);
      }
      continue;
    }

    // Heredoc start
    const heredocMatch = line.match(/^(.*?)(?:<<-?\s*["']?([A-Za-z0-9_]+)["']?)(.*)$/);
    if (heredocMatch) {
      currentCmd = (heredocMatch[1] + " " + heredocMatch[3]).trim();
      activeHeredocDelim = heredocMatch[2];
      heredocBuffer = [];
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    // Ignore markdown headings, bullet points, or markdown bold titles (e.g. **Solution...**)
    if (trimmed.startsWith("#") || trimmed.startsWith("*") || trimmed.startsWith(">")) {
      continue;
    }

    // Inside brace group { ... }
    if (inBraceGroup) {
      if (trimmed.includes("}")) {
        inBraceGroup = false;
        // Check for closing brace redirect: e.g. '} > /root/users_report.txt'
        const closeMatch = trimmed.match(/^(.*?)\}\s*(?:(>>|>)\s*([^\s;]+))?(.*)$/);
        if (closeMatch) {
          const beforeBrace = closeMatch[1].trim();
          if (beforeBrace) braceBuffer.push(beforeBrace);
          const redirOp = closeMatch[2];
          const targetFile = closeMatch[3];

          for (let bIdx = 0; bIdx < braceBuffer.length; bIdx++) {
            let cmdItem = braceBuffer[bIdx];
            if (targetFile) {
              const op = bIdx === 0 && redirOp === ">" ? ">" : ">>";
              cmdItem = `${cmdItem} ${op} ${targetFile}`;
            }
            blocks.push({ cmd: cmdItem });
          }
        }
        braceBuffer = [];
      } else {
        braceBuffer.push(trimmed);
      }
      continue;
    }

    // Start of brace group: '{' alone or '{ cmd'
    if (trimmed.startsWith("{") && !trimmed.includes("}")) {
      inBraceGroup = true;
      const afterBrace = trimmed.slice(1).trim();
      if (afterBrace) braceBuffer.push(afterBrace);
      continue;
    }

    // Single-line brace group: '{ cmd1; cmd2; } > file'
    const singleBraceMatch = trimmed.match(/^\{\s*(.*?)\s*;\s*\}\s*(?:(>>|>)\s*([^\s;]+))?$/);
    if (singleBraceMatch) {
      const innerCmds = singleBraceMatch[1].split(";").map((c) => c.trim()).filter(Boolean);
      const redirOp = singleBraceMatch[2];
      const targetFile = singleBraceMatch[3];
      for (let bIdx = 0; bIdx < innerCmds.length; bIdx++) {
        let cmdItem = innerCmds[bIdx];
        if (targetFile) {
          const op = bIdx === 0 && redirOp === ">" ? ">" : ">>";
          cmdItem = `${cmdItem} ${op} ${targetFile}`;
        }
        blocks.push({ cmd: cmdItem });
      }
      continue;
    }

    // Normal command line
    blocks.push({ cmd: trimmed });
  }

  if (activeHeredocDelim !== null) {
    blocks.push({
      cmd: currentCmd,
      heredoc: heredocBuffer.join("\n"),
    });
  }

  return blocks;
}

export interface RawChainSegment {
  cmd: string;
  prevOp: ";" | "&&" | "||";
}

function splitChaining(input: string): RawChainSegment[] {
  const result: RawChainSegment[] = [];
  let current = "";
  let inDouble = false;
  let inSingle = false;
  let currentOp: ";" | "&&" | "||" = ";";

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const nextChar = input[i + 1];

    if (char === '"' && !inSingle) {
      inDouble = !inDouble;
      current += char;
    } else if (char === "'" && !inDouble) {
      inSingle = !inSingle;
      current += char;
    } else if (!inDouble && !inSingle && char === "&" && nextChar === "&") {
      if (current.trim()) {
        result.push({ cmd: current.trim(), prevOp: currentOp });
      }
      current = "";
      currentOp = "&&";
      i++; // skip next '&'
    } else if (!inDouble && !inSingle && char === "|" && nextChar === "|") {
      if (current.trim()) {
        result.push({ cmd: current.trim(), prevOp: currentOp });
      }
      current = "";
      currentOp = "||";
      i++; // skip next '|'
    } else if (!inDouble && !inSingle && char === ";") {
      if (current.trim()) {
        result.push({ cmd: current.trim(), prevOp: currentOp });
      }
      current = "";
      currentOp = ";";
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    result.push({ cmd: current.trim(), prevOp: currentOp });
  }

  return result;
}

function splitPipes(input: string): string[] {
  const result: string[] = [];
  let current = "";
  let inDouble = false;
  let inSingle = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === '"' && !inSingle) {
      inDouble = !inDouble;
      current += char;
    } else if (char === "'" && !inDouble) {
      inSingle = !inSingle;
      current += char;
    } else if (!inDouble && !inSingle && char === "|") {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    result.push(current.trim());
  }

  return result;
}

function parseSingleCommand(rawCmd: string): ParsedCommand {
  // 0. Strip inline comments outside quotes (e.g. 'command # comment')
  let inDoubleQuote = false;
  let inSingleQuote = false;
  let commentIndex = -1;

  for (let i = 0; i < rawCmd.length; i++) {
    const char = rawCmd[i];
    if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
    else if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
    else if (!inDoubleQuote && !inSingleQuote && char === "#") {
      commentIndex = i;
      break;
    }
  }

  const cleanCmd = commentIndex !== -1 ? rawCmd.slice(0, commentIndex).trim() : rawCmd.trim();

  // 1. Strip stderr redirects like 2>/dev/null, 2>&1, &>/dev/null
  let cmdPart = cleanCmd
    .replace(/\s+2>\s*\/dev\/null/g, "")
    .replace(/\s+&>\s*\/dev\/null/g, "")
    .replace(/\s+2>&1/g, "");

  // 2. Check for quote-aware stdin redirection: '< file'
  let stdinFile: string | undefined;
  let inD = false;
  let inS = false;
  let stdinIndex = -1;

  for (let i = 0; i < cmdPart.length; i++) {
    const char = cmdPart[i];
    const nextChar = cmdPart[i + 1];

    if (char === '"' && !inS) inD = !inD;
    else if (char === "'" && !inD) inS = !inS;
    else if (!inD && !inS && char === "<") {
      if (nextChar === "<") {
        i++; // skip heredoc '<<'
        continue;
      }
      stdinIndex = i;
      break;
    }
  }

  if (stdinIndex !== -1) {
    const afterIn = cmdPart.slice(stdinIndex + 1).trim();
    stdinFile = afterIn.split(/\s+/)[0].replace(/^["']|["']$/g, "");
    cmdPart = (cmdPart.slice(0, stdinIndex) + " " + afterIn.slice(stdinFile.length)).trim();
  }

  // 3. Check for stdout redirection: '>>' or '>'
  let redirect: { file: string; append: boolean } | undefined;
  let inDouble = false;
  let inSingle = false;
  let redirIndex = -1;
  let isAppend = false;

  for (let i = 0; i < cmdPart.length; i++) {
    const char = cmdPart[i];
    const nextChar = cmdPart[i + 1];

    if (char === '"' && !inSingle) inDouble = !inDouble;
    else if (char === "'" && !inDouble) inSingle = !inSingle;
    else if (!inDouble && !inSingle && char === ">") {
      redirIndex = i;
      if (nextChar === ">") {
        isAppend = true;
      }
      break;
    }
  }

  if (redirIndex !== -1) {
    const filePart = cmdPart.slice(redirIndex + (isAppend ? 2 : 1)).trim();
    cmdPart = cmdPart.slice(0, redirIndex).trim();
    const cleanFile = filePart.split(/\s+/)[0].replace(/^["']|["']$/g, "");
    if (cleanFile) {
      redirect = { file: cleanFile, append: isAppend };
    }
  }

  // 4. Tokenize args and expand bash braces
  const tokens = tokenize(cmdPart);
  const expandedTokens = expandBraces(tokens);

  const command = expandedTokens[0] ?? "";
  const args = expandedTokens.slice(1);

  return {
    raw: rawCmd,
    command,
    args,
    redirect,
    stdinFile,
  };
}

function tokenize(str: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inDouble = false;
  let inSingle = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char === '"' && !inSingle) {
      inDouble = !inDouble;
    } else if (char === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (!inDouble && !inSingle && /\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

// Expand bash style {a,b,c} and {1..3} or {a..z}
export function expandBraces(tokens: string[]): string[] {
  const result: string[] = [];

  for (const token of tokens) {
    const match = token.match(/^(.*?)\{([^}]+)\}(.*?)$/);
    if (match) {
      const prefix = match[1];
      const inner = match[2];
      const suffix = match[3];

      const numRange = inner.match(/^(\d+)\.\.(\d+)$/);
      const letterRange = inner.match(/^([a-zA-Z])\.\.([a-zA-Z])$/);

      let items: string[] = [];
      if (numRange) {
        const start = parseInt(numRange[1], 10);
        const end = parseInt(numRange[2], 10);
        const pad = numRange[1].length === numRange[2].length && numRange[1].startsWith("0");
        const step = start <= end ? 1 : -1;
        for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
          const str = pad ? String(i).padStart(numRange[1].length, "0") : String(i);
          items.push(str);
        }
      } else if (letterRange) {
        const start = letterRange[1].charCodeAt(0);
        const end = letterRange[2].charCodeAt(0);
        const step = start <= end ? 1 : -1;
        for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
          items.push(String.fromCharCode(i));
        }
      } else {
        items = inner.split(",").map((s) => s.trim());
      }

      for (const item of items) {
        const expanded = expandBraces([`${prefix}${item}${suffix}`]);
        result.push(...expanded);
      }
    } else {
      result.push(token);
    }
  }

  return result;
}
