import { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  X,
  Play,
  RotateCcw,
  Keyboard,
  Sliders,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SquishSwitch from "./SquishSwitch";
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

const SAMPLE_PANGRAM = "The quick brown fox jumps over the lazy dog";

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

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="fixed inset-0 bg-black/55 backdrop-blur-xs transition-opacity"
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
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)]/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary-soft)]">
                  <Keyboard className="w-4 h-4" />
                </div>
                <h2
                  id="sound-settings-title"
                  className="text-sm font-semibold tracking-tight text-[var(--text-main)]"
                >
                  Acoustic Profiles
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {/* SquishSwitch component from React Bits */}
                <SquishSwitch
                  checked={settings.enabled}
                  onChange={toggleEnabled}
                  trackColor="var(--surface-active)"
                  trackOnColor="var(--accent-primary)"
                  thumbColor="#ffffff"
                  thumbOnColor="#ffffff"
                  width={42}
                  height={22}
                  radius={11}
                  speed={60}
                  stretch={34}
                  ariaLabel="Toggle keystroke sounds"
                />

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
            </div>

            {/* Two-column body */}
            <div className="flex flex-col sm:flex-row min-h-[340px]">
              {/* Left: Soundpack list */}
              <div className="flex-[1.25] px-4 py-4 flex flex-col sm:border-r border-[var(--border-subtle)] border-b sm:border-b-0 min-w-0">
                <div className="flex items-center justify-between mb-2.5 px-1 font-mono">
                  <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium">
                    Profile Catalog
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">
                    {filteredMetas.length} {filteredMetas.length === 1 ? "profile" : "profiles"}
                  </span>
                </div>

                {/* Category Filter Pills (hidden scrollbar) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2.5 select-none no-scrollbar">
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
                        className={`relative px-2.5 py-1 rounded-full text-[11px] font-mono whitespace-nowrap transition-colors cursor-pointer border mimo-press shrink-0 ${
                          active
                            ? "border-[var(--accent-primary)] text-white font-medium shadow-xs"
                            : "bg-[var(--surface-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-strong)]"
                        }`}
                      >
                        {active && (
                          <motion.div
                            layoutId="soundpack-cat-pill"
                            transition={{ type: "spring", stiffness: 420, damping: 32 }}
                            className="absolute inset-0 bg-[var(--accent-primary)] rounded-full -z-10"
                          />
                        )}
                        <span className="relative z-10">
                          {cat} <span className="opacity-70 text-[10px]">({count})</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Scrollable Soundpack list (hidden scrollbar) */}
                <div
                  className="space-y-1.5 max-h-[310px] overflow-y-auto pr-0.5 select-none no-scrollbar"
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
                        className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all border mimo-press ${
                          active
                            ? "bg-[var(--surface-active)] border-[var(--accent-primary)]/50 text-[var(--text-main)] shadow-xs"
                            : "bg-[var(--surface-base)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-subtle)]"
                        }`}
                      >
                        {/* Clean indicator line */}
                        <div
                          className={`w-1 h-5 rounded-full transition-all shrink-0 ${
                            active
                              ? "bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]"
                              : "bg-transparent"
                          }`}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[13px] font-medium truncate leading-tight ${
                                active ? "text-[var(--text-main)] font-semibold" : ""
                              }`}
                            >
                              {meta.name}
                            </span>
                            {meta.tag && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] shrink-0">
                                {meta.tag}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--text-tertiary)] font-mono mt-0.5 flex items-center gap-1.5">
                            <span>{meta.actuation}</span>
                            <span>·</span>
                            <span className="text-[var(--text-tertiary)]/75">{meta.category}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playPreview(meta.id, "enter");
                          }}
                          className={`p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)] transition-all cursor-pointer ${
                            active
                              ? "opacity-100 text-[var(--accent-primary-soft)]"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                          title={`Sample ${meta.name}`}
                          aria-label={`Sample ${meta.name}`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Volume + Minimal Live Type Preview */}
              <div className="flex-1 px-5 py-4 flex flex-col justify-between gap-5">
                {/* Volume Section */}
                <div className="space-y-2 p-3 rounded-xl bg-[var(--surface-subtle)]/40 border border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium font-mono flex items-center gap-1.5">
                      <Sliders className="w-3 h-3 text-[var(--accent-primary-soft)]" />
                      <span>Volume Gain</span>
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-main)] font-semibold tabular-nums">
                      {settings.enabled ? Math.round(settings.volume * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleEnabled}
                      className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer p-1 rounded-lg hover:bg-[var(--surface-active)] focus:outline-none"
                      title={settings.enabled ? "Mute" : "Unmute"}
                      aria-label={settings.enabled ? "Mute" : "Unmute"}
                    >
                      {isEnabled ? (
                        <Volume2 className="w-4 h-4 text-[var(--accent-primary-soft)]" />
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

                {/* Minimal Type Preview */}
                <div className="space-y-2 flex-1 flex flex-col justify-center">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-mono text-[var(--text-tertiary)] leading-relaxed select-none">
                      {SAMPLE_PANGRAM}
                    </p>
                    <div className="relative">
                      <input
                        ref={testInputRef}
                        type="text"
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        placeholder="Type to test acoustics…"
                        aria-label="Test typing acoustics"
                        className="w-full h-10 px-3.5 pr-8 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] text-xs font-mono text-[var(--text-main)] placeholder:text-[var(--text-tertiary)] focus:outline-none transition-colors"
                      />
                      {testInput.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setTestInput("");
                            testInputRef.current?.focus();
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                          title="Clear test text"
                          aria-label="Clear test text"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]" />
                    <span>Persistent across drills</span>
                  </span>
                  <span className="font-mono text-[10px]">Esc to close</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
