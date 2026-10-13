import React, { useState, useEffect, useRef, useCallback } from "react";
import { Save, LogOut, Sparkles } from "lucide-react";

export interface TerminalEditorProps {
  type: "nano" | "vim";
  filePath: string;
  resolvedPath: string;
  initialContent: string;
  isNewFile: boolean;
  onSave: (content: string, targetPath?: string) => { success: boolean; error?: string };
  onClose: (saved: boolean) => void;
  fontSize?: number;
}

export default function TerminalEditor({
  type,
  filePath,
  initialContent,
  isNewFile,
  onSave,
  onClose,
  fontSize = 13,
}: TerminalEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isModified, setIsModified] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    type === "nano"
      ? isNewFile
        ? `[ New File ]`
        : `[ Read ${initialContent.split("\n").length} lines ]`
      : isNewFile
      ? `"${filePath}" [New File]`
      : `"${filePath}" ${initialContent.split("\n").length}L, ${initialContent.length}B`
  );

  // Vim modal states
  // mode: "NORMAL" | "INSERT" | "COMMAND"
  const [vimMode, setVimMode] = useState<"NORMAL" | "INSERT" | "COMMAND">("NORMAL");
  const [vimCommandInput, setVimCommandInput] = useState("");
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // Nano prompt states (e.g. WriteOut filename prompt, Exit confirmation prompt)
  const [nanoPrompt, setNanoPrompt] = useState<{
    type: "save_as" | "confirm_exit";
    inputVal?: string;
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Focus management
  useEffect(() => {
    if (type === "nano") {
      textareaRef.current?.focus();
    } else {
      editorContainerRef.current?.focus();
    }
  }, [type]);

  useEffect(() => {
    if (vimMode === "INSERT") {
      textareaRef.current?.focus();
    } else if (vimMode === "COMMAND") {
      commandInputRef.current?.focus();
    } else if (vimMode === "NORMAL") {
      editorContainerRef.current?.focus();
    }
  }, [vimMode]);

  // Update cursor line and column from textarea
  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const { selectionStart, value } = textareaRef.current;
    const textBefore = value.substring(0, selectionStart);
    const lines = textBefore.split("\n");
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    setCursorPos({ line, col });
  };

  // Perform save
  const handlePerformSave = useCallback(
    (customFileName?: string) => {
      const res = onSave(content, customFileName);
      if (res.success) {
        setIsModified(false);
        const lineCount = content.split("\n").length;
        const charCount = content.length;
        if (type === "nano") {
          setStatusMessage(`[ Wrote ${lineCount} lines (${charCount} bytes) ]`);
        } else {
          setStatusMessage(`"${customFileName || filePath}" ${lineCount}L, ${charCount}B written`);
        }
        return true;
      } else {
        setStatusMessage(`Error writing ${filePath}: ${res.error || "Permission denied"}`);
        return false;
      }
    },
    [content, filePath, onSave, type]
  );

  // Nano key handler
  const handleNanoKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>) => {
    if (nanoPrompt) return;

    if (e.ctrlKey) {
      const key = e.key.toLowerCase();
      if (key === "o") {
        // WriteOut
        e.preventDefault();
        e.stopPropagation();
        setNanoPrompt({
          type: "save_as",
          inputVal: filePath,
        });
        return;
      }

      if (key === "x") {
        // Exit
        e.preventDefault();
        e.stopPropagation();
        if (isModified) {
          setNanoPrompt({
            type: "confirm_exit",
            inputVal: "Y",
          });
        } else {
          onClose(false);
        }
        return;
      }

      if (key === "k") {
        // Cut line (nano feature simulation)
        e.preventDefault();
        if (textareaRef.current) {
          const ta = textareaRef.current;
          const pos = ta.selectionStart;
          const lines = content.split("\n");
          let charIdx = 0;
          let targetLineIdx = 0;
          for (let i = 0; i < lines.length; i++) {
            const nextIdx = charIdx + lines[i].length + 1;
            if (pos >= charIdx && pos <= nextIdx) {
              targetLineIdx = i;
              break;
            }
            charIdx = nextIdx;
          }
          lines.splice(targetLineIdx, 1);
          const newContent = lines.join("\n");
          setContent(newContent);
          setIsModified(true);
          setStatusMessage(`[ Cut 1 line ]`);
        }
        return;
      }

      if (key === "c") {
        // Show current pos
        e.preventDefault();
        setStatusMessage(`line ${cursorPos.line}/${content.split("\n").length} (col ${cursorPos.col})`);
        return;
      }
    }

    if (e.key === "Tab") {
      e.preventDefault();
      // Insert 2 spaces or tab
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const nextContent = content.substring(0, start) + "  " + content.substring(end);
      setContent(nextContent);
      setIsModified(true);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Vim Normal Mode key handler
  const handleVimNormalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (vimMode !== "NORMAL") return;

    if (e.key === ":") {
      e.preventDefault();
      setVimMode("COMMAND");
      setVimCommandInput("");
      return;
    }

    if (e.key === "i") {
      e.preventDefault();
      setVimMode("INSERT");
      return;
    }

    if (e.key === "a") {
      e.preventDefault();
      setVimMode("INSERT");
      // Advance cursor one char if possible
      if (textareaRef.current) {
        const cur = textareaRef.current.selectionStart;
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = cur + 1;
      }
      return;
    }

    if (e.key === "o") {
      e.preventDefault();
      // Insert new line below and switch to insert
      if (textareaRef.current) {
        const ta = textareaRef.current;
        const cur = ta.selectionStart;
        const lines = content.split("\n");
        let charIdx = 0;
        let lineIdx = 0;
        for (let i = 0; i < lines.length; i++) {
          const next = charIdx + lines[i].length + 1;
          if (cur >= charIdx && cur <= next) {
            lineIdx = i;
            break;
          }
          charIdx = next;
        }
        lines.splice(lineIdx + 1, 0, "");
        const nextContent = lines.join("\n");
        setContent(nextContent);
        setIsModified(true);
        setVimMode("INSERT");
      }
      return;
    }

    if (e.key === "u") {
      // Undo back to initial
      e.preventDefault();
      setContent(initialContent);
      setIsModified(false);
      setStatusMessage("1 change; before #1");
      return;
    }

    if (e.key === "Escape") {
      setStatusMessage("");
      return;
    }
  };

  // Vim Command Mode execution (:w, :q, :wq, :q!, :x)
  const executeVimCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (trimmed === "w" || trimmed === "write") {
      handlePerformSave();
      setVimMode("NORMAL");
    } else if (trimmed === "q" || trimmed === "quit") {
      if (isModified) {
        setStatusMessage("E37: No write since last change (add ! to override)");
        setVimMode("NORMAL");
      } else {
        onClose(false);
      }
    } else if (trimmed === "q!" || trimmed === "quit!") {
      onClose(false);
    } else if (trimmed === "wq" || trimmed === "x") {
      const ok = handlePerformSave();
      if (ok) {
        onClose(true);
      } else {
        setVimMode("NORMAL");
      }
    } else if (trimmed.startsWith("w ") || trimmed.startsWith("write ")) {
      const customName = trimmed.replace(/^w(rite)?\s+/, "").trim();
      if (customName) {
        handlePerformSave(customName);
      }
      setVimMode("NORMAL");
    } else if (trimmed === "help") {
      setStatusMessage("Commands: :w (save), :q (quit), :wq / :x (save & quit), :q! (force quit)");
      setVimMode("NORMAL");
    } else {
      setStatusMessage(`E492: Not an editor command: ${trimmed}`);
      setVimMode("NORMAL");
    }
  };

  const lines = content.split("\n");

  return (
    <div
      ref={editorContainerRef}
      tabIndex={0}
      onKeyDown={type === "vim" && vimMode === "NORMAL" ? handleVimNormalKeyDown : undefined}
      className="relative flex flex-col w-full h-full bg-[#12141a] text-[#d4d4d8] font-mono outline-none select-none overflow-hidden"
      style={{ fontSize: `${fontSize}px` }}
    >
      {/* NANO TOP BAR */}
      {type === "nano" && (
        <div className="flex items-center justify-between px-3 py-1 bg-[#1e222d] text-[#e4e4e7] border-b border-white/10 shrink-0 font-medium">
          <span className="text-emerald-400 font-semibold">GNU nano 7.2</span>
          <span className="text-zinc-200 truncate max-w-[280px] sm:max-w-[400px]">
            File: {filePath} {isModified ? <span className="text-amber-400 font-bold">* Modified</span> : ""}
          </span>
          <span className="text-zinc-400 text-xs hidden sm:inline">
            L:{cursorPos.line} C:{cursorPos.col}
          </span>
        </div>
      )}

      {/* VIM TOP BAR (Minimal vintage terminal ruler) */}
      {type === "vim" && (
        <div className="flex items-center justify-between px-3 py-1 bg-[#181a20] text-zinc-400 border-b border-white/5 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold uppercase text-[10px]">
              VIM
            </span>
            <span className="text-zinc-300 font-medium truncate max-w-[260px] sm:max-w-md">
              {filePath} {isModified ? "[+]" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span>{isNewFile ? "[New File]" : `${lines.length} lines`}</span>
            <span>·</span>
            <span>
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
          </div>
        </div>
      )}

      {/* EDITOR MAIN TEXT AREA WITH LINE NUMBERS / TILDE */}
      <div className="relative flex-1 flex overflow-hidden bg-[#0c0d12]">
        {/* Line Gutter */}
        <div className="py-2 pl-2 pr-2 text-right bg-[#0f1117] text-zinc-600 select-none border-r border-white/5 shrink-0 min-w-[3rem]">
          {lines.map((_, i) => (
            <div
              key={i}
              className={`leading-relaxed text-xs transition-colors ${
                cursorPos.line === i + 1 ? "text-amber-400 font-bold" : "text-zinc-600"
              }`}
            >
              {i + 1}
            </div>
          ))}
          {type === "vim" &&
            Array.from({ length: Math.max(0, 16 - lines.length) }).map((_, i) => (
              <div key={`tilde-${i}`} className="leading-relaxed text-xs text-sky-600 font-bold">
                ~
              </div>
            ))}
        </div>

        {/* Text Area */}
        <div className="relative flex-1 h-full overflow-hidden">
          <textarea
            ref={textareaRef}
            readOnly={type === "vim" && vimMode !== "INSERT"}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setIsModified(true);
              updateCursorPosition();
            }}
            onKeyUp={updateCursorPosition}
            onClick={updateCursorPosition}
            onKeyDown={(e) => {
              if (type === "nano") {
                handleNanoKeyDown(e);
              } else if (type === "vim") {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setVimMode("NORMAL");
                  setStatusMessage("");
                } else if (vimMode !== "INSERT") {
                  e.preventDefault();
                  handleVimNormalKeyDown(e as unknown as React.KeyboardEvent<HTMLDivElement>);
                }
              }
            }}
            spellCheck={false}
            className={`w-full h-full p-2 bg-transparent text-[#e4e4e7] leading-relaxed resize-none border-none outline-none font-mono focus:ring-0 ${
              type === "vim" && vimMode !== "INSERT" ? "cursor-default" : "cursor-text"
            }`}
            style={{ fontSize: `${fontSize}px` }}
            placeholder={
              type === "vim"
                ? vimMode === "NORMAL"
                  ? "Press 'i' to enter INSERT mode and begin typing bash commands..."
                  : "Type bash commands or scripts here..."
                : "Type bash commands or scripts here... (Ctrl+O to save, Ctrl+X to exit)"
            }
          />
        </div>
      </div>

      {/* QUICK TOUCH ACTION TOOLBAR (MOBILE & TOUCH FRIENDLY) */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#14161f] border-t border-white/10 shrink-0 overflow-x-auto text-xs no-scrollbar">
        <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1 shrink-0">Quick Bar:</span>

        {type === "nano" ? (
          <>
            <button
              type="button"
              onClick={() => {
                setNanoPrompt({ type: "save_as", inputVal: filePath });
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-medium active:scale-95 transition-all"
            >
              <Save className="w-3 h-3" />
              <span>^O Save</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (isModified) {
                  setNanoPrompt({ type: "confirm_exit", inputVal: "Y" });
                } else {
                  onClose(false);
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-medium active:scale-95 transition-all"
            >
              <LogOut className="w-3 h-3" />
              <span>^X Exit</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (textareaRef.current) {
                  const ta = textareaRef.current;
                  const pos = ta.selectionStart;
                  const next = content.substring(0, pos) + "  " + content.substring(pos);
                  setContent(next);
                  setIsModified(true);
                  ta.focus();
                }
              }}
              className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/5 font-mono"
            >
              Tab
            </button>
            <button
              type="button"
              onClick={() => {
                if (textareaRef.current) {
                  const ta = textareaRef.current;
                  const template = `#!/bin/bash\n# Author: student\necho "Starting script..."\n`;
                  const next = template + content;
                  setContent(next);
                  setIsModified(true);
                  ta.focus();
                }
              }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30"
            >
              <Sparkles className="w-3 h-3" />
              <span>+ #!/bin/bash</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                if (vimMode === "INSERT") {
                  setVimMode("NORMAL");
                  setStatusMessage("");
                } else {
                  setVimMode("INSERT");
                }
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border font-semibold active:scale-95 transition-all ${
                vimMode === "INSERT"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-white/10"
              }`}
            >
              <span>{vimMode === "INSERT" ? "Esc (Normal)" : "i (Insert)"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handlePerformSave();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-medium active:scale-95 transition-all"
            >
              <Save className="w-3 h-3" />
              <span>:w Save</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const ok = handlePerformSave();
                if (ok) onClose(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 font-medium active:scale-95 transition-all"
            >
              <span>:wq Save & Exit</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose(false);
              }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 active:scale-95 transition-all"
            >
              <LogOut className="w-3 h-3" />
              <span>:q! Quit</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const template = `#!/bin/bash\n# Bash script\nset -e\n\necho "Running $0"\n`;
                setContent(template + content);
                setIsModified(true);
                setVimMode("INSERT");
              }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30"
            >
              <Sparkles className="w-3 h-3" />
              <span>+ Shebang</span>
            </button>
          </>
        )}
      </div>

      {/* BOTTOM STATUS BAR OR INTERACTIVE PROMPT */}
      {type === "nano" ? (
        <div className="shrink-0 bg-[#161821] border-t border-white/10 select-none">
          {/* Nano Prompt Row (WriteOut or Confirm Exit) */}
          {nanoPrompt ? (
            <div className="px-3 py-1.5 bg-[#252836] text-white flex items-center gap-2 text-xs font-mono">
              <span className="font-bold text-amber-300">
                {nanoPrompt.type === "save_as"
                  ? "File Name to Write:"
                  : "Save modified buffer (ANSWERING \"No\" WILL DESTROY CHANGES) ?"}
              </span>
              {nanoPrompt.type === "save_as" ? (
                <input
                  type="text"
                  autoFocus
                  defaultValue={nanoPrompt.inputVal || filePath}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const targetName = e.currentTarget.value.trim() || filePath;
                      handlePerformSave(targetName);
                      setNanoPrompt(null);
                      textareaRef.current?.focus();
                    } else if (e.key === "Escape") {
                      setNanoPrompt(null);
                      textareaRef.current?.focus();
                    }
                  }}
                  className="bg-black/40 border border-white/20 text-white px-2 py-0.5 rounded text-xs outline-none flex-1 font-mono focus:border-amber-400"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-zinc-400">Y: Yes, N: No, ^C: Cancel</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        handlePerformSave();
                        onClose(true);
                      }}
                      className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold"
                    >
                      Y (Yes)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose(false);
                      }}
                      className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold"
                    >
                      N (Discard)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNanoPrompt(null);
                        textareaRef.current?.focus();
                      }}
                      className="px-2 py-0.5 rounded bg-zinc-700 text-zinc-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="px-3 py-1 text-xs text-zinc-300 font-mono">
              {statusMessage || "\u00A0"}
            </div>
          )}

          {/* Genuine 2-Row Nano Shortcut Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-x-2 gap-y-0.5 px-3 py-1.5 text-[11px] font-mono bg-[#11131a] text-zinc-400 border-t border-white/5">
            <div>
              <span className="font-bold text-white bg-zinc-800 px-1 py-0.2 rounded mr-1">^G</span> Get Help
            </div>
            <div>
              <span className="font-bold text-white bg-zinc-800 px-1 py-0.2 rounded mr-1">^O</span> WriteOut
            </div>
            <div>
              <span className="font-bold text-white bg-zinc-800 px-1 py-0.2 rounded mr-1">^W</span> Where Is
            </div>
            <div>
              <span className="font-bold text-white bg-zinc-800 px-1 py-0.2 rounded mr-1">^K</span> Cut
            </div>
            <div>
              <span className="font-bold text-white bg-zinc-800 px-1 py-0.2 rounded mr-1">^J</span> Justify
            </div>
            <div>
              <span className="font-bold text-white bg-zinc-800 px-1 py-0.2 rounded mr-1">^C</span> Cur Pos
            </div>
            <div>
              <span className="font-bold text-white bg-zinc-800 px-1 py-0.2 rounded mr-1">^X</span> Exit
            </div>
            <div>
              <span className="font-bold text-white bg-zinc-800 px-1 py-0.2 rounded mr-1">^R</span> Read File
            </div>
            <div>
              <span className="font-bold text-white bg-zinc-800 px-1 py-0.2 rounded mr-1">^\</span> Replace
            </div>
            <div>
              <span className="font-bold text-white bg-zinc-800 px-1 py-0.2 rounded mr-1">^U</span> Paste
            </div>
            <div>
              <span className="font-bold text-white bg-zinc-800 px-1 py-0.2 rounded mr-1">^T</span> Execute
            </div>
            <div>
              <span className="font-bold text-white bg-zinc-800 px-1 py-0.2 rounded mr-1">^_</span> Go To Line
            </div>
          </div>
        </div>
      ) : (
        /* VIM BOTTOM BAR */
        <div className="shrink-0 bg-[#14161f] border-t border-white/10 px-3 py-1 text-xs font-mono flex items-center justify-between min-h-[28px]">
          {vimMode === "COMMAND" ? (
            <div className="flex items-center w-full gap-1 text-amber-300">
              <span className="font-bold text-sm">:</span>
              <input
                ref={commandInputRef}
                type="text"
                value={vimCommandInput}
                onChange={(e) => setVimCommandInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    executeVimCommand(vimCommandInput);
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    setVimMode("NORMAL");
                  }
                }}
                className="bg-transparent border-none outline-none text-white w-full text-xs font-mono p-0 focus:ring-0"
                placeholder="w (save), q (quit), wq (save & exit), q! (quit without saving)"
              />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                {vimMode === "INSERT" ? (
                  <span className="font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-sm text-[11px] tracking-wider animate-pulse">
                    -- INSERT --
                  </span>
                ) : (
                  <span className="font-semibold text-zinc-400 text-[11px] uppercase tracking-wide">
                    NORMAL
                  </span>
                )}
                {statusMessage && (
                  <span
                    className={
                      statusMessage.startsWith("E") || statusMessage.includes("Error")
                        ? "text-rose-400 font-semibold"
                        : "text-zinc-300"
                    }
                  >
                    {statusMessage}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-zinc-500 text-[11px]">
                <span className="hidden sm:inline">
                  {cursorPos.line},{cursorPos.col}
                </span>
                <span>
                  {Math.round((cursorPos.line / Math.max(1, lines.length)) * 100)}%
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
