import { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ArrowRight, RotateCcw, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { type DrillItem } from '../../data/drillDecks';
import { type DrillStage } from '../../lib/useDrillProgress';

interface MinimalStatsCardProps {
  drill: DrillItem;
  stage: DrillStage;
  wpm: number;
  accuracy: number;
  errors: number;
  elapsedSeconds: number;
  bestWpm: number;
  isNewMastery: boolean;
  isDeckFinished: boolean;
  onNext: () => void;
  onRetry: () => void;
}

export default function MinimalStatsCard({
  drill,
  stage,
  wpm,
  accuracy,
  errors,
  bestWpm,
  isNewMastery,
  isDeckFinished,
  onNext,
  onRetry,
}: MinimalStatsCardProps) {
  // Fire confetti if clean run or newly mastered
  useEffect(() => {
    if (isNewMastery || (stage === 3 && errors === 0)) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#7ed957', '#7e4bde', '#33b6ff', '#f8d24a'],
      });
    }
  }, [isNewMastery, stage, errors]);

  // Keyboard shortcut listener: Enter = next, R = retry
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onRetry();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onRetry]);

  const isCleanRun = errors === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-[560px] lg:max-w-[420px] bg-[var(--surface-base)] rounded-3xl shadow-2xl shadow-black/40 text-[var(--text-main)] p-7 sm:p-9 select-none border border-white/10 flex flex-col justify-between min-h-[380px]"
    >
      {/* ─── Top Header: Status Ribbon ─── */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5">
          {isNewMastery ? (
            <span className="flex items-center gap-1 text-[var(--accent-amber)] font-medium">
              <Award className="w-4 h-4 fill-current" />
              Mastered!
            </span>
          ) : isCleanRun ? (
            <span className="flex items-center gap-1 text-[var(--accent-green)] font-medium">
              <Sparkles className="w-4 h-4" />
              Clean Run
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[var(--text-muted)]">
              <CheckCircle2 className="w-4 h-4" />
              {errors} correction{errors > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-subtle)] text-[11px] text-[var(--text-tertiary)]">
          Stage {stage}/3
        </span>
      </div>

      {/* ─── Center: Big Telemetry Numbers (Matching User's Sketch) ─── */}
      <div className="my-auto py-4">
        <div className="grid grid-cols-2 gap-6 text-center">
          {/* WPM Column */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
              WPM
            </span>
            <span className="text-5xl sm:text-6xl font-bold font-mono tracking-tight text-[var(--text-main)] mt-1.5">
              {wpm}
            </span>
            <span className="text-[11px] font-mono text-[var(--text-tertiary)] mt-1">
              {wpm >= bestWpm && bestWpm > 0 ? (
                <span className="text-[var(--accent-green)] font-medium">New Record!</span>
              ) : (
                `Best: ${bestWpm || wpm}`
              )}
            </span>
          </div>

          {/* ACC Column */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
              ACC
            </span>
            <span className="text-5xl sm:text-6xl font-bold font-mono tracking-tight text-[var(--text-main)] mt-1.5">
              {accuracy}
            </span>
            <span className="text-[11px] font-mono text-[var(--text-tertiary)] mt-1">
              {isCleanRun ? '100% Accuracy' : `${errors} typo${errors > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        {/* Pedagogical Explanation Takeaway */}
        {drill.explanation && (
          <div className="mt-6 p-3.5 rounded-2xl bg-[var(--surface-subtle)]/70 border border-white/5 text-xs text-[var(--text-muted)] leading-relaxed">
            <p className="select-text">{drill.explanation}</p>
          </div>
        )}
      </div>

      {/* ─── Bottom Actions ─── */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/5">
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
          title="Repeat drill (R)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Repeat (R)</span>
        </button>

        <button
          onClick={onNext}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-semibold font-mono shadow-lg transition-transform active:scale-95 cursor-pointer"
        >
          <span>{isDeckFinished ? 'Done' : 'Next'}</span>
          <ArrowRight className="w-4 h-4" />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono">
            Enter ↵
          </kbd>
        </button>
      </div>
    </motion.div>
  );
}
