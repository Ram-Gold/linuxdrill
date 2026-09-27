import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

export type Theme = "light" | "dark";

export type ThemeOrigin =
  | HTMLElement
  | React.MouseEvent<HTMLElement>
  | MouseEvent
  | { clientX: number; clientY: number }
  | null
  | undefined;

/**
 * Calculates transition center and maximum radius to the furthest viewport corner,
 * then sets CSS custom properties on documentElement for the circular reveal clip-path.
 * Reference: https://jamiewarburton.dev/writing/building-a-cool-circular-reveal-for-light-dark-mode/
 */
function setTransitionOrigin(origin?: ThemeOrigin) {
  if (typeof window === "undefined") return;

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;

  if (origin) {
    if ("currentTarget" in origin && origin.currentTarget instanceof HTMLElement) {
      const rect = origin.currentTarget.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else if (origin instanceof HTMLElement) {
      const rect = origin.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else if ("clientX" in origin && typeof origin.clientX === "number") {
      x = origin.clientX;
      y = origin.clientY;
    }
  }

  // Calculate distance to the furthest corner of the viewport
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  document.documentElement.style.setProperty("--theme-circle-x", `${x}px`);
  document.documentElement.style.setProperty("--theme-circle-y", `${y}px`);
  document.documentElement.style.setProperty("--theme-circle-radius", `${radius}px`);
}

function applyThemeToDom(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark", "theme-light", "theme-dark");
  root.classList.add(theme, `theme-${theme}`);
  root.dataset.theme = theme;
  localStorage.setItem("linuxdrill-theme", theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("linuxdrill-theme") as Theme | null;
    if (saved === "light" || saved === "dark") return saved;
    // Default to system preference, fallback to dark
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "dark";
  });

  const setTheme = (newTheme: Theme, origin?: ThemeOrigin) => {
    const root = document.documentElement;
    const isCurrentlyDark =
      root.classList.contains("dark") || root.classList.contains("theme-dark");
    const willBeDark = newTheme === "dark";

    const update = () => {
      setThemeState(newTheme);
      applyThemeToDom(newTheme);
    };

    const shouldAnimate =
      isCurrentlyDark !== willBeDark &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      typeof (document as any).startViewTransition === "function";

    if (shouldAnimate) {
      setTransitionOrigin(origin);
      (document as any).startViewTransition(() => {
        flushSync(() => {
          update();
        });
      });
    } else {
      update();
    }
  };

  const toggleTheme = (origin?: ThemeOrigin) => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme, origin);
  };

  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  // Sync if system preference changes and user hasn't explicitly set one
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("linuxdrill-theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return {
    theme,
    isDark: theme === "dark",
    isLight: theme === "light",
    setTheme,
    toggleTheme,
  };
}
