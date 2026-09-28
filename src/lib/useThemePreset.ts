import { useState, useEffect } from "react";

export interface ThemePreset {
  id: string;
  name: string;
  swatches: [string, string, string];
  description?: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "default",
    name: "Default",
    swatches: ["#1a1d3a", "#7e4bde", "#7ed957"],
    description: "Default LinuxDrill theme",
  },
  {
    id: "catppuccin-mocha",
    name: "Catppuccin Mocha",
    swatches: ["#1e1e2e", "#cba6f7", "#a6e3a1"],
    description: "Soothing pastel theme with mauve & green",
  },
  {
    id: "kanagawa-wave",
    name: "Kanagawa Wave",
    swatches: ["#1f1f28", "#957fb8", "#98bb6c"],
    description: "Inspired by classical Japanese woodblock prints",
  },
  {
    id: "tokyo-night",
    name: "Tokyo Night",
    swatches: ["#1a1b26", "#7aa2f7", "#bb9af7"],
    description: "Vibrant neon night theme with deep blues",
  },
  {
    id: "gruvbox",
    name: "Gruvbox",
    swatches: ["#282828", "#fe8019", "#b8bb26"],
    description: "Retro groove theme with warm, earthy tones",
  },
];

const STORAGE_KEY = "linuxdrill-theme-preset";

function applyPresetToDom(presetId: string) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.themePreset = presetId;
  THEME_PRESETS.forEach((p) => {
    root.classList.remove(`theme-preset-${p.id}`, `theme-${p.id}`);
  });
  root.classList.add(`theme-preset-${presetId}`, `theme-${presetId}`);
  try {
    localStorage.setItem(STORAGE_KEY, presetId);
  } catch {
    // ignore
  }
}

export function useThemePreset() {
  const [activePresetId, setActivePresetId] = useState<string>(() => {
    if (typeof window === "undefined") return "default";
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const valid = THEME_PRESETS.find((p) => p.id === saved);
      if (valid) return valid.id;
      // Default to 'default' and persist
      localStorage.setItem(STORAGE_KEY, "default");
    } catch {
      // ignore
    }
    return "default";
  });

  const activePreset =
    THEME_PRESETS.find((p) => p.id === activePresetId) || THEME_PRESETS[0];

  const setThemePreset = (presetId: string) => {
    if (presetId === activePresetId) return;
    setActivePresetId(presetId);
    applyPresetToDom(presetId);
  };

  useEffect(() => {
    applyPresetToDom(activePresetId);
  }, [activePresetId]);

  return {
    presets: THEME_PRESETS,
    activePresetId,
    activePreset,
    setThemePreset,
  };
}
