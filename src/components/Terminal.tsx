import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  Check,
  CheckSquare,
  Copy,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
} from "lucide-react";
import { ShellContext } from "../lib/vfs/commands";
import type { HistoryItem } from "../lib/vfs/types";

export interface TerminalHandle {
  getShell: () => ShellContext;
  runVerification: () => void;
  execute: (cmd: string) => void;
  appendOutput: (stdout: string, stderr?: string) => void;
  resetVm: () => void;
  runSetup: () => void;
}

interface TerminalProps {
  initialSetup?: string;
  className?: string;
  title?: string;
  defaultHeight?: string;
  onCommandRun?: (cmd: string) => void;
  onVerify?: (shell: ShellContext) => void;
  isSolved?: boolean;
  embedded?: boolean;
}

interface PagerState {
  active: boolean;
  title: string;
  content: string;
  lines: string[];
  searchQuery: string;
  searchMatches: number[];
  currentMatchIdx: number;
  isSearching: boolean;
}

const Terminal = forwardRef<TerminalHandle, TerminalProps>(function Terminal(
  {
    initialSetup,
    className = "",
    title = "CentOS Linux 9 (x86_64)",
    defaultHeight = "540px",
    onCommandRun,
    onVerify,
    isSolved = false,
    embedded = false,
  },
  ref
) {
  const [shell] = useState(() => new ShellContext());

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(() => [
    {
      id: "init-1",
      command: "",
      user: "system",
      cwd: "",
      output: {
        stdout: `CentOS Stream release 9 (x86_64) - Linux 5.14.0-362.el9.x86_64\nKernel 5.14.0-362.el9.x86_64 on an x86_64\nType 'help' for available commands or 'su -' for root.\nType 'man <cmd>' or '<cmd> --help' for manual pages.\nType 'verify' or 'check' to test your answer.\n`,
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

  // Pager state for interactive man / less
  const [pager, setPager] = useState<PagerState>({
    active: false,
    title: "",
    content: "",
    lines: [],
    searchQuery: "",
    searchMatches: [],
    currentMatchIdx: -1,
    isSearching: false,
  });
  const [scrollPercent, setScrollPercent] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pagerContainerRef = useRef<HTMLDivElement>(null);
  const pagerScrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll bash terminal to bottom
  useEffect(() => {
    if (containerRef.current && !pager.active) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [historyItems, inputVal, pager.active]);

  // Focus pager when it becomes active
  useEffect(() => {
    if (pager.active) {
      pagerContainerRef.current?.focus();
      if (pagerScrollRef.current) {
        pagerScrollRef.current.scrollTop = 0;
      }
    }
  }, [pager.active]);

  const focusInput = () => {
    if (!pager.active) {
      inputRef.current?.focus();
    }
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

    // Built-in check/verify command
    if ((trimmed === "verify" || trimmed === "check" || trimmed === "grade") && onVerify) {
      setHistoryItems((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          command: trimmed,
          user: shell.session.username,
          cwd: shell.session.cwd,
          output: {
            stdout: "[Verifier] Inspecting virtual environment and validating solution requirements...\n",
            stderr: "",
            exitCode: 0,
          },
          timestamp: new Date(),
        },
      ]);
      onVerify(shell);
      return;
    }

    if (trimmed === "reset") {
      handleReset();
      return;
    }

    const output = shell.execute(trimmed);
    onCommandRun?.(trimmed);

    if (output.clear) {
      setHistoryItems([]);
      return;
    }

    if (output.pager) {
      // Launch full-screen interactive pager (e.g. man or less)
      const lines = output.pager.content.split("\n");
      setPager({
        active: true,
        title: output.pager.title,
        content: output.pager.content,
        lines,
        searchQuery: "",
        searchMatches: [],
        currentMatchIdx: -1,
        isSearching: false,
      });

      // Also record the command in bash history
      setHistoryItems((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          command: trimmed,
          user: shell.session.username,
          cwd: shell.session.cwd,
          timestamp: new Date(),
        },
      ]);
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

  // Calculate scroll percent in pager
  const handlePagerScroll = () => {
    if (!pagerScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = pagerScrollRef.current;
    if (scrollHeight <= clientHeight) {
      setScrollPercent(100);
      return;
    }
    const pct = Math.min(100, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100));
    setScrollPercent(pct);
  };

  // Perform in-pager search
  const executePagerSearch = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setPager((p) => ({ ...p, isSearching: false }));
      pagerContainerRef.current?.focus();
      return;
    }

    const matches: number[] = [];
    pager.lines.forEach((line, idx) => {
      if (line.toLowerCase().includes(q)) {
        matches.push(idx);
      }
    });

    if (matches.length > 0) {
      setPager((p) => ({
        ...p,
        isSearching: false,
        searchQuery: query,
        searchMatches: matches,
        currentMatchIdx: 0,
      }));
      // Jump to first match
      scrollToPagerLine(matches[0]);
    } else {
      setPager((p) => ({
        ...p,
        isSearching: false,
        searchQuery: query,
        searchMatches: [],
        currentMatchIdx: -1,
      }));
    }
    pagerContainerRef.current?.focus();
  };

  const scrollToPagerLine = (lineIdx: number) => {
    const el = document.getElementById(`pager-line-${lineIdx}`);
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  };

  // Interactive Pager keyboard handler
  const handlePagerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!pager.active || pager.isSearching) return;

    // Exit pager on 'q' or 'Q'
    if (e.key === "q" || e.key === "Q") {
      e.preventDefault();
      e.stopPropagation();
      setPager((p) => ({ ...p, active: false }));
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }

    const scrollEl = pagerScrollRef.current;
    if (!scrollEl) return;

    const lineDelta = 26;
    const pageDelta = scrollEl.clientHeight * 0.85;

    // Scroll Down: j, DownArrow, Enter
    if (e.key === "j" || e.key === "ArrowDown" || e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      scrollEl.scrollTop += lineDelta;
    }
    // Scroll Up: k, UpArrow
    else if (e.key === "k" || e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      scrollEl.scrollTop -= lineDelta;
    }
    // Page Down: Space, PageDown, Ctrl+F
    else if (e.key === " " || e.key === "PageDown" || (e.ctrlKey && e.key === "f")) {
      e.preventDefault();
      e.stopPropagation();
      scrollEl.scrollTop += pageDelta;
    }
    // Page Up: b, PageUp, Ctrl+B
    else if (e.key === "b" || e.key === "PageUp" || (e.ctrlKey && e.key === "b")) {
      e.preventDefault();
      e.stopPropagation();
      scrollEl.scrollTop -= pageDelta;
    }
    // Top of page: g, Home
    else if (e.key === "g" || e.key === "Home") {
      e.preventDefault();
      e.stopPropagation();
      scrollEl.scrollTop = 0;
    }
    // Bottom of page: G, End
    else if (e.key === "G" || e.key === "End") {
      e.preventDefault();
      e.stopPropagation();
      scrollEl.scrollTop = scrollEl.scrollHeight;
    }
    // Search: /
    else if (e.key === "/") {
      e.preventDefault();
      e.stopPropagation();
      setPager((p) => ({ ...p, isSearching: true, searchQuery: "" }));
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    // Next search match: n
    else if (e.key === "n" && pager.searchMatches.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      const nextIdx = (pager.currentMatchIdx + 1) % pager.searchMatches.length;
      setPager((p) => ({ ...p, currentMatchIdx: nextIdx }));
      scrollToPagerLine(pager.searchMatches[nextIdx]);
    }
    // Previous search match: N
    else if (e.key === "N" && pager.searchMatches.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      const prevIdx = (pager.currentMatchIdx - 1 + pager.searchMatches.length) % pager.searchMatches.length;
      setPager((p) => ({ ...p, currentMatchIdx: prevIdx }));
      scrollToPagerLine(pager.searchMatches[prevIdx]);
    }
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
        "tail", "grep", "sed", "cut", "awk", "sort", "uniq", "du", "find", "echo",
        "chmod", "chown", "chgrp", "tree", "wc", "stat", "df", "free", "uname",
        "whoami", "id", "groups", "su", "sudo", "useradd", "usermod", "userdel",
        "groupadd", "groupdel", "passwd", "chage", "setfacl", "getfacl", "getenforce",
        "setenforce", "semanage", "systemctl", "service", "journalctl", "ip",
        "ifconfig", "hostname", "hostnamectl", "nmcli", "ping", "curl", "netstat",
        "ss", "firewall-cmd", "yum", "dnf", "rpm", "tar", "lsblk", "blkid",
        "pvcreate", "vgcreate", "lvcreate", "lvextend", "mkfs.xfs", "mount", "diff",
        "date", "uptime", "clear", "history", "help", "man", "less", "more", "verify", "check", "reset",
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
    const clean = initialSetup.replace(/```[a-z]*\n?/g, "").replace(/```/g, "").trim();
    executeCommand(clean);
    setSetupRun(true);
  };

  const handleReset = () => {
    shell.reset();
    setSetupRun(false);
    setPager((p) => ({ ...p, active: false }));
    setHistoryItems([
      {
        id: Math.random().toString(),
        command: "",
        user: "system",
        cwd: "",
        output: {
          stdout: "[Virtual Machine Reset] Filesystem & services restored to clean contest baseline.\nType 'verify' or 'check' when ready to test your solution.\n",
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

  // Expose imperative handle to parent
  useImperativeHandle(ref, () => ({
    getShell: () => shell,
    runVerification: () => onVerify?.(shell),
    execute: (cmd: string) => executeCommand(cmd),
    appendOutput: (stdout: string, stderr?: string) => {
      setHistoryItems((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          command: "",
          user: "system",
          cwd: shell.session.cwd,
          output: { stdout, stderr: stderr || "", exitCode: 0 },
          timestamp: new Date(),
        },
      ]);
    },
    resetVm: () => handleReset(),
    runSetup: () => handleRunSetup(),
  }));

  const isRoot = shell.session.username === "root";
  const promptSymbol = isRoot ? "#" : "$";
  const displayCwd = shell.session.cwd === shell.session.homeDir ? "~" : shell.session.cwd;

  return (
    <div
      className={`flex flex-col font-mono transition-all select-none ${
        embedded
          ? "h-full w-full bg-[#070a12] border-0 rounded-none shadow-none overflow-hidden"
          : "rounded-xl border border-slate-800 bg-[#090d16] shadow-xl overflow-hidden"
      } ${
        isMaximized
          ? "!fixed !inset-2 !z-50 !h-[calc(100vh-1rem)] !w-[calc(100vw-1rem)] !rounded-lg !border !border-slate-700 !shadow-2xl !bg-[#070a12]"
          : ""
      } ${className}`}
      style={{ height: isMaximized || embedded ? undefined : defaultHeight }}
      onClick={() => {
        if (!pager.active) {
          focusInput();
        } else {
          pagerContainerRef.current?.focus();
        }
      }}
    >
      {/* Window / Pane Titlebar */}
      <div
        className={`flex items-center justify-between border-b border-slate-800 bg-[#0a0e17] px-3 select-none gap-2 shrink-0 ${
          embedded ? "h-9" : "px-4 py-2.5"
        }`}
      >
        <div className="flex items-center space-x-2 text-xs">
          {embedded ? (
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-1.5 py-0.5 text-[11px] font-mono ${
                  isRoot
                    ? "bg-rose-950/60 text-rose-300 border border-rose-800/80"
                    : "bg-slate-900/60 text-slate-400 border border-slate-800"
                }`}
              >
                {shell.session.username}@{shell.session.hostname}:{displayCwd}
              </span>
            </div>
          ) : (
            <>
              {/* Traffic light dots */}
              <div className="flex space-x-1.5 mr-1">
                <span
                  className="h-2.5 w-2.5 rounded-full bg-red-500/80 hover:bg-red-500 cursor-pointer inline-block transition-colors"
                  onClick={() => setHistoryItems([])}
                  title="Clear Screen"
                />
                <span
                  className="h-2.5 w-2.5 rounded-full bg-amber-500/80 hover:bg-amber-500 cursor-pointer inline-block transition-colors"
                  onClick={handleReset}
                  title="Reset VM"
                />
                <span
                  className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 cursor-pointer inline-block transition-colors"
                  onClick={() => setIsMaximized(!isMaximized)}
                  title="Maximize"
                />
              </div>

              <span className="text-xs font-semibold text-slate-200 ml-1">{title}</span>

              <span
                className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                  isRoot
                    ? "bg-rose-900/60 text-rose-300 border border-rose-700"
                    : "bg-cyan-950/60 text-cyan-300 border border-cyan-800"
                }`}
              >
                {shell.session.username}@{shell.session.hostname}:{displayCwd}
              </span>

              <div className="hidden sm:flex items-center gap-1.5 ml-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  VM: Active
                </span>
              </div>

              {isSolved && (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-semibold px-1.5 py-0.5">
                  <Check className="w-3 h-3" />
                  <span>Solved</span>
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center space-x-1.5 text-xs">
          {onVerify && !embedded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVerify(shell);
              }}
              className="flex items-center space-x-1.5 rounded bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition cursor-pointer"
              title="Verify if solution meets problem requirements"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Check Answer</span>
            </button>
          )}

          {initialSetup && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRunSetup();
              }}
              className={`flex items-center space-x-1 rounded px-2 py-0.5 text-[11px] font-mono transition cursor-pointer border ${
                setupRun
                  ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                  : "bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border-amber-800/80"
              }`}
              title="Execute challenge setup script"
            >
              {setupRun ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Setup Ready</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  <span>Run Setup</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="flex items-center space-x-1 rounded border border-slate-800 bg-slate-900/80 px-2 py-0.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer text-[11px] font-mono"
            title="Reset VM State"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset VM</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="flex items-center space-x-1 rounded border border-slate-800 bg-slate-900/80 px-2 py-0.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer text-[11px] font-mono"
            title="Copy Terminal Output"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMaximized(!isMaximized);
            }}
            className="flex items-center space-x-1 rounded border border-slate-800 bg-slate-900/80 px-1.5 py-0.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer text-[11px]"
            title={isMaximized ? "Restore Split View" : "Maximize Terminal"}
          >
            {isMaximized ? (
              <Minimize2 className="w-3 h-3" />
            ) : (
              <Maximize2 className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {pager.active ? (
        /* ============================================================ */
        /* Interactive Pager View (less / man emulation)                */
        /* ============================================================ */
        <div
          ref={pagerContainerRef}
          tabIndex={0}
          onKeyDown={handlePagerKeyDown}
          className="flex-1 flex flex-col bg-[#090d16] outline-none focus:outline-none overflow-hidden select-text"
        >
          {/* Scrollable Text Viewport */}
          <div
            ref={pagerScrollRef}
            onScroll={handlePagerScroll}
            className="flex-1 overflow-y-auto p-4 text-[13px] leading-relaxed text-slate-200 scrollbar-thin scrollbar-thumb-slate-800"
          >
            {pager.lines.map((line, idx) => {
              const isMatch = pager.searchMatches.includes(idx);
              const isCurrentMatch = pager.searchMatches[pager.currentMatchIdx] === idx;
              const isHeader = /^[A-Z][A-Z\s]{2,}$/.test(line.trim());

              return (
                <div
                  key={idx}
                  id={`pager-line-${idx}`}
                  className={`whitespace-pre-wrap font-mono ${
                    isCurrentMatch
                      ? "bg-cyan-900/80 text-white font-bold px-1 rounded shadow-sm"
                      : isMatch
                      ? "bg-amber-950/70 text-amber-200 px-1 rounded"
                      : isHeader
                      ? "text-cyan-400 font-bold tracking-wider pt-2"
                      : "text-slate-300"
                  }`}
                >
                  {line || "\u00A0"}
                </div>
              );
            })}
          </div>

          {/* Authentic Less Pager Status / Search Bar */}
          {pager.isSearching ? (
            <div className="flex items-center text-xs font-mono bg-slate-900 border-t border-slate-800 px-3 py-1.5 text-cyan-300 shrink-0">
              <span className="font-bold mr-1.5 text-slate-400">/</span>
              <input
                ref={searchInputRef}
                type="text"
                autoFocus
                value={pager.searchQuery}
                onChange={(e) => setPager((p) => ({ ...p, searchQuery: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    executePagerSearch(pager.searchQuery);
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    e.stopPropagation();
                    setPager((p) => ({ ...p, isSearching: false }));
                    pagerContainerRef.current?.focus();
                  }
                }}
                className="bg-transparent border-none outline-none text-white w-full text-xs font-mono p-0 focus:ring-0"
                placeholder="search keyword (Enter to find, Esc to cancel)..."
              />
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] font-mono bg-slate-900 border-t border-slate-800 px-3 py-1.5 text-slate-300 select-none shrink-0">
              <div className="flex items-center gap-2">
                <span className="bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800 font-bold text-[10px]">
                  {pager.title}
                </span>
                <span className="text-slate-400 text-[10px]">
                  {scrollPercent}% (lines {pager.lines.length})
                </span>
                {pager.searchMatches.length > 0 && (
                  <span className="text-amber-400 text-[10px] font-bold">
                    [Match {pager.currentMatchIdx + 1}/{pager.searchMatches.length} · 'n'/'N' to cycle]
                  </span>
                )}
                {pager.searchQuery && pager.searchMatches.length === 0 && (
                  <span className="text-rose-400 text-[10px]">
                    Pattern not found: {pager.searchQuery}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5 text-slate-400 text-[10px]">
                <span>
                  <kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">Space</kbd> Next
                </span>
                <span>
                  <kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">j/k</kbd> Scroll
                </span>
                <span>
                  <kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded">/</kbd> Search
                </span>
                <span>
                  <kbd className="bg-cyan-900 text-cyan-200 px-1.5 py-0.5 rounded font-bold">q</kbd> Quit
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ============================================================ */
        /* Standard Interactive Bash Shell View                         */
        /* ============================================================ */
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-4 text-[13px] leading-relaxed text-slate-200 cursor-text select-text scrollbar-thin scrollbar-thumb-slate-800 bg-[#090d16]"
        >
          {historyItems.map((item) => (
            <div key={item.id} className="mb-2">
              {item.command && (
                <div className="flex items-start space-x-2 text-slate-300">
                  <span
                    className={
                      item.user === "root"
                        ? "text-rose-400 font-bold shrink-0"
                        : "text-emerald-400 font-bold shrink-0"
                    }
                  >
                    [{item.user}@{shell.session.hostname}{" "}
                    {item.cwd === shell.session.homeDir ? "~" : item.cwd}]
                    {item.user === "root" ? "#" : "$"}
                  </span>
                  <span className="font-semibold text-white break-all">{item.command}</span>
                </div>
              )}

              {item.output && (
                <div className="mt-1 whitespace-pre-wrap font-mono text-[12px]">
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
          <div className="flex items-center space-x-2 pt-1">
            <span
              className={
                isRoot
                  ? "text-rose-400 font-bold shrink-0"
                  : "text-emerald-400 font-bold shrink-0"
              }
            >
              [{shell.session.username}@{shell.session.hostname} {displayCwd}]
              {promptSymbol}
            </span>
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={(e) => {
                  const pasteData = e.clipboardData.getData("text");
                  if (pasteData.includes("\n")) {
                    e.preventDefault();
                    const clean = pasteData.replace(/```[a-z]*\n?/g, "").replace(/```/g, "").trim();
                    setInputVal("");
                    executeCommand(clean);
                  }
                }}
                className="w-full bg-transparent text-white outline-none border-none p-0 focus:ring-0 font-mono text-[13px]"
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                placeholder="Type bash command..."
              />
            </div>
          </div>
        </div>
      )}


    </div>
  );
});

export default Terminal;
