import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, Volume2, VolumeX, Palette, Check, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "../lib/useTheme";
import { useSoundpack } from "../lib/useSoundpack";
import { useThemePreset } from "../lib/useThemePreset";
import { SoundSettingsModal } from "./SoundSettingsModal";

const GITHUB_REPO_URL = "https://github.com/Ram-Gold/linuxdrill";
const GITHUB_API_URL = "https://api.github.com/repos/Ram-Gold/linuxdrill";
const GITHUB_STARS_CACHE_KEY = "linuxdrill:github_stars";
const GITHUB_STARS_CACHE_TIME = "linuxdrill:github_stars_time";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

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
  const isDrills = location.pathname.startsWith("/drills") || location.pathname.startsWith("/typing");
  const isChallenges = !isTerminal && !isDrills;
  const { isDark, toggleTheme } = useTheme();
  const { isEnabled } = useSoundpack();
  const { presets, activePresetId, setThemePreset } = useThemePreset();

  const [stars, setStars] = useState<number | null>(() => {
    try {
      const cached = localStorage.getItem(GITHUB_STARS_CACHE_KEY);
      return cached !== null ? Number(cached) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      const cachedTime = localStorage.getItem(GITHUB_STARS_CACHE_TIME);
      if (cachedTime && Date.now() - Number(cachedTime) < 1000 * 60 * 30) {
        return;
      }
    } catch {
      // ignore
    }

    fetch(GITHUB_API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch GitHub repo stats");
        return res.json();
      })
      .then((data) => {
        if (typeof data.stargazers_count === "number") {
          setStars(data.stargazers_count);
          try {
            localStorage.setItem(GITHUB_STARS_CACHE_KEY, String(data.stargazers_count));
            localStorage.setItem(GITHUB_STARS_CACHE_TIME, String(Date.now()));
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // Keep existing cached state on error
      });
  }, []);

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
    <header className="sticky top-0 z-40 px-5 lg:px-8 transition-colors duration-120 shadow-[0_2px_12px_rgba(0,0,0,0.04)]" style={{ backgroundColor: 'var(--surface-base)' }}>
      <div className={`${!isTerminal ? "max-w-[1400px]" : "w-full"} mx-auto h-14 flex items-center justify-between`}>
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
        <nav className="relative flex items-center p-1 rounded-xl bg-[var(--surface-subtle)]">
          <Link
            to="/"
            className={`relative px-3.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer mimo-press ${isChallenges
              ? "text-[var(--text-main)] font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
          >
            {isChallenges && (
              <motion.div
                layoutId="navbar-mode-pill"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute inset-0 bg-[var(--surface-base)] rounded-lg shadow-sm"
              />
            )}
            <span className="relative z-10">Challenges</span>
          </Link>

          <Link
            to="/drills"
            className={`relative px-3.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer mimo-press ${isDrills
              ? "text-[var(--text-main)] font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
          >
            {isDrills && (
              <motion.div
                layoutId="navbar-mode-pill"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute inset-0 bg-[var(--surface-base)] rounded-lg shadow-sm"
              />
            )}
            <span className="relative z-10">Drills</span>
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
                className="absolute inset-0 bg-[var(--surface-base)] rounded-lg shadow-sm"
              />
            )}
            <span className="relative z-10">Sandbox</span>
          </Link>
        </nav>

        {/* Right: Score + controls */}
        <div className="flex items-center gap-2.5">
          {/* Score chip */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-subtle)] text-xs font-mono text-[var(--text-muted)]">
            <span>
              <span className="text-[var(--text-main)] font-semibold">{solvedCount}</span>
              <span className="text-[var(--text-tertiary)]">/{totalCount}</span>
            </span>
            {totalPoints > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-[var(--surface-active)]" />
                <span className="text-[var(--accent-amber)] font-medium">
                  {totalPoints} pts
                </span>
              </>
            )}
          </div>

          {/* Sound toggle */}
          <button
            onClick={() => setIsSoundModalOpen(true)}
            className="w-9 h-9 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer mimo-press"
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
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer mimo-press ${isThemeDropdownOpen
                ? "bg-[var(--surface-active)] text-[var(--text-main)]"
                : "bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)]"
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
                  initial={{ opacity: 0, y: 8, scale: 0.94, filter: "blur(14px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 6, scale: 0.96, filter: "blur(10px)" }}
                  transition={{
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1], // Apple fluid motion curve
                  }}
                  style={{ willChange: "transform, opacity, filter" }}
                  className="absolute right-0 top-full mt-2 w-56 bg-[var(--surface-base)]/95 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden backdrop-blur-xl border border-[var(--surface-active)]/40 origin-top-right transform-gpu"
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
                            <div className="flex items-center px-1.5 py-0.5 rounded-full bg-[var(--surface-subtle)] shrink-0">
                              <div className="flex items-center -space-x-1.5">
                                {preset.swatches.map((color, i) => (
                                  <span
                                    key={i}
                                    className="relative inline-block w-3.5 h-3.5 rounded-full shadow-xs shrink-0"
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

          {/* GitHub Repo & Stars Link */}
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-2.5 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer mimo-press text-xs font-mono group ml-0.5"
            title="Star Ram-Gold/linuxdrill on GitHub"
            aria-label="GitHub Repository"
          >
            <GithubIcon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
            <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--text-muted)] group-hover:text-[var(--text-main)]">
              <Star className="w-3 h-3 text-[var(--accent-amber)] fill-[var(--accent-amber)] shrink-0" />
              <span>{stars !== null ? stars : "0"}</span>
            </div>
          </a>
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
