import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Terminal as TerminalIcon, Sun, Moon, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../lib/useTheme";
import { useSoundpack } from "../lib/useSoundpack";
import { SoundSettingsModal } from "./SoundSettingsModal";

interface NavbarProps {
  solvedCount: number;
  totalCount: number;
  totalPoints: number;
}

export default function Navbar({
  solvedCount,
  totalCount,
  totalPoints,
}: NavbarProps) {
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const location = useLocation();
  const isTerminal = location.pathname.startsWith("/terminal");
  const isCatalog = !isTerminal;
  const { isDark, toggleTheme } = useTheme();
  const { isEnabled, settings, metas } = useSoundpack();
  const activeMeta = metas.find((m) => m.id === settings.activePack);

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface-base)] border-b border-[var(--border-subtle)] px-4 lg:px-6 py-2.5 transition-colors duration-150 select-none">
      <div className="max-w-[1536px] mx-auto flex items-center justify-between gap-4">
        {/* Brand logo & title */}
        <Link
          to="/"
          className="flex items-center gap-2.5 cursor-pointer group apple-press"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-cyan)] font-mono font-bold text-sm shadow-sm group-hover:border-[var(--accent-cyan)]/50 transition-colors">
            &gt;_
          </div>
          <span className="font-semibold text-lg tracking-tight text-[var(--text-main)] transition-colors">
            Linux<span className="text-[var(--accent-cyan)]">Drill</span>
          </span>
        </Link>

        {/* Center navigation: Native macOS Segmented Control */}
        <nav className="hidden md:flex items-center gap-4">
          <div className="bg-[var(--surface-subtle)] p-1 rounded-xl border border-[var(--border-subtle)] flex items-center gap-1 shadow-inner">
            <Link
              to="/"
              className={`relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer apple-press flex items-center gap-2 ${
                isCatalog
                  ? "text-[var(--text-main)] font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              {isCatalog && (
                <motion.div
                  layoutId="navbar-active-pill"
                  transition={{ type: "spring", damping: 26, stiffness: 300 }}
                  className="absolute inset-0 bg-[var(--surface-elevated)] rounded-lg border border-[var(--border-strong)] shadow-sm -z-0"
                />
              )}
              <span className="relative z-10">Challenges</span>
              <span className="relative z-10 text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--accent-cyan-bg)] text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20 font-semibold">
                {solvedCount}/{totalCount}
              </span>
            </Link>

            <Link
              to="/terminal"
              className={`relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer apple-press flex items-center gap-2 ${
                isTerminal
                  ? "text-[var(--text-main)] font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              {isTerminal && (
                <motion.div
                  layoutId="navbar-active-pill"
                  transition={{ type: "spring", damping: 26, stiffness: 300 }}
                  className="absolute inset-0 bg-[var(--surface-elevated)] rounded-lg border border-[var(--border-strong)] shadow-sm -z-0"
                />
              )}
              <TerminalIcon className="relative z-10 w-3.5 h-3.5 text-[var(--accent-cyan)]" />
              <span className="relative z-10">Sandbox Terminal</span>
            </Link>
          </div>
        </nav>

        {/* Right status, metrics, SFX & Theme Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Contest Metrics Widget */}
          <div className="flex items-center gap-3 bg-[var(--surface-subtle)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-xl shadow-sm">
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] tracking-wider font-semibold">
                Score
              </span>
              <span className="text-xs font-mono font-bold text-[var(--accent-cyan)]">
                {totalPoints} PTS
              </span>
            </div>
            <div className="w-px h-5 bg-[var(--border-subtle)]" />
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] tracking-wider font-semibold">
                Solved
              </span>
              <span className="text-xs font-mono font-bold text-[var(--accent-green)]">
                {solvedCount}/{totalCount}
              </span>
            </div>
          </div>

          {/* Keystroke SFX Settings Button */}
          <button
            onClick={() => setIsSoundModalOpen(true)}
            className="relative w-8 h-8 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer apple-press shadow-sm group"
            title={
              isEnabled
                ? `Soundpack: ${activeMeta?.name || 'Active'} (${Math.round(settings.volume * 100)}%) - Click to configure`
                : "Keystroke sounds muted - Click to configure"
            }
            aria-label="Keystroke Soundpack Settings"
          >
            {isEnabled ? (
              <Volume2 className="w-4 h-4 text-[var(--accent-cyan)] group-hover:scale-105 transition-transform" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-400 group-hover:scale-105 transition-transform" />
            )}
            {isEnabled && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--accent-cyan)] ring-2 ring-[var(--surface-base)]" />
            )}
          </button>

          {/* Theme Toggle Button (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer apple-press shadow-sm"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Sun className="w-4 h-4 text-amber-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Moon className="w-4 h-4 text-sky-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Sound Settings Modal */}
      <SoundSettingsModal
        isOpen={isSoundModalOpen}
        onClose={() => setIsSoundModalOpen(false)}
      />
    </header>
  );
}
