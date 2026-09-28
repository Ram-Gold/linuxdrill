import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, Volume2, VolumeX, Palette, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "../lib/useTheme";
import { useSoundpack } from "../lib/useSoundpack";
import { useThemePreset } from "../lib/useThemePreset";
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
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const isTerminal = location.pathname.startsWith("/terminal");
  const isChallenges = location.pathname === "/";
  const { isDark, toggleTheme } = useTheme();
  const { isEnabled } = useSoundpack();
  const { presets, activePresetId, setThemePreset } = useThemePreset();

  // Close theme dropdown on outside click or Escape key
  useEffect(() => {
    if (!isThemeDropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsThemeDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isThemeDropdownOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] px-5 lg:px-8 transition-colors duration-120" style={{ backgroundColor: 'var(--surface-base)' }}>
      <div className={`${isChallenges ? "max-w-[1400px]" : "w-full"} mx-auto h-14 flex items-center justify-between`}>
        {/* Left: Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 mimo-press"
        >
          <span className="text-base font-semibold tracking-tight text-[var(--text-main)]">
            Linux<span className="text-[var(--accent-primary)]">Drill</span>
          </span>
        </Link>

        {/* Center: Sliding mode pill segmented control */}
        <nav className="relative flex items-center p-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
          <Link
            to="/"
            className={`relative px-3.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer mimo-press ${!isTerminal
              ? "text-[var(--text-main)] font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
          >
            {!isTerminal && (
              <motion.div
                layoutId="navbar-mode-pill"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute inset-0 bg-[var(--surface-base)] rounded-lg border border-[var(--border-strong)] shadow-xs"
              />
            )}
            <span className="relative z-10">Challenges</span>
          </Link>

          <Link
            to="/terminal"
            className={`relative px-3.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer mimo-press ${isTerminal
              ? "text-[var(--text-main)] font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
          >
            {isTerminal && (
              <motion.div
                layoutId="navbar-mode-pill"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute inset-0 bg-[var(--surface-base)] rounded-lg border border-[var(--border-strong)] shadow-xs"
              />
            )}
            <span className="relative z-10">Sandbox</span>
          </Link>
        </nav>

        {/* Right: Score + controls */}
        <div className="flex items-center gap-2.5">
          {/* Score chip */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)]">
            <span>
              <span className="text-[var(--text-main)] font-semibold">{solvedCount}</span>
              <span className="text-[var(--text-tertiary)]">/{totalCount}</span>
            </span>
            {totalPoints > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
                <span className="text-[var(--accent-amber)] font-medium">
                  {totalPoints} pts
                </span>
              </>
            )}
          </div>

          {/* Sound toggle */}
          <button
            onClick={() => setIsSoundModalOpen(true)}
            className="w-9 h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-strong)] transition-colors cursor-pointer mimo-press"
            title="Keystroke Soundpack Settings"
            aria-label="Keystroke Soundpack Settings"
          >
            {isEnabled ? (
              <Volume2 className="w-4 h-4 text-[var(--accent-primary-soft)]" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Theme Palette / Appearance Dropdown Trigger */}
          <div className="relative" ref={themeDropdownRef}>
            <button
              onClick={() => setIsThemeDropdownOpen((prev) => !prev)}
              className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors cursor-pointer mimo-press ${isThemeDropdownOpen
                ? "border-[var(--accent-primary)] bg-[var(--surface-active)] text-[var(--text-main)] shadow-xs"
                : "border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-strong)]"
                }`}
              title="Themes"
              aria-label="Themes"
              aria-expanded={isThemeDropdownOpen}
            >
              <Palette className="w-4 h-4" />
            </button>

            {/* Themes Popover (Small, minimal, positioned at top right) */}
            <AnimatePresence>
              {isThemeDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-[var(--surface-base)] border border-[var(--border-strong)] rounded-2xl shadow-xl z-50 p-1.5 overflow-hidden backdrop-blur-md"
                >
                  <div className="px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                    Theme
                  </div>
                  <div className="space-y-0.5">
                    {presets.map((preset) => {
                      const isActive = activePresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => setThemePreset(preset.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition-colors text-left group mimo-press ${isActive
                            ? "bg-[var(--surface-active)] text-[var(--text-main)] font-medium"
                            : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-subtle)]"
                            }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Capsule with 3 overlapping circles */}
                            <div className="flex items-center px-1.5 py-0.5 rounded-full bg-[var(--surface-subtle)] border border-[var(--border-subtle)] shrink-0">
                              <div className="flex items-center -space-x-1.5">
                                {preset.swatches.map((color, i) => (
                                  <span
                                    key={i}
                                    className="relative inline-block w-3.5 h-3.5 rounded-full border border-[var(--surface-base)] shadow-xs shrink-0"
                                    style={{
                                      backgroundColor: color,
                                      zIndex: preset.swatches.length - i,
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="truncate">{preset.name}</span>
                          </div>

                          {isActive && (
                            <Check className="w-3.5 h-3.5 text-[var(--accent-primary-soft)] shrink-0 ml-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
          <button
            onClick={(e) => toggleTheme(e.currentTarget)}
            className="w-9 h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-strong)] transition-colors cursor-pointer mimo-press"
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
      </div>

      {/* Sound Settings Modal */}
      <SoundSettingsModal
        isOpen={isSoundModalOpen}
        onClose={() => setIsSoundModalOpen(false)}
      />
    </header>
  );
}
