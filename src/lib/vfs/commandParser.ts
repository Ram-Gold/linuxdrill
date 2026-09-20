export interface ParsedCommand {
  raw: string;
  command: string;
  args: string[];
  redirect?: {
    file: string;
    append: boolean;
  };
  pipeNext?: ParsedCommand;
}

export function parseCommandLine(line: string): ParsedCommand[][] {
  // First split by '&&' or ';' for sequential execution chains
  // A command chain is an array of commands that execute in sequence
  const chains: ParsedCommand[][] = [];
  const rawChains = splitChaining(line.trim());

  for (const rawChain of rawChains) {
    const chainItems: ParsedCommand[] = [];
    const pipeParts = splitPipes(rawChain);

    let prevCmd: ParsedCommand | undefined = undefined;
    for (let i = pipeParts.length - 1; i >= 0; i--) {
      const part = pipeParts[i].trim();
      if (!part) continue;

      const parsed = parseSingleCommand(part);
      if (prevCmd) {
        parsed.pipeNext = prevCmd;
      }
      prevCmd = parsed;
    }

    if (prevCmd) {
      chainItems.push(prevCmd);
    }

    if (chainItems.length > 0) {
      chains.push(chainItems);
    }
  }

  return chains;
}

function splitChaining(input: string): string[] {
  const result: string[] = [];
  let current = "";
  let inDouble = false;
  let inSingle = false;

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
      result.push(current.trim());
      current = "";
      i++; // skip next '&'
    } else if (!inDouble && !inSingle && char === ";") {
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
  // Check for redirection: '>>' or '>'
  let redirect: { file: string; append: boolean } | undefined;
  let cmdPart = rawCmd;

  let inDouble = false;
  let inSingle = false;
  let redirIndex = -1;
  let isAppend = false;

  for (let i = 0; i < rawCmd.length; i++) {
    const char = rawCmd[i];
    const nextChar = rawCmd[i + 1];

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
    const filePart = rawCmd.slice(redirIndex + (isAppend ? 2 : 1)).trim();
    cmdPart = rawCmd.slice(0, redirIndex).trim();
    const cleanFile = filePart.split(/\s+/)[0].replace(/^["']|["']$/g, "");
    if (cleanFile) {
      redirect = { file: cleanFile, append: isAppend };
    }
  }

  // Tokenize args
  const tokens = tokenize(cmdPart);
  const expandedTokens = expandBraces(tokens);

  const command = expandedTokens[0] ?? "";
  const args = expandedTokens.slice(1);

  return {
    raw: rawCmd,
    command,
    args,
    redirect,
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

// Expand bash style {a,b,c} e.g. /home/student/lab/{docs,logs,scripts}
function expandBraces(tokens: string[]): string[] {
  const result: string[] = [];

  for (const token of tokens) {
    const match = token.match(/^(.*?)\{([^}]+)\}(.*?)$/);
    if (match) {
      const prefix = match[1];
      const items = match[2].split(",");
      const suffix = match[3];
      for (const item of items) {
        result.push(`${prefix}${item.trim()}${suffix}`);
      }
    } else {
      result.push(token);
    }
  }

  return result;
}
