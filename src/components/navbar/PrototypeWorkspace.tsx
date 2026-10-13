import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Star,
  Terminal as TerminalIcon,
  Flame,
  Target,
  Sparkles,
  Trophy,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import BashistLogo from "../BashistLogo";
import { ThemeFlyout } from "./ThemeFlyout";
import { useNavbarCommon } from "./useNavbarCommon";
import { GithubIcon } from "./GithubIcon";
import { SoundSettingsModal } from "../SoundSettingsModal";

interface PrototypeWorkspaceProps {
  solvedCount: number;
  totalCount: number;
  totalPoints: number;
}

export function PrototypeWorkspace({
  solvedCount,
  totalCount,
  totalPoints,
}: PrototypeWorkspaceProps) {
  const {
    isChallenges,
    isDrills,
    isTerminal,
    isDark,
    toggleTheme,
    isSoundEnabled,
    isSoundModalOpen,
    setIsSoundModalOpen,
    isThemeDropdownOpen,
    setIsThemeDropdownOpen,
    stars,
    githubUrl,
  } = useNavbarCommon();

  const progressPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  // Hover mode on drill & sandbox pages
  const isHoverMode = isDrills || isTerminal;
  const [isHoverRevealed, setIsHoverRevealed] = useState(false);
  const hoverLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Keep revealed if mouse is inside or if modals/popovers are active
  const isRevealed = !isHoverMode || isHoverRevealed || isThemeDropdownOpen || isSoundModalOpen;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => clearTimeout(hoverLeaveTimerRef.current);
  }, []);

  // Pointer move handler to smoothly detect when pointer reaches left 16px of window
  useEffect(() => {
    if (!isHoverMode) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (e.clientX <= 16) {
        if (hoverLeaveTimerRef.current) {
          clearTimeout(hoverLeaveTimerRef.current);
        }
        setIsHoverRevealed(true);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [isHoverMode]);

  const handleMouseEnter = () => {
    if (isHoverMode) {
      if (hoverLeaveTimerRef.current) {
        clearTimeout(hoverLeaveTimerRef.current);
      }
      setIsHoverRevealed(true);
    }
  };

  const handleMouseLeave = () => {
    if (isHoverMode && !isThemeDropdownOpen && !isSoundModalOpen) {
      if (hoverLeaveTimerRef.current) {
        clearTimeout(hoverLeaveTimerRef.current);
      }
      hoverLeaveTimerRef.current = setTimeout(() => {
        setIsHoverRevealed(false);
      }, 260);
    }
  };

  return (
    <>
      {/* Invisible left hover trigger strip when in hover mode */}
      {isHoverMode && (
        <div
          onMouseEnter={handleMouseEnter}
          className="fixed top-0 bottom-0 left-0 w-4 z-40 pointer-events-auto"
          aria-hidden="true"
        />
      )}

      {/* Discreet vertical pill indicator peeking on left edge when in hover mode */}
      {isHoverMode && (
        <div
          onMouseEnter={handleMouseEnter}
          onClick={handleMouseEnter}
          className={`fixed left-0 top-1/2 -translate-y-1/2 z-40 pl-1 pr-2.5 py-4 cursor-pointer transition-all duration-300 group ${
            isRevealed ? "opacity-0 pointer-events-none -translate-x-full" : "opacity-100 translate-x-0"
          }`}
          title="Hover or click to reveal navigation sidebar"
          aria-label="Reveal navigation sidebar"
        >
          <div className="w-1.5 h-12 rounded-full bg-[var(--text-tertiary)]/40 group-hover:bg-[var(--accent-primary)] group-hover:h-16 group-hover:w-2 transition-all duration-200 shadow-sm" />
        </div>
      )}

      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`w-60 shrink-0 h-screen select-none flex flex-col justify-between p-4 bg-[var(--surface-base)] border-r border-[var(--border-subtle)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isHoverMode
            ? `fixed top-0 bottom-0 left-0 z-50 backdrop-blur-2xl shadow-2xl ${
                isRevealed
                  ? "translate-x-0 opacity-100 pointer-events-auto"
                  : "-translate-x-full opacity-0 pointer-events-none"
              }`
            : "sticky top-0 left-0 z-40 shadow-[2px_0_12px_rgba(0,0,0,0.03)]"
        }`}
        aria-label="Sidebar Navigation (Pro Workspace)"
      >
        {/* TOP SECTION: Branding & Points Card */}
        <div className="space-y-4">
          {/* Logo & Brand Header */}
          <Link
            to="/"
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[var(--surface-subtle)] transition-colors group mimo-press"
            title="Bashist Home"
          >
            <BashistLogo className="w-7 h-7 group-hover:scale-105 transition-transform" />
            <span className="text-base font-semibold tracking-tight text-[var(--text-main)] font-heading leading-tight">
              Bash<span className="text-[var(--accent-primary)]">ist</span>
            </span>
          </Link>

          {/* Points & Progress Card at Top */}
          <div className="p-3 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)]/70 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)]">
                <Trophy className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
                <span>Total Score</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--surface-base)] border border-[var(--border-subtle)]/60 text-xs font-mono font-bold text-[var(--accent-amber)]">
                <Sparkles className="w-3 h-3 fill-[var(--accent-amber)]" />
                <span>{totalPoints} pts</span>
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-tertiary)]">
                <span>Completed</span>
                <span className="text-[var(--text-main)] font-semibold">
                  {solvedCount} / {totalCount} ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--surface-active)]/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-amber)]"
                />
              </div>
            </div>
          </div>

          {/* MIDDLE: Minimal Navigation Menu */}
          <nav className="space-y-1.5" aria-label="Main Navigation">
            {/* Challenges */}
            <Link
              to="/"
              className={`w-full p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs group mimo-press ${
                isChallenges
                  ? "bg-[var(--surface-active)] border-[var(--accent-primary)] text-[var(--text-main)] font-semibold shadow-xs"
                  : "bg-transparent border-transparent hover:bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Target
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isChallenges
                      ? "text-[var(--accent-primary)]"
                      : "text-[var(--text-tertiary)] group-hover:text-[var(--text-main)]"
                  }`}
                />
                <span className="truncate">Challenges</span>
              </div>
            </Link>

            {/* Drill */}
            <Link
              to="/drills"
              className={`w-full p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs group mimo-press ${
                isDrills
                  ? "bg-[var(--surface-active)] border-[var(--accent-primary)] text-[var(--text-main)] font-semibold shadow-xs"
                  : "bg-transparent border-transparent hover:bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Flame
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isDrills
                      ? "text-[var(--accent-primary)]"
                      : "text-[var(--text-tertiary)] group-hover:text-[var(--text-main)]"
                  }`}
                />
                <span className="truncate">Drill</span>
              </div>
            </Link>

            {/* Sandbox */}
            <Link
              to="/terminal"
              className={`w-full p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs group mimo-press ${
                isTerminal
                  ? "bg-[var(--surface-active)] border-[var(--accent-primary)] text-[var(--text-main)] font-semibold shadow-xs"
                  : "bg-transparent border-transparent hover:bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <TerminalIcon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isTerminal
                      ? "text-[var(--accent-primary)]"
                      : "text-[var(--text-tertiary)] group-hover:text-[var(--text-main)]"
                  }`}
                />
                <span className="truncate">Sandbox</span>
              </div>
            </Link>
          </nav>
        </div>

        {/* BOTTOM LEFT: Utilities & GitHub Card */}
        <div className="space-y-2 pt-4 border-t border-[var(--border-subtle)]">
          {/* Action icon row */}
          <div className="flex items-center gap-2 w-full">
            {/* Sound Modal */}
            <button
              onClick={() => setIsSoundModalOpen(true)}
              className="flex-1 h-9 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] border border-[var(--border-subtle)]/70 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer mimo-press"
              title="Keystroke Soundpack Settings"
              aria-label="Keystroke Soundpack Settings"
            >
              {isSoundEnabled ? (
                <Volume2 className="w-4 h-4 text-[var(--accent-primary-soft)]" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Themes Flyout */}
            <div className="flex-1">
              <ThemeFlyout
                isOpen={isThemeDropdownOpen}
                onToggle={() => setIsThemeDropdownOpen((prev) => !prev)}
                onClose={() => setIsThemeDropdownOpen(false)}
                align="bottom"
                className="w-full"
                triggerClassName="w-full h-9 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] border border-[var(--border-subtle)]/70 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer mimo-press"
              />
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={(e) => toggleTheme(e.currentTarget)}
              className="flex-1 h-9 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] border border-[var(--border-subtle)]/70 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer mimo-press"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.div
                    key="sun"
                    initial={{ opacity: 0, rotate: -30 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 30 }}
                    transition={{ duration: 0.12 }}
                  >
                    <Sun className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ opacity: 0, rotate: -30 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 30 }}
                    transition={{ duration: 0.12 }}
                  >
                    <Moon className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* GitHub Repo Card */}
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-2.5 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] border border-[var(--border-subtle)]/70 flex items-center justify-between text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all group mimo-press"
            title="Star Ram-Gold/bashist on GitHub"
          >
            <div className="flex items-center gap-2 min-w-0">
              <GithubIcon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              <span className="font-mono text-[11px] truncate">Ram-Gold/bashist</span>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[var(--surface-base)] border border-[var(--border-subtle)]/60 text-[10px] font-mono text-[var(--text-muted)] group-hover:text-[var(--text-main)] shrink-0">
              <Star className="w-3 h-3 text-[var(--accent-amber)] fill-[var(--accent-amber)]" />
              <span>{stars !== null ? stars : "0"}</span>
            </div>
          </a>
        </div>
      </aside>

      {/* Sound Settings Modal */}
      <SoundSettingsModal
        isOpen={isSoundModalOpen}
        onClose={() => setIsSoundModalOpen(false)}
      />
    </>
  );
}
