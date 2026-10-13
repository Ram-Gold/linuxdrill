import { useRef, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useThemePreset } from "../../lib/useThemePreset";

interface ThemeFlyoutProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  align?: "bottom" | "top";
  className?: string;
  triggerClassName?: string;
  triggerButton?: React.ReactNode;
}

export function ThemeFlyout({
  isOpen,
  onToggle,
  onClose,
  align = "bottom",
  className = "",
  triggerClassName,
}: ThemeFlyoutProps) {
  const { presets, activePresetId, setThemePreset } = useThemePreset();
  const flyoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (flyoutRef.current && !flyoutRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const defaultButtonClass = `w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer mimo-press ${
    isOpen
      ? "bg-[var(--surface-active)] text-[var(--text-main)] ring-1 ring-[var(--accent-primary)]/30"
      : "bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)]"
  }`;

  return (
    <div className={`relative ${className}`} ref={flyoutRef}>
      <button
        onClick={onToggle}
        className={triggerClassName ? `${triggerClassName} ${isOpen ? "ring-1 ring-[var(--accent-primary)]/30 text-[var(--text-main)]" : ""}` : defaultButtonClass}
        title="Themes"
        aria-label="Themes"
        aria-expanded={isOpen}
      >
        <Palette className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute left-full ml-3 w-56 bg-[var(--surface-base)]/95 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden backdrop-blur-xl border border-[var(--surface-active)]/50 origin-left transform-gpu ${
              align === "bottom" ? "bottom-0" : "top-0"
            }`}
          >
            <div className="px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] flex items-center justify-between">
              <span>Theme Preset</span>
              <Palette className="w-3 h-3 text-[var(--text-tertiary)]" />
            </div>

            <div className="space-y-0.5 mt-1">
              {presets.map((preset) => {
                const isActive = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setThemePreset(preset.id);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition-colors text-left group mimo-press ${
                      isActive
                        ? "bg-[var(--surface-active)] text-[var(--text-main)] font-medium"
                        : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-subtle)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Swatch capsule */}
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
  );
}
