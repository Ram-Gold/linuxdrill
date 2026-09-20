import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ShellContext } from "../lib/vfs/commands";
import type { HistoryItem } from "../lib/vfs/types";

interface TerminalProps {
  initialSetup?: string;
  className?: string;
  title?: string;
  defaultHeight?: string;
  onCommandRun?: (cmd: string) => void;
}

export default function Terminal({
  initialSetup,
  className = "",
  title = "CentOS Linux 9 (x86_64)",
  defaultHeight = "520px",
  onCommandRun,
}: TerminalProps) {
  const shellRef = useRef<ShellContext | null>(null);
  if (!shellRef.current) {
    shellRef.current = new ShellContext();
  }
  const shell = shellRef.current;

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(() => [
    {
      id: "init-1",
      command: "",
      user: "system",
      cwd: "",
      output: {
        stdout: `CentOS Stream release 9 (x86_64) - VMware Virtual Platform\nKernel 5.14.0-362.el9.x86_64 on an x86_64\nType 'help' for available commands or 'su -' for root.\n`,
        stderr: "",
        exitCode: 0,
      },
      timestamp: new Date(),
    },
  ]);

  const [inputVal, setInputVal] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isMaximized, setIsMaximized] = useState(false);
  const [setupRun, setSetupRun] = useState(false);
  const [copied, setCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [historyItems, inputVal]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const executeCommand = (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) {
      setHistoryItems((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          command: "",
          user: shell.session.username,
          cwd: shell.session.cwd,
          timestamp: new Date(),
        },
      ]);
      return;
    }

    const output = shell.execute(trimmed);
    onCommandRun?.(trimmed);

    if (output.clear) {
      setHistoryItems([]);
      return;
    }

    setHistoryItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        command: trimmed,
        user: shell.session.username,
        cwd: shell.session.cwd,
        output,
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Ctrl+L to clear
    if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      setHistoryItems([]);
      return;
    }

    // Ctrl+C to cancel current line
    if (e.ctrlKey && e.key === "c") {
      e.preventDefault();
      setHistoryItems((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          command: `${inputVal}^C`,
          user: shell.session.username,
          cwd: shell.session.cwd,
          timestamp: new Date(),
        },
      ]);
      setInputVal("");
      setHistoryIndex(-1);
      return;
    }

    // History UP
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const history = shell.history;
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(history[nextIndex] ?? "");
      return;
    }

    // History DOWN
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const history = shell.history;
      if (history.length === 0 || historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInputVal("");
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(history[nextIndex] ?? "");
      }
      return;
    }

    // Tab autocomplete
    if (e.key === "Tab") {
      e.preventDefault();
      handleAutocomplete();
      return;
    }

    // Enter to submit
    if (e.key === "Enter") {
      e.preventDefault();
      executeCommand(inputVal);
      setInputVal("");
      setHistoryIndex(-1);
    }
  };

  const handleAutocomplete = () => {
    const parts = inputVal.split(" ");
    const lastWord = parts[parts.length - 1];

    if (parts.length === 1) {
      // Command autocomplete
      const commands = [
        "ls", "cd", "pwd", "mkdir", "touch", "rm", "cp", "mv", "cat", "head",
        "tail", "grep", "find", "echo", "chmod", "chown", "chgrp", "tree", "wc",
        "stat", "df", "free", "uname", "whoami", "id", "groups", "su", "sudo",
        "useradd", "usermod", "userdel", "groupadd", "groupdel", "passwd",
        "systemctl", "service", "journalctl", "ip", "ifconfig", "hostname",
        "ping", "curl", "netstat", "ss", "firewall-cmd", "yum", "rpm", "tar",
        "date", "uptime", "clear", "history", "help",
      ];
      const match = commands.find((c) => c.startsWith(lastWord));
      if (match) {
        parts[0] = match;
        setInputVal(parts.join(" ") + " ");
      }
    } else {
      // Path autocomplete
      const dirNodes = shell.vfs.readdir(shell.session.cwd);
      if (dirNodes.nodes) {
        const match = dirNodes.nodes.find((n) => n.name.startsWith(lastWord));
        if (match) {
          parts[parts.length - 1] = match.name + (match.type === "dir" ? "/" : " ");
          setInputVal(parts.join(" "));
        }
      }
    }
  };

  const handleRunSetup = () => {
    if (!initialSetup) return;
    const lines = initialSetup
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));

    for (const line of lines) {
      executeCommand(line);
    }
    setSetupRun(true);
  };

  const handleReset = () => {
    shell.reset();
    setSetupRun(false);
    setHistoryItems([
      {
        id: Math.random().toString(),
        command: "",
        user: "system",
        cwd: "",
        output: {
          stdout: "[Virtual Machine Reset] Filesystem & services restored to clean contest baseline.\n",
          stderr: "",
          exitCode: 0,
        },
        timestamp: new Date(),
      },
    ]);
  };

  const handleCopy = () => {
    const text = historyItems
      .map((item) => (item.command ? `$ ${item.command}\n` : "") + (item.output?.stdout || item.output?.stderr || ""))
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRoot = shell.session.username === "root";
  const promptSymbol = isRoot ? "#" : "$";
  const displayCwd = shell.session.cwd === shell.session.homeDir ? "~" : shell.session.cwd;

  return (
    <div
      className={`flex flex-col rounded-xl border border-slate-800 bg-slate-950 font-mono shadow-2xl overflow-hidden transition-all ${
        isMaximized ? "fixed inset-4 z-50 h-[calc(100vh-2rem)]" : ""
      } ${className}`}
      style={{ height: isMaximized ? undefined : defaultHeight }}
      onClick={focusInput}
    >
      {/* Window Titlebar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2.5 backdrop-blur select-none">
        <div className="flex items-center space-x-2.5">
          <div className="flex space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80 hover:bg-red-500 cursor-pointer inline-block" onClick={() => setHistoryItems([])} title="Clear Screen" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 hover:bg-amber-500 cursor-pointer inline-block" onClick={handleReset} title="Reset VM" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 cursor-pointer inline-block" onClick={() => setIsMaximized(!isMaximized)} title="Maximize" />
          </div>
          <span className="text-xs font-semibold text-slate-300 ml-2">{title}</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
              isRoot ? "bg-rose-900/60 text-rose-300 border border-rose-700" : "bg-cyan-950/60 text-cyan-300 border border-cyan-800"
            }`}
          >
            {shell.session.username}@{shell.session.hostname}:{displayCwd}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          {initialSetup && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRunSetup();
              }}
              className={`flex items-center space-x-1 rounded px-2.5 py-1 text-xs font-medium transition ${
                setupRun
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
              title="Execute challenge setup script"
            >
              <span>{setupRun ? "Setup Loaded ✓" : "Run Setup"}</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            title="Reset Filesystem and Services"
          >
            Reset VM
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            title="Copy Output"
          >
            {copied ? "Copied!" : "Copy"}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMaximized(!isMaximized);
            }}
            className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            title={isMaximized ? "Restore Window" : "Expand Fullscreen"}
          >
            {isMaximized ? "Minimize" : "Maximize"}
          </button>
        </div>
      </div>

      {/* Terminal Screen Body */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 text-[13px] leading-relaxed text-slate-200 cursor-text select-text scrollbar-thin scrollbar-thumb-slate-800"
      >
        {historyItems.map((item) => (
          <div key={item.id} className="mb-2">
            {item.command && (
              <div className="flex items-start space-x-2 text-slate-300">
                <span className={item.user === "root" ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                  [{item.user}@{shell.session.hostname} {item.cwd === shell.session.homeDir ? "~" : item.cwd}]{item.user === "root" ? "#" : "$"}
                </span>
                <span className="font-semibold text-white break-all">{item.command}</span>
              </div>
            )}

            {item.output && (
              <div className="mt-1 whitespace-pre-wrap">
                {item.output.stdout && (
                  <span className="text-slate-300">{item.output.stdout}</span>
                )}
                {item.output.stderr && (
                  <span className="text-rose-400 font-medium">{item.output.stderr}</span>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Current Active Input Prompt */}
        <div className="flex items-center space-x-2">
          <span className={isRoot ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
            [{shell.session.username}@{shell.session.hostname} {displayCwd}]{promptSymbol}
          </span>
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-white outline-none border-none p-0 focus:ring-0 font-mono"
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
            />
          </div>
        </div>
      </div>

      {/* Terminal Footer Helper Bar */}
      <div className="flex items-center justify-between border-t border-slate-900 bg-slate-950/80 px-4 py-1.5 text-[11px] text-slate-500 select-none">
        <div className="flex space-x-3">
          <span><kbd className="text-slate-400 font-bold">Tab</kbd> Complete</span>
          <span><kbd className="text-slate-400 font-bold">↑/↓</kbd> History</span>
          <span><kbd className="text-slate-400 font-bold">Ctrl+L</kbd> Clear</span>
          <span><kbd className="text-slate-400 font-bold">Ctrl+C</kbd> Interrupt</span>
        </div>
        <div>
          <span>CentOS VM: <span className="text-emerald-400 font-medium">Ready</span></span>
        </div>
      </div>
    </div>
  );
}
