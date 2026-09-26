import { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  X,
  Check,
  Keyboard,
  Sparkles,
  Play,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSoundpack } from "../lib/useSoundpack";

interface SoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

  const [testInput, setTestInput] = useState("");
  const [lastAction, setLastAction] = useState<string>("Ready to test");
  const testInputRef = useRef<HTMLInputElement>(null);

  // Focus test input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        testInputRef.current?.focus();
      }, 100);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-[var(--surface-base)] border border-[var(--border-strong)] rounded-2xl shadow-2xl overflow-hidden z-10 select-none text-[var(--text-main)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)]/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-cyan-bg)] text-[var(--accent-cyan)] flex items-center justify-center border border-[var(--accent-cyan)]/20 shadow-sm">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight text-[var(--text-main)] flex items-center gap-2">
                  Keystroke Soundpacks
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--accent-cyan-bg)] text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20 font-bold uppercase tracking-wider">
                    SFX
                  </span>
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Tactile acoustic feedback for key press & release
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)] transition-colors cursor-pointer"
              title="Close (Esc)"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Master Toggle & Volume Row */}
            <div className="bg-[var(--surface-subtle)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-medium text-[var(--text-main)]">
                    Keystroke Acoustics
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isEnabled
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                    }`}
                  >
                    {isEnabled ? "ACTIVE" : "MUTED"}
                  </span>
                </div>

                {/* Switch Toggle */}
                <button
                  onClick={toggleEnabled}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.enabled ? "bg-[var(--accent-cyan)]" : "bg-zinc-600/40"
                  }`}
                  role="switch"
                  aria-checked={settings.enabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      settings.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-3 pt-1 border-t border-[var(--border-subtle)]">
                <button
                  onClick={toggleEnabled}
                  className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                  title={settings.enabled ? "Mute" : "Unmute"}
                >
                  {isEnabled ? (
                    <Volume2 className="w-4 h-4 text-[var(--accent-cyan)]" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-zinc-400" />
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
                    if (!settings.enabled && val > 0) {
                      toggleEnabled();
                    }
                    setVolume(val);
                  }}
                  className="w-full h-1.5 bg-[var(--surface-active)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-cyan)]"
                />

                <span className="text-xs font-mono font-medium text-[var(--text-muted)] w-9 text-right">
                  {settings.enabled ? Math.round(settings.volume * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Soundpack Selection */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                  Select Switch Soundpack
                </label>
                <span className="text-[11px] text-[var(--text-tertiary)]">
                  3 Enthusiast Profiles
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {metas.map((meta) => {
                  const isSelected = settings.activePack === meta.id;
                  return (
                    <div
                      key={meta.id}
                      onClick={() => setActivePack(meta.id)}
                      className={`relative flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[var(--accent-cyan-bg)] border-[var(--accent-cyan)] shadow-sm"
                          : "bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] border-[var(--border-subtle)]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan)] text-white"
                              : "border-[var(--border-strong)] bg-transparent"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[var(--text-main)]">
                              {meta.name}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold ${
                                meta.category === "Tactile"
                                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                  : "bg-sky-500/10 text-sky-500 border-sky-500/20"
                              }`}
                            >
                              {meta.category}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                              {meta.actuation}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            {meta.description}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playPreview(meta.id, "enter");
                          setLastAction(`Previewed ${meta.name}`);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--surface-base)] hover:bg-[var(--surface-active)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                        title={`Sample ${meta.name}`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Sample</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Typing Test Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span className="font-semibold uppercase font-mono tracking-wider text-[11px]">
                  Interactive Test Pad
                </span>
                <span className="text-[11px] font-mono text-[var(--accent-cyan)]">
                  {lastAction}
                </span>
              </div>

              <div className="relative">
                <input
                  ref={testInputRef}
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  onKeyDown={(e) => {
                    setLastAction(`Press [${e.key}]`);
                  }}
                  onKeyUp={(e) => {
                    setLastAction(`Release [${e.key}]`);
                  }}
                  placeholder="Type anything here (Enter, Space, letters) to test acoustics..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-strong)] text-sm font-mono text-[var(--text-main)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-cyan)] focus:ring-1 focus:ring-[var(--accent-cyan)] transition-all"
                />

                {testInput.length > 0 && (
                  <button
                    onClick={() => {
                      setTestInput("");
                      testInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                    title="Clear"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="px-6 py-3 border-t border-[var(--border-subtle)] bg-[var(--surface-subtle)]/40 flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
              Press & release sounds active across entire app
            </span>
            <span className="font-mono">Esc to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
