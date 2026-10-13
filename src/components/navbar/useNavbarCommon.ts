import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../lib/useTheme";
import { useSoundpack } from "../../lib/useSoundpack";

export const GITHUB_REPO_URL = "https://github.com/Ram-Gold/bashist";
const GITHUB_API_URL = "https://api.github.com/repos/Ram-Gold/bashist";
const GITHUB_STARS_CACHE_KEY = "bashist:github_stars";
const GITHUB_STARS_CACHE_TIME = "bashist:github_stars_time";

export function useNavbarCommon() {
  const location = useLocation();
  const isTerminal = location.pathname.startsWith("/terminal");
  const isDrills = location.pathname.startsWith("/drills") || location.pathname.startsWith("/typing");
  const isChallenges = !isTerminal && !isDrills;

  const { isDark, toggleTheme } = useTheme();
  const { isEnabled: isSoundEnabled } = useSoundpack();
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  const [stars, setStars] = useState<number | null>(() => {
    try {
      const cached =
        localStorage.getItem(GITHUB_STARS_CACHE_KEY) ||
        localStorage.getItem("linuxdrill:github_stars");
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

  return {
    isChallenges,
    isDrills,
    isTerminal,
    location,
    isDark,
    toggleTheme,
    isSoundEnabled,
    isSoundModalOpen,
    setIsSoundModalOpen,
    isThemeDropdownOpen,
    setIsThemeDropdownOpen,
    stars,
    githubUrl: GITHUB_REPO_URL,
  };
}
