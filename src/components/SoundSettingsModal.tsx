import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  X,
  Play,
  RotateCcw,
  ChevronDown,
  Check,
  Search,
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

  const [testInput, setTestInput] = useState("");
  const testInputRef = useRef<HTMLInputElement>(null);

  // Dropdown popover state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownCategory, setDropdownCategory] = useState<SoundpackCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredPackId, setHoveredPackId] = useState<string | null>(() => settings.activePack);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const [prevDropdownOpen, setPrevDropdownOpen] = useState(isDropdownOpen);
  if (isDropdownOpen && !prevDropdownOpen) {
    setPrevDropdownOpen(true);
    setHoveredPackId(settings.activePack);
  } else if (!isDropdownOpen && prevDropdownOpen) {
    setPrevDropdownOpen(false);
  }

  // Active soundpack metadata
  const activeMeta = useMemo(() => {
    return metas.find((m) => m.id === settings.activePack) || metas[0];
  }, [metas, settings.activePack]);

  // Filtered soundpacks for dropdown
  const filteredMetas = useMemo(() => {
    return metas.filter((meta) => {
      const matchesCategory =
        dropdownCategory === "All" || meta.category === dropdownCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        meta.name.toLowerCase().includes(q) ||
        meta.category.toLowerCase().includes(q) ||
        meta.actuation.toLowerCase().includes(q) ||
        meta.tag.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [metas, dropdownCategory, searchQuery]);

  // Focus test input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        testInputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Handle ESC key (first closes dropdown, then clears test text, then closes modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
        } else if (testInput.length > 0) {
          setTestInput("");
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDropdownOpen, testInput, onClose]);

  // Enable smooth horizontal mouse wheel scrolling across category filter pills in popover
  useEffect(() => {
    if (!isDropdownOpen) return;
    const el = categoryScrollRef.current;
    if (!el) return;

    let targetLeft = el.scrollLeft;
    let animId: number | null = null;

    const smoothStep = () => {
      const diff = targetLeft - el.scrollLeft;
      if (Math.abs(diff) > 0.5) {
        el.scrollLeft += diff * 0.22;
        animId = requestAnimationFrame(smoothStep);
      } else {
        el.scrollLeft = targetLeft;
        animId = null;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        const maxScroll = el.scrollWidth - el.clientWidth;
        targetLeft = Math.max(0, Math.min(maxScroll, targetLeft + e.deltaY));
        if (!animId) {
          animId = requestAnimationFrame(smoothStep);
        }
      }
    };

    const handleScroll = () => {
      if (!animId) {
        targetLeft = el.scrollLeft;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("scroll", handleScroll);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isDropdownOpen]);

  // Volume scrub drag handling
  const volumeTrackRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const updateVolumeFromPointer = useCallback(
    (clientX: number) => {
      const rect = volumeTrackRef.current?.getBoundingClientRect();
      if (!rect || rect.width <= 0) return;
      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      if (!settings.enabled && percent > 0) {
        toggleEnabled();
      }
      setVolume(percent);
    },
    [settings.enabled, toggleEnabled, setVolume]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Leftmost area (first 36px) is reserved for speaker mute toggle click
    if (e.clientX - rect.left <= 36) {
      toggleEnabled();
      return;
    }
    setIsScrubbing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateVolumeFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      updateVolumeFromPointer(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      setIsScrubbing(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const volumePercent = settings.enabled ? Math.round(settings.volume * 100) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="sound-settings-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sound-settings-title"
        >
          {/* Modal Panel - Clean, spacious, borderless card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[560px] bg-[var(--surface-base)] rounded-3xl shadow-2xl shadow-black/40 z-10 text-[var(--text-main)] p-7 sm:p-8 select-none overflow-visible"
          >
            {/* Header: Title + SquishSwitch + Close (Clean, borderless) */}
            <div className="flex items-center justify-between">
              <h2
                id="sound-settings-title"
                className="text-base font-semibold tracking-tight text-[var(--text-main)]"
              >
                Keyboard Sound
              </h2>

              <div className="flex items-center gap-3">
                <SquishSwitch
                  checked={settings.enabled}
                  onChange={toggleEnabled}
                  trackColor="var(--surface-subtle)"
                  trackOnColor="var(--accent-primary)"
                  thumbColor="#ffffff"
                  thumbOnColor="#ffffff"
                  width={42}
                  height={22}
                  radius={11}
                  speed={60}
                  stretch={32}
                  ariaLabel="Toggle keystroke sounds"
                />

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--surface-subtle)] cursor-pointer transition-colors"
                  aria-label="Close sound settings"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive Typing Stage (Center) - Spans across horizontally */}
            <div
              onClick={() => testInputRef.current?.focus()}
              className="relative my-8 sm:my-10 py-3 cursor-text w-full flex items-center justify-center select-none"
            >
              {/* Invisible native input capturing keystrokes */}
              <input
                ref={testInputRef}
                type="text"
                value={testInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length <= SAMPLE_PANGRAM.length) {
                    setTestInput(val);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-text w-full h-full z-10"
                aria-label="Test keyboard sound typing"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />

              {/* Large, prominent Pangram spanning across horizontally */}
              <div className="w-full text-center font-sans text-[17px] xs:text-[19px] sm:text-[22px] md:text-[23.5px] font-medium tracking-tight leading-none whitespace-nowrap overflow-visible">
                {SAMPLE_PANGRAM.split("").map((char, idx) => {
                  const isTyped = idx < testInput.length;
                  const isCorrect =
                    isTyped && testInput[idx]?.toLowerCase() === char.toLowerCase();
                  const isCurrent = idx === testInput.length;

                  return (
                    <span
                      key={idx}
                      className={`relative transition-colors duration-75 ${
                        isTyped
                          ? isCorrect
                            ? "text-[var(--text-main)] font-semibold"
                            : "text-[var(--accent-red)] font-semibold"
                          : "text-[var(--text-tertiary)]/35"
                      }`}
                    >
                      {isCurrent && (
                        <span className="inline-block w-[2.5px] h-[1.15em] bg-[var(--accent-primary-soft)] align-middle -mt-1 animate-pulse rounded-full" />
                      )}
                      {char}
                    </span>
                  );
                })}
              </div>

              {/* Floating Reset Button - Positioned on the bottom of the pangram with zero layout shift */}
              <AnimatePresence>
                {testInput.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTestInput("");
                      testInputRef.current?.focus();
                    }}
                    className="absolute -bottom-7 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono text-[var(--text-tertiary)] hover:text-[var(--text-main)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] transition-all cursor-pointer shadow-xs whitespace-nowrap"
                    title="Reset test text (Esc)"
                    aria-label="Reset test text"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Row: Switches Dropdown & Control Center Volume (Clean, borderless controls) */}
            <div className="grid grid-cols-2 gap-4 items-end relative" ref={dropdownRef}>
              {/* Switches Column */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium font-mono px-0.5">
                  Switches
                </span>

                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="listbox"
                  className={`h-11 px-3.5 rounded-xl flex items-center justify-between gap-2.5 transition-all cursor-pointer font-mono text-xs w-full text-left border-0 ${
                    isDropdownOpen
                      ? "bg-[var(--surface-active)] text-[var(--text-main)] shadow-sm"
                      : "bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shrink-0" />
                    <span className="truncate font-medium text-[13px] text-[var(--text-main)]">
                      {activeMeta.name}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--text-tertiary)] shrink-0 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180 text-[var(--accent-primary-soft)]" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Volume Column (Clean Apple Control Center Pill) */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium font-mono px-0.5">
                  Volume
                </span>

                <div
                  ref={volumeTrackRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  role="slider"
                  aria-valuenow={volumePercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Switch volume level"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                      e.preventDefault();
                      setVolume(Math.min(1, settings.volume + 0.05));
                    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                      e.preventDefault();
                      setVolume(Math.max(0, settings.volume - 0.05));
                    }
                  }}
                  className="h-11 rounded-xl relative overflow-hidden select-none bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)]/80 cursor-ew-resize transition-colors border-0"
                >
                  {/* Filled Track */}
                  <div
                    className="absolute inset-y-0 left-0 bg-[var(--accent-primary)]/85 rounded-xl pointer-events-none transition-[width] duration-75 ease-out"
                    style={{ width: `${volumePercent}%` }}
                  />

                  {/* Foreground Content */}
                  <div className="relative z-10 w-full h-full flex items-center justify-between px-3.5 pointer-events-none">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEnabled();
                      }}
                      className="pointer-events-auto text-[var(--text-main)] hover:text-white transition-colors p-0.5 cursor-pointer"
                      title={settings.enabled ? "Mute" : "Unmute"}
                      aria-label={settings.enabled ? "Mute" : "Unmute"}
                    >
                      {isEnabled ? (
                        <Volume2 className="w-4 h-4 text-white" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-[var(--text-tertiary)]" />
                      )}
                    </button>

                    <span className="font-mono text-xs font-semibold text-[var(--text-main)] tabular-nums select-none drop-shadow-xs">
                      {volumePercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Switches Popover (Clean, elevated card) */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 440, damping: 32 }}
                    className="absolute left-0 top-[calc(100%+8px)] w-[360px] max-w-[calc(100vw-40px)] bg-[var(--surface-elevated)] rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden border-0"
                  >
                    {/* Search Bar (borderless input) */}
                    <div className="p-3 pb-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search switches…"
                          className="w-full h-9 pl-9 pr-8 rounded-xl bg-[var(--surface-subtle)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-tertiary)] focus:outline-none transition-all font-mono border-0"
                          autoFocus
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-main)] cursor-pointer"
                            aria-label="Clear search"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Category Filter Pills (borderless pills) */}
                    <div
                      ref={categoryScrollRef}
                      className="flex items-center gap-1.5 overflow-x-auto px-3 py-2 scrollbar-subtle select-none"
                    >
                      {CATEGORIES.map((cat) => {
                        const active = dropdownCategory === cat;
                        const count =
                          cat === "All"
                            ? metas.length
                            : metas.filter((m) => m.category === cat).length;
                        if (count === 0 && cat !== "All") return null;

                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setDropdownCategory(cat)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono whitespace-nowrap transition-colors cursor-pointer border-0 shrink-0 ${
                              active
                                ? "bg-[var(--accent-primary)] text-white font-medium shadow-xs"
                                : "bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>

                    {/* Soundpack Profiles List */}
                    <div
                      className="max-h-[240px] overflow-y-auto p-2 space-y-1 scrollbar-subtle"
                      role="listbox"
                      aria-label="Sound profiles"
                      onMouseLeave={() => setHoveredPackId(settings.activePack)}
                    >
                      {filteredMetas.length === 0 ? (
                        <div className="py-6 text-center text-xs font-mono text-[var(--text-tertiary)]">
                          No profiles matching "{searchQuery}"
                        </div>
                      ) : (
                        filteredMetas.map((meta) => {
                          const isSelected = settings.activePack === meta.id;
                          const isPillTarget = (hoveredPackId ?? settings.activePack) === meta.id;
                          return (
                            <div
                              key={meta.id}
                              role="option"
                              aria-selected={isSelected}
                              onMouseEnter={() => setHoveredPackId(meta.id)}
                              onClick={() => {
                                setActivePack(meta.id);
                                setIsDropdownOpen(false);
                              }}
                              className="relative group flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl cursor-pointer border-0 mimo-press select-none"
                            >
                              {/* Gliding Hover Pill matching GlideSelect */}
                              {isPillTarget && (
                                <motion.div
                                  layoutId="soundpack-gliding-pill"
                                  className="absolute inset-0 rounded-xl bg-[var(--surface-active)] pointer-events-none"
                                  transition={{
                                    type: "spring",
                                    stiffness: 1200,
                                    damping: 65,
                                    bounce: 0,
                                  }}
                                />
                              )}

                              <div className="relative z-10 flex items-center gap-2.5 min-w-0">
                                {isSelected ? (
                                  <Check className="w-3.5 h-3.5 text-[var(--accent-primary-soft)] shrink-0" />
                                ) : (
                                  <div className="w-3.5 h-3.5 shrink-0" />
                                )}

                                <div className="min-w-0">
                                  <div className="text-[13px] font-medium truncate leading-tight text-[var(--text-main)]">
                                    {meta.name}
                                  </div>
                                  <div className="text-[10px] text-[var(--text-tertiary)] font-mono mt-0.5 flex items-center gap-1.5">
                                    <span>{meta.actuation}</span>
                                    <span>·</span>
                                    <span>{meta.category}</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playPreview(meta.id, "enter");
                                }}
                                className={`relative z-10 p-1.5 rounded-lg ${
                                  isSelected
                                    ? "text-[var(--accent-primary-soft)]"
                                    : "text-[var(--text-tertiary)]"
                                } hover:text-[var(--text-main)] hover:bg-[var(--surface-subtle)] transition-[opacity,colors,background-color] duration-150 group-hover:delay-75 cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100`}
                                title={`Sample ${meta.name}`}
                                aria-label={`Sample ${meta.name}`}
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
