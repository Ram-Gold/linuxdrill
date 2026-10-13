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
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import BashistLogo from "../BashistLogo";
import { ThemeFlyout } from "./ThemeFlyout";
import { useNavbarCommon } from "./useNavbarCommon";
import { GithubIcon } from "./GithubIcon";
import { SoundSettingsModal } from "../SoundSettingsModal";

interface PrototypeGlassProps {
  solvedCount: number;
  totalCount: number;
  totalPoints: number;
}

export function PrototypeGlass({
  solvedCount,
  totalCount,
  totalPoints,
}: PrototypeGlassProps) {
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
      {/* Floating Glassmorphic Rail detached from the window edges */}
      <div className="shrink-0 pl-3 py-3 h-screen sticky top-0 left-0 z-40 flex items-stretch">
        <aside
          className="w-[72px] h-full rounded-3xl flex flex-col items-center justify-between py-4 px-2 bg-[var(--surface-base)]/85 backdrop-blur-2xl border border-[var(--border-subtle)]/80 shadow-[0_8px_30px_rgb(0_0_0/0.08)] select-none transition-all"
          aria-label="Sidebar Navigation (Floating Glass Rail)"
        >
          {/* TOP: Brand Emblem & Amber Points Pill */}
          <div className="flex flex-col items-center gap-3 w-full">
            {/* Logo in glowing glass container */}
            <Link
              to="/"
              className="p-2 rounded-2xl bg-[var(--surface-subtle)]/80 hover:bg-[var(--surface-active)] transition-all mimo-press group relative overflow-hidden"
              title="Bashist Home"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-primary)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <BashistLogo className="w-7 h-7 relative z-10 group-hover:scale-108 transition-transform duration-200" />
            </Link>

            {/* Glowing Points Chip */}
            <div
              className="w-full py-1.5 px-1 rounded-2xl bg-gradient-to-b from-[var(--surface-subtle)] to-[var(--surface-base)] border border-[var(--accent-amber)]/25 flex flex-col items-center text-center shadow-xs cursor-default group"
              title={`${totalPoints} Points Earned (${solvedCount}/${totalCount} Completed)`}
            >
              <div className="flex items-center gap-1 text-[var(--accent-amber)]">
                <Star className="w-3 h-3 fill-[var(--accent-amber)] animate-pulse" />
                <span className="text-xs font-bold font-mono text-[var(--text-main)]">
                  {totalPoints}
                </span>
              </div>
              <span className="text-[9px] font-mono font-semibold text-[var(--accent-amber)] uppercase tracking-wider">
                points
              </span>

              {/* Solved Ratio */}
              <div className="mt-1 text-[10px] font-mono text-[var(--text-tertiary)] group-hover:text-[var(--text-muted)]">
                {solvedCount}/{totalCount}
              </div>
            </div>
          </div>

          {/* CENTER: Floating Glass Segmented Navigation */}
          <nav className="flex flex-col items-center gap-2 w-full p-1.5 rounded-2xl bg-[var(--surface-subtle)]/60 border border-[var(--border-subtle)]/50 backdrop-blur-md">
            {/* Challenges */}
            <Link
              to="/"
              className={`relative w-full py-2.5 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors group mimo-press ${
                isChallenges
                  ? "text-[var(--text-main)] font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
              title="Challenges"
            >
              {isChallenges && (
                <motion.div
                  layoutId="glass-active-pill"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  className="absolute inset-0 bg-[var(--surface-base)]/90 rounded-xl shadow-xs border border-[var(--accent-primary)]/30 backdrop-blur-md"
                />
              )}
              <Target
                className={`w-4 h-4 relative z-10 transition-transform group-hover:scale-110 ${
                  isChallenges ? "text-[var(--accent-primary)]" : ""
                }`}
              />
              <span className="text-[10px] tracking-tight mt-1 relative z-10 font-medium">
                Challenges
              </span>
            </Link>

            {/* Drills */}
            <Link
              to="/drills"
              className={`relative w-full py-2.5 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors group mimo-press ${
                isDrills
                  ? "text-[var(--text-main)] font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
              title="Drills"
            >
              {isDrills && (
                <motion.div
                  layoutId="glass-active-pill"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  className="absolute inset-0 bg-[var(--surface-base)]/90 rounded-xl shadow-xs border border-[var(--accent-primary)]/30 backdrop-blur-md"
                />
              )}
              <Flame
                className={`w-4 h-4 relative z-10 transition-transform group-hover:scale-110 ${
                  isDrills ? "text-[var(--accent-primary)]" : ""
                }`}
              />
              <span className="text-[10px] tracking-tight mt-1 relative z-10 font-medium">
                Drills
              </span>
            </Link>

            {/* Sandbox */}
            <Link
              to="/terminal"
              className={`relative w-full py-2.5 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors group mimo-press ${
                isTerminal
                  ? "text-[var(--text-main)] font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
              title="Sandbox"
            >
              {isTerminal && (
                <motion.div
                  layoutId="glass-active-pill"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  className="absolute inset-0 bg-[var(--surface-base)]/90 rounded-xl shadow-xs border border-[var(--accent-primary)]/30 backdrop-blur-md"
                />
              )}
              <TerminalIcon
                className={`w-4 h-4 relative z-10 transition-transform group-hover:scale-110 ${
                  isTerminal ? "text-[var(--accent-primary)]" : ""
                }`}
              />
              <span className="text-[10px] tracking-tight mt-1 relative z-10 font-medium">
                Sandbox
              </span>
            </Link>
          </nav>

          {/* BOTTOM LEFT: Controls & GitHub */}
          <div className="flex flex-col items-center gap-2 w-full pt-2">
            {/* Sound Toggle */}
            <button
              onClick={() => setIsSoundModalOpen(true)}
              className="w-9 h-9 rounded-xl bg-[var(--surface-subtle)]/70 hover:bg-[var(--surface-active)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer mimo-press"
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
              className="w-9 h-9 rounded-xl bg-[var(--surface-subtle)]/70 hover:bg-[var(--surface-active)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer mimo-press"
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

            {/* GitHub Star Chip */}
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-1.5 rounded-xl bg-[var(--surface-subtle)]/70 hover:bg-[var(--surface-active)] flex flex-col items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer mimo-press group"
              title="Star Ram-Gold/bashist on GitHub"
            >
              <GithubIcon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              <div className="flex items-center gap-0.5 text-[10px] font-mono text-[var(--text-muted)] group-hover:text-[var(--text-main)] mt-0.5">
                <Star className="w-2.5 h-2.5 text-[var(--accent-amber)] fill-[var(--accent-amber)] shrink-0" />
                <span>{stars !== null ? stars : "0"}</span>
              </div>
            </a>
          </div>
        </aside>
      </div>

      {/* Sound Settings Modal */}
      <SoundSettingsModal
        isOpen={isSoundModalOpen}
        onClose={() => setIsSoundModalOpen(false)}
      />
    </>
  );
}
