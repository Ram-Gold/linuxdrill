import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { type DrillItem } from '../../data/drillDecks';
import { type DrillStage, type DrillMode } from '../../lib/useDrillProgress';
import { Settings2, Layers, Zap, Terminal, Keyboard, AlertCircle } from 'lucide-react';

interface MinimalTyperCardProps {
  drill: DrillItem;
  stage: DrillStage;
  mode?: DrillMode;
  currentIndex: number;
  totalInDeck: number;
  domainName: string;
  typed: string;
  target: string;
  isLocked: boolean;
  mistakes?: string;
  mistakeChar: string | null;
  clozeTemplate: string;
  liveWpm: number;
  accuracy: number;
  isBlitzMode?: boolean;
  shellFeedback?: { message: string; isError: boolean } | null;
  onReset: () => void;
  onToggleMode?: () => void;
  onOpenSettings: () => void;
  onOpenDecks: () => void;
}

export default function MinimalTyperCard({
  drill,
  stage,
  mode = 'typer',
  currentIndex,
  totalInDeck,
  domainName,
  typed,
  target,
  mistakes,
  mistakeChar,
  clozeTemplate,
  liveWpm,
  accuracy,
  isBlitzMode = false,
  shellFeedback,
  onReset,
  onToggleMode,
  onOpenSettings,
  onOpenDecks,
}: MinimalTyperCardProps) {
  const cursorRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll cursor into view when typing long commands
  useEffect(() => {
    cursorRef.current?.scrollIntoView({ behavior: 'instant', inline: 'nearest', block: 'nearest' });
  }, [typed, mistakes, mistakeChar]);

  // Mistakes buffer: multiple errors appear beside each other
  const errorText = mistakes ?? mistakeChar ?? '';

  // Ghost remainder: follows all typed correct characters + any active mistakes
  const fullTarget = stage === 2 ? clozeTemplate : target;
  const remainingGhost = fullTarget.slice(typed.length + errorText.length);

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-6 sm:py-10 max-w-5xl mx-auto select-none min-h-[calc(100vh-10rem)]">
      {/* ─── Top Header: Minimal Domain Tag + Mode Switch + Live Pill Telemetry ─── */}
      <div className="flex items-center justify-between text-xs font-mono text-[var(--text-tertiary)] w-full">
        <button
          onClick={onOpenDecks}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
          title="Change Deck"
        >
          <span className="font-semibold text-[var(--text-main)]">{domainName}</span>
          <span>•</span>
          <span>{currentIndex + 1}/{totalInDeck}</span>
        </button>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mode Switcher Pill (Typer vs Shell) */}
          {onToggleMode && (
            <button
              onClick={onToggleMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] text-xs font-mono font-medium transition-all cursor-pointer border border-white/5 hover:border-white/10"
              title={`Active: ${mode === 'shell' ? 'Freeform Shell' : 'Adaptive Typer'} (Click to switch)`}
            >
              {mode === 'shell' ? (
                <>
                  <Terminal className="w-3.5 h-3.5 text-[var(--accent-primary-soft)]" />
                  <span className="text-[var(--accent-primary-soft)] font-semibold">SHELL</span>
                </>
              ) : (
                <>
                  <Keyboard className="w-3.5 h-3.5 text-[var(--accent-green)]" />
                  <span className="text-[var(--text-main)] font-semibold">TYPER</span>
                </>
              )}
            </button>
          )}

          {/* Blitz Mode Status Pill */}
          {isBlitzMode && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent-amber)]/10 border border-[var(--accent-amber)]/30 text-xs font-mono font-semibold text-[var(--accent-amber)] animate-in fade-in">
              <Zap className="w-3.5 h-3.5 fill-[var(--accent-amber)]" />
              <span>BLITZ</span>
            </div>
          )}

          {/* Subtle Live WPM & ACC Pill */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[var(--surface-subtle)] text-xs font-mono text-[var(--text-muted)]">
            <span>
              WPM <strong className="text-[var(--text-main)] font-semibold">{liveWpm}</strong>
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>
              ACC <strong className="text-[var(--text-main)] font-semibold">{accuracy}%</strong>
            </span>
          </div>

          {/* Competency Decks Button */}
          <button
            onClick={onOpenDecks}
            className="p-1.5 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
            title="Competency Decks"
            aria-label="Competency Decks"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
            title="Drill Settings"
            aria-label="Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Center: Situation & Input Capsule Spanning Across Screen ─── */}
      <div className="my-auto py-12 sm:py-16 flex flex-col items-center justify-center space-y-8 sm:space-y-10 w-full">
        {/* Drill Task Description */}
        <p className="text-xl sm:text-2xl md:text-3xl font-medium text-[var(--text-main)] text-center leading-snug sm:leading-normal max-w-3xl px-4 select-text">
          {drill.task}
        </p>

        {/* Rounded Input Capsule Pill */}
        <div className="w-full flex flex-col items-center">
          <div
            className={`relative w-full max-w-xl sm:max-w-2xl px-6 sm:px-8 py-4 sm:py-5 rounded-2xl sm:rounded-3xl bg-[var(--surface-subtle)]/40 border transition-all flex items-center font-mono text-base sm:text-xl select-none cursor-text shadow-sm ${
              shellFeedback?.isError
                ? 'border-[var(--accent-red)]/50 shadow-[var(--accent-red)]/10'
                : 'border-white/10'
            }`}
          >
            {/* Shell Mode Prompt Prefix */}
            {mode === 'shell' && (
              <span className="text-[var(--accent-primary-soft)] select-none mr-2 font-bold shrink-0 opacity-80">
                $
              </span>
            )}

            {/* Single continuous text line for inputs, mistakes beside each other, and ghost remainder */}
            <div className="flex items-center whitespace-pre overflow-x-auto scrollbar-none w-full">
              {/* Shell Mode Content */}
              {mode === 'shell' ? (
                <>
                  <span className="text-[var(--text-main)] font-semibold">
                    {typed}
                  </span>
                  {/* Blinking shell cursor */}
                  <span
                    ref={cursorRef}
                    className="relative inline-block w-0 h-[1.2em] align-middle select-none pointer-events-none"
                  >
                    <span className="absolute top-0 bottom-0 left-0 w-[2px] bg-[var(--accent-primary-soft)] rounded-full -translate-x-[1px] animate-pulse" />
                  </span>
                  {typed.length === 0 && (
                    <span className="text-[var(--text-tertiary)]/40 italic text-sm ml-1 select-none">
                      enter bash command &amp; press Enter...
                    </span>
                  )}
                </>
              ) : (
                /* Typer Mode Content */
                <>
                  {/* Correctly typed text */}
                  <span className="text-[var(--accent-green)] font-semibold">
                    {typed}
                  </span>

                  {/* Mistake characters rendered beside each other in red */}
                  {errorText.length > 0 && (
                    <span className="text-[var(--accent-red)] font-semibold">
                      {errorText.replace(/ /g, '␣')}
                    </span>
                  )}

                  {/* Seamless steady cursor with ZERO layout spacing */}
                  <span
                    ref={cursorRef}
                    className="relative inline-block w-0 h-[1.2em] align-middle select-none pointer-events-none"
                  >
                    <span className="absolute top-0 bottom-0 left-0 w-[2px] bg-[var(--accent-primary-soft)] rounded-full -translate-x-[1px]" />
                  </span>

                  {/* Ghost remainder text on the same single text line */}
                  {stage === 3 ? (
                    typed.length === 0 && errorText.length === 0 ? (
                      <span className="text-[var(--text-tertiary)]/40 italic text-sm ml-1 select-none">
                        type from memory...
                      </span>
                    ) : null
                  ) : (
                    <span
                      className={`${
                        stage === 2
                          ? 'text-[var(--text-tertiary)]/60 tracking-widest font-bold'
                          : 'text-[var(--text-tertiary)]/40 font-normal'
                      }`}
                    >
                      {remainingGhost}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Inline Feedback Bar (Stderr or Tip in Shell Mode) */}
          <AnimatePresence>
            {shellFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={`mt-3.5 px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 max-w-xl text-center ${
                  shellFeedback.isError
                    ? 'bg-[var(--accent-red)]/10 text-[var(--accent-red)] border border-[var(--accent-red)]/30'
                    : 'bg-[var(--accent-green)]/10 text-[var(--accent-green)] border border-[var(--accent-green)]/30'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="select-text">{shellFeedback.message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
