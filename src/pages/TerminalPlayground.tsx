import { useState, useRef } from "react";
import Terminal, { type TerminalHandle } from "../components/Terminal";
import { ShellContext } from "../lib/vfs/commands";
import SimulatedFileManager from "../components/terminal/SimulatedFileManager";
import TerminalSettingsModal from "../components/terminal/TerminalSettingsModal";
import { useNavbarMode } from "../lib/useNavbarMode";

const TERMINAL_FONT_SIZE_KEY = "linuxdrill-terminal-font-size";
const FILE_TREE_FONT_SIZE_KEY = "linuxdrill-filetree-font-size";

export default function TerminalPlayground() {
  const [shell] = useState(() => new ShellContext());
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const terminalRef = useRef<TerminalHandle>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { navbarMode, setNavbarMode } = useNavbarMode();
  const isNavbarPinned = navbarMode === "always";

  // Terminal font size state persisted in localStorage (defaults to 13px)
  const [terminalFontSize, setTerminalFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(TERMINAL_FONT_SIZE_KEY);
      if (saved) {
        const parsed = Number(saved);
        if (parsed >= 11 && parsed <= 20) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return 13;
  });

  // File directory font size state persisted in localStorage (defaults to 12px)
  const [fileTreeFontSize, setFileTreeFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(FILE_TREE_FONT_SIZE_KEY);
      if (saved) {
        const parsed = Number(saved);
        if (parsed >= 10 && parsed <= 18) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return 12;
  });

  const handleTerminalFontSizeChange = (size: number) => {
    setTerminalFontSize(size);
    try {
      localStorage.setItem(TERMINAL_FONT_SIZE_KEY, String(size));
    } catch {
      // ignore storage errors
    }
  };

  const handleFileTreeFontSizeChange = (size: number) => {
    setFileTreeFontSize(size);
    try {
      localStorage.setItem(FILE_TREE_FONT_SIZE_KEY, String(size));
    } catch {
      // ignore storage errors
    }
  };

  return (
    <div
      className={`w-full ${isNavbarPinned ? "h-[calc(100vh-3.5rem)]" : "h-screen"} select-none flex flex-col p-0 m-0 overflow-hidden bg-[var(--surface-base)] transition-[height] duration-200`}
    >
      {/* 100% Full-Bleed Workspace Layout without outer padding or rounded borders */}
      <div className="w-full h-full flex flex-col md:flex-row overflow-hidden bg-[var(--surface-base)]">
        {/* Left Side: Simulated File Manager (read-only tree, updates via terminal) */}
        <div className="w-full md:w-64 lg:w-72 shrink-0 h-full border-b md:border-b-0 md:border-r border-white/5">
          <SimulatedFileManager
            shell={shell}
            refreshTrigger={refreshTrigger}
            fontSize={fileTreeFontSize}
            className="h-full border-none rounded-none shadow-none"
          />
        </div>

        {/* Right Side: Interactive CentOS Terminal */}
        <div className="flex-1 h-full min-w-0">
          <Terminal
            ref={terminalRef}
            shellContext={shell}
            title="CentOS Stream 9 (Sandbox)"
            defaultHeight="100%"
            className="h-full !rounded-none !border-0 !shadow-none"
            showGuideButton={true}
            hideHeaderActions={true}
            fontSize={terminalFontSize}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onCommandRun={() => setRefreshTrigger((prev) => prev + 1)}
          />
        </div>
      </div>

      {/* Sandbox Settings Modal (Dual Range Sliders for Terminal & File Directory text size + Navigation Bar Mode) */}
      <TerminalSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        terminalFontSize={terminalFontSize}
        onTerminalFontSizeChange={handleTerminalFontSizeChange}
        fileTreeFontSize={fileTreeFontSize}
        onFileTreeFontSizeChange={handleFileTreeFontSizeChange}
        navbarMode={navbarMode}
        onNavbarModeChange={setNavbarMode}
      />
    </div>
  );
}
