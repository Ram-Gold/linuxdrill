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
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import BashistLogo from "../BashistLogo";
import { ThemeFlyout } from "./ThemeFlyout";
import { useNavbarCommon } from "./useNavbarCommon";
import { GithubIcon } from "./GithubIcon";
import { SoundSettingsModal } from "../SoundSettingsModal";

interface PrototypeDockProps {
  solvedCount: number;
  totalCount: number;
  totalPoints: number;
}

export function PrototypeDock({
  solvedCount,
  totalCount,
  totalPoints,
}: PrototypeDockProps) {
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

  return (
    <>
      <aside
        className="w-[78px] shrink-0 h-screen sticky top-0 left-0 z-40 flex flex-col items-center justify-between py-4 px-2.5 bg-[var(--surface-base)] border-r border-[var(--border-subtle)] shadow-[2px_0_12px_rgba(0,0,0,0.03)] transition-colors select-none"
        aria-label="Sidebar Navigation (Capsule Dock)"
      >
        {/* TOP: Logo + Points Display */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Logo */}
          <Link
            to="/"
            className="group flex flex-col items-center p-1.5 rounded-2xl hover:bg-[var(--surface-subtle)] transition-all mimo-press"
            title="Bashist Home"
          >
            <BashistLogo className="w-8 h-8 group-hover:scale-108 transition-transform duration-200" />
          </Link>

          {/* Points Pill at Top */}
          <div
            className="w-full flex flex-col items-center py-1.5 px-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)]/70 text-center group cursor-default transition-all hover:border-[var(--accent-amber)]/40 hover:shadow-xs"
            title={`${totalPoints} Points Earned (${solvedCount}/${totalCount} Challenges Completed)`}
          >
            <div className="flex items-center gap-1 text-[var(--accent-amber)]">
              <Sparkles className="w-3 h-3 fill-[var(--accent-amber)] animate-pulse" />
              <span className="text-xs font-bold font-mono tracking-tight text-[var(--text-main)]">
                {totalPoints}
              </span>
            </div>
            <span className="text-[10px] font-mono font-medium text-[var(--accent-amber)] uppercase tracking-wider leading-none mt-0.5">
              pts
            </span>

            {/* Solved ratio mini badge */}
            <div className="mt-1 pt-1 border-t border-[var(--border-subtle)]/60 w-4/5 text-[10px] font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-muted)]">
              {solvedCount}/{totalCount}
            </div>
          </div>
        </div>

        {/* CENTER: Navigation Links (Vertical Segmented Capsule) */}
        <nav className="flex flex-col items-center gap-2 w-full p-1 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)]/50">
          {/* Challenges */}
          <Link
            to="/"
            className={`relative w-full py-2.5 px-1 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors group mimo-press ${
              isChallenges
                ? "text-[var(--text-main)] font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
            title="Challenges"
          >
            {isChallenges && (
              <motion.div
                layoutId="dock-active-pill"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className="absolute inset-0 bg-[var(--surface-base)] rounded-xl shadow-xs border border-[var(--border-subtle)]/80"
              />
            )}
            <Target
              className={`w-4 h-4 relative z-10 transition-transform group-hover:scale-110 ${
                isChallenges ? "text-[var(--accent-primary)]" : ""
              }`}
            />
            <span className="text-[10px] tracking-tight mt-1 relative z-10 font-medium leading-none">
              Challenges
            </span>
          </Link>

          {/* Drills */}
          <Link
            to="/drills"
            className={`relative w-full py-2.5 px-1 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors group mimo-press ${
              isDrills
                ? "text-[var(--text-main)] font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
            title="Drills"
          >
            {isDrills && (
              <motion.div
                layoutId="dock-active-pill"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className="absolute inset-0 bg-[var(--surface-base)] rounded-xl shadow-xs border border-[var(--border-subtle)]/80"
              />
            )}
            <Flame
              className={`w-4 h-4 relative z-10 transition-transform group-hover:scale-110 ${
                isDrills ? "text-[var(--accent-primary)]" : ""
              }`}
            />
            <span className="text-[10px] tracking-tight mt-1 relative z-10 font-medium leading-none">
              Drills
            </span>
          </Link>

          {/* Sandbox */}
          <Link
            to="/terminal"
            className={`relative w-full py-2.5 px-1 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors group mimo-press ${
              isTerminal
                ? "text-[var(--text-main)] font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
            title="Sandbox"
          >
            {isTerminal && (
              <motion.div
                layoutId="dock-active-pill"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className="absolute inset-0 bg-[var(--surface-base)] rounded-xl shadow-xs border border-[var(--border-subtle)]/80"
              />
            )}
            <TerminalIcon
              className={`w-4 h-4 relative z-10 transition-transform group-hover:scale-110 ${
                isTerminal ? "text-[var(--accent-primary)]" : ""
              }`}
            />
            <span className="text-[10px] tracking-tight mt-1 relative z-10 font-medium leading-none">
              Sandbox
            </span>
          </Link>
        </nav>

        {/* BOTTOM LEFT: Controls & Utilities */}
        <div className="flex flex-col items-center gap-2 w-full pt-2">
          {/* Soundpack Toggle */}
          <button
            onClick={() => setIsSoundModalOpen(true)}
            className="w-9 h-9 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer mimo-press"
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
          <ThemeFlyout
            isOpen={isThemeDropdownOpen}
            onToggle={() => setIsThemeDropdownOpen((prev) => !prev)}
            onClose={() => setIsThemeDropdownOpen(false)}
            align="bottom"
          />

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={(e) => toggleTheme(e.currentTarget)}
            className="w-9 h-9 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer mimo-press"
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

          {/* GitHub Star Pill */}
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-1.5 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] flex flex-col items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer mimo-press group"
            title="Star Ram-Gold/bashist on GitHub"
            aria-label="GitHub Repository"
          >
            <GithubIcon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
            <div className="flex items-center gap-0.5 text-[10px] font-mono text-[var(--text-muted)] group-hover:text-[var(--text-main)] mt-0.5">
              <Star className="w-2.5 h-2.5 text-[var(--accent-amber)] fill-[var(--accent-amber)] shrink-0" />
              <span>{stars !== null ? stars : "0"}</span>
            </div>
          </a>
        </div>
      </aside>

      {/* Keystroke Sound Settings Modal */}
      <SoundSettingsModal
        isOpen={isSoundModalOpen}
        onClose={() => setIsSoundModalOpen(false)}
      />
    </>
  );
}
