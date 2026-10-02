import { useRef, useEffect } from 'react';
import { type DrillItem } from '../../data/drillDecks';
import { type DrillStage } from '../../lib/useDrillProgress';
import { Settings2, RotateCcw } from 'lucide-react';

interface MinimalTyperCardProps {
  drill: DrillItem;
  stage: DrillStage;
  currentIndex: number;
  totalInDeck: number;
  domainName: string;
  typed: string;
  target: string;
  isLocked: boolean;
  mistakeChar: string | null;
  clozeTemplate: string;
  liveWpm: number;
  accuracy: number;
  onReset: () => void;
  onOpenSettings: () => void;
}

export default function MinimalTyperCard({
  drill,
  stage,
  currentIndex,
  totalInDeck,
  domainName,
  typed,
  target,
  isLocked,
  mistakeChar,
  clozeTemplate,
  liveWpm,
  accuracy,
  onReset,
  onOpenSettings,
}: MinimalTyperCardProps) {
  const cursorRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll cursor into view when typing long commands
  useEffect(() => {
    cursorRef.current?.scrollIntoView({ behavior: 'instant', inline: 'nearest', block: 'nearest' });
  }, [typed]);

  // Compute ghost remainder
  let remainder = '';
  if (stage === 1) {
    remainder = target.slice(typed.length);
  } else if (stage === 2) {
    remainder = clozeTemplate.slice(typed.length);
  } else if (stage === 3) {
    remainder = '';
  }

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-6 sm:py-10 max-w-5xl mx-auto select-none min-h-[calc(100vh-10rem)]">
      {/* ─── Top Header: Minimal Domain Tag + Live Pill Telemetry ─── */}
      <div className="flex items-center justify-between text-xs font-mono text-[var(--text-tertiary)] w-full">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
          title="Change Deck or Stage (Esc)"
        >
          <span className="font-semibold text-[var(--text-main)]">{domainName}</span>
          <span>•</span>
          <span>{currentIndex + 1}/{totalInDeck}</span>
        </button>

        <div className="flex items-center gap-3">
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

          {/* Quick Menu Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
            title="Drill Settings (Esc)"
            aria-label="Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Center: Situation & Input Capsule Spanning Across Screen ─── */}
      <div className="my-auto py-12 sm:py-16 flex flex-col items-center justify-center space-y-8 sm:space-y-10 w-full">
        {/* *insert situation here* */}
        <p className="text-xl sm:text-2xl md:text-3xl font-medium text-[var(--text-main)] text-center leading-snug sm:leading-normal max-w-3xl px-4 select-text">
          {drill.task}
        </p>

        {/* Rounded Input Capsule Pill: [ ls /ram/home ] */}
        <div className="w-full flex flex-col items-center">
          <div className="relative w-full max-w-xl sm:max-w-2xl px-6 sm:px-8 py-4 sm:py-5 rounded-2xl sm:rounded-3xl bg-[var(--surface-subtle)]/40 border border-white/10 transition-colors flex items-center font-mono text-base sm:text-xl select-none cursor-text shadow-sm">
            {/* Split character rendering */}
            <div className="flex items-center whitespace-pre overflow-x-auto scrollbar-none w-full">
              {/* Correctly typed text */}
              <span className="text-[var(--accent-green)] font-semibold">
                {typed}
              </span>

              {/* Error text (No card redness, no shaking — just the text goes red) */}
              {isLocked ? (
                <span
                  ref={cursorRef}
                  className="text-[var(--accent-red)] font-bold text-base sm:text-xl mx-0.5 underline decoration-[var(--accent-red)] underline-offset-4"
                >
                  {mistakeChar === ' ' ? '␣' : mistakeChar}
                </span>
              ) : (
                /* Steady cursor (No pulsing) */
                <span
                  ref={cursorRef}
                  className="inline-block w-[2.5px] h-[1.3em] bg-[var(--accent-primary-soft)] rounded-full mx-0.5"
                />
              )}

              {/* Ghost remainder / Cloze mask */}
              {stage === 3 ? (
                typed.length === 0 ? (
                  <span className="text-[var(--text-tertiary)]/40 italic text-sm ml-1 select-none">
                    type from memory...
                  </span>
                ) : null
              ) : (
                <span
                  className={`${
                    stage === 2
                      ? 'text-[var(--text-tertiary)]/60 tracking-widest font-bold'
                      : 'text-[var(--text-tertiary)]/35 font-normal'
                  }`}
                >
                  {remainder}
                </span>
              )}
            </div>
          </div>

          {/* Minimal text-only error prompt (No red card background) */}
          {isLocked && (
            <div className="mt-3 text-xs text-[var(--accent-red)] font-mono text-center">
              Press Backspace to clear typo
            </div>
          )}
        </div>
      </div>

      {/* ─── Bottom Footer: Stage badge & Shortcuts ─── */}
      <div className="flex items-center justify-between text-xs font-mono text-[var(--text-tertiary)] w-full pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span>
            {stage === 1 && 'Stage 1 • Ghost Assist'}
            {stage === 2 && 'Stage 2 • Cloze Blanking'}
            {stage === 3 && 'Stage 3 • Blind Recall'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 hover:text-[var(--text-main)] transition-colors cursor-pointer"
            title="Restart command (Tab)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tab: Reset</span>
          </button>
          <span>Esc: Menu</span>
        </div>
      </div>
    </div>
  );
}
