import { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  X,
  Play,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSoundpack, type SoundpackCategory } from "../lib/useSoundpack";

interface SoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: SoundpackCategory[] = [
  "All",
  "Clicky",
  "Thocky",
  "Linear",
  "Tactile",
  "Silent",
  "Vintage",
  "FX",
];

export function SoundSettingsModal({ isOpen, onClose }: SoundSettingsModalProps) {
  const {
    settings,
    metas,
    isEnabled,
    toggleEnabled,
    setActivePack,
    setVolume,
    playPreview,
  } = useSoundpack();

  const [category, setCategory] = useState<SoundpackCategory>("All");
  const [testInput, setTestInput] = useState("");
  const [lastStroke, setLastStroke] = useState<string>("");
  const testInputRef = useRef<HTMLInputElement>(null);

  const filteredMetas =
    category === "All" ? metas : metas.filter((m) => m.category === category);

  // Focus test input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        testInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sound-settings-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 6 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-[var(--surface-base)] border border-[var(--border-strong)] rounded-2xl shadow-2xl z-10 text-[var(--text-main)] overflow-hidden select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)]/40">
            <div className="flex items-center gap-3">
              <h2
                id="sound-settings-title"
                className="text-sm font-semibold tracking-tight text-[var(--text-main)]"
              >
                Sound Settings
              </h2>
              <button
                type="button"
                onClick={toggleEnabled}
                className={`relative h-[18px] w-8 rounded-full transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] ${
                  settings.enabled
                    ? "bg-[var(--accent-primary)]"
                    : "bg-[var(--surface-active)]"
                }`}
                role="switch"
                aria-checked={settings.enabled}
                title={settings.enabled ? "Mute keystroke sounds" : "Enable keystroke sounds"}
              >
                <span
                  className={`block h-3 w-3 rounded-full bg-white shadow-xs transition-transform mt-[3px] ${
                    settings.enabled ? "translate-x-[16px]" : "translate-x-[3px]"
                  }`}
                />
              </button>
              <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                {settings.enabled ? "Active" : "Muted"}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)] cursor-pointer transition-colors"
              aria-label="Close sound settings"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Two-column body */}
          <div className="flex flex-col sm:flex-row min-h-[320px]">
            {/* Left: Soundpack list */}
            <div className="flex-[1.25] px-4 py-4 flex flex-col sm:border-r border-[var(--border-subtle)] border-b sm:border-b-0 min-w-0">
              <div className="flex items-center justify-between mb-2.5 px-1 font-mono">
                <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium">
                  Acoustic Profiles
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)]">
                  {filteredMetas.length} {filteredMetas.length === 1 ? "profile" : "profiles"}
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 select-none">
                {CATEGORIES.map((cat) => {
                  const active = category === cat;
                  const count =
                    cat === "All"
                      ? metas.length
                      : metas.filter((m) => m.category === cat).length;
                  if (count === 0 && cat !== "All") return null;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer border ${
                        active
                          ? "bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white font-medium"
                          : "bg-[var(--surface-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      {cat} <span className="opacity-70 text-[10px]">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Scrollable Soundpack list */}
              <div
                className="space-y-1 max-h-[300px] overflow-y-auto pr-1 select-none"
                role="radiogroup"
                aria-label="Acoustic Profiles"
              >
                {filteredMetas.map((meta) => {
                  const active = settings.activePack === meta.id;
                  return (
                    <div
                      key={meta.id}
                      role="radio"
                      aria-checked={active}
                      tabIndex={0}
                      onClick={() => setActivePack(meta.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActivePack(meta.id);
                        }
                      }}
                      className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all border ${
                        active
                          ? "bg-[var(--surface-active)] border-[var(--accent-primary)]/40 text-[var(--text-main)]"
                          : "bg-transparent border-transparent hover:bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                      }`}
                    >
                      {/* Clean indicator line */}
                      <div
                        className={`w-1 h-5 rounded-full transition-colors shrink-0 ${
                          active ? "bg-[var(--accent-primary)]" : "bg-transparent"
                        }`}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-medium truncate leading-tight">
                            {meta.name}
                          </span>
                          {meta.tag && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] shrink-0">
                              {meta.tag}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--text-tertiary)] font-mono mt-0.5">
                          {meta.actuation}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playPreview(meta.id, "enter");
                        }}
                        className={`p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--surface-base)] transition-all cursor-pointer ${
                          active ? "opacity-90" : "opacity-0 group-hover:opacity-100"
                        }`}
                        title={`Sample ${meta.name}`}
                        aria-label={`Sample ${meta.name}`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Volume + Live Test */}
            <div className="flex-1 px-5 py-4 flex flex-col justify-between gap-5">
              {/* Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium font-mono">
                    Volume
                  </span>
                  <span className="text-[11px] font-mono text-[var(--text-tertiary)] tabular-nums">
                    {settings.enabled ? Math.round(settings.volume * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleEnabled}
                    className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer p-0.5 focus:outline-none"
                    title={settings.enabled ? "Mute" : "Unmute"}
                    aria-label={settings.enabled ? "Mute" : "Unmute"}
                  >
                    {isEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-[var(--text-tertiary)]" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.enabled ? settings.volume : 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!settings.enabled && val > 0) toggleEnabled();
                      setVolume(val);
                    }}
                    aria-label="Sound volume"
                    className="flex-1 h-1.5 bg-[var(--surface-active)] rounded-full appearance-none cursor-pointer accent-[var(--accent-primary)]"
                  />
                </div>
              </div>

              {/* Live Test */}
              <div className="space-y-2 flex-1 flex flex-col justify-center">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium font-mono">
                    Test Acoustics
                  </span>
                  {lastStroke && (
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)] truncate max-w-[120px]">
                      {lastStroke}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    ref={testInputRef}
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    onKeyDown={(e) => setLastStroke(`[${e.key}]`)}
                    placeholder="Press keys to test acoustics…"
                    aria-label="Test typing acoustics"
                    className="w-full h-10 px-3.5 pr-8 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-main)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                  />
                  {testInput.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setTestInput("");
                        setLastStroke("");
                        testInputRef.current?.focus();
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                      title="Clear test input"
                      aria-label="Clear test input"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
                <span>Active across app</span>
                <span className="font-mono text-[10px]">Esc to close</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
