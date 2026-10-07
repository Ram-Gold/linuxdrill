import { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Zap,
  Gauge,
  Target,
  Clock,
  BookOpen,
  Award,
} from 'lucide-react';
import { type DrillItem } from '../../data/drillDecks';
import { type DrillStage } from '../../lib/useDrillProgress';

interface DrillCompletionModalProps {
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
  onBackToDecks: () => void;
}

export default function DrillCompletionModal({
  drill,
  stage,
  wpm,
  accuracy,
  errors,
  elapsedSeconds,
  bestWpm,
  isNewMastery,
  isDeckFinished,
  onNext,
  onRetry,
  onBackToDecks,
}: DrillCompletionModalProps) {
  // Trigger celebratory confetti if completed clean or mastered!
  useEffect(() => {
    if (isNewMastery || (stage === 3 && errors === 0)) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7ed957', '#7e4bde', '#33b6ff', '#f8d24a'],
      });
    }
  }, [isNewMastery, stage, errors]);

  // Keyboard shortcut listener: Enter = next, R = retry, Esc = decks
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onRetry();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onBackToDecks();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onRetry, onBackToDecks]);

  const isCleanRun = errors === 0;

  return (
    <motion.div
      key="drill-completion-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="w-full max-w-xl rounded-3xl bg-[var(--surface-base)] border border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-[var(--text-main)] max-h-[90vh] overflow-y-auto"
      >
        {/* Header Ribbon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                isNewMastery
                  ? 'bg-[var(--accent-amber-bg)] text-[var(--accent-amber)]'
                  : isCleanRun
                  ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green)]'
                  : 'bg-[var(--accent-primary-bg)] text-[var(--accent-primary-soft)]'
              }`}
            >
              {isNewMastery ? (
                <Award className="w-5 h-5 fill-current" />
              ) : isCleanRun ? (
                <Sparkles className="w-5 h-5 fill-current" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {isNewMastery
                  ? 'Command Mastered!'
                  : isDeckFinished
                  ? 'Deck Completed!'
                  : isCleanRun
                  ? 'Flawless Execution!'
                  : 'Drill Completed'}
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-mono">
                {isNewMastery
                  ? 'Mastery unlocked: zero-error motor recall achieved'
                  : isCleanRun
                  ? 'Zero syntax errors detected'
                  : `${errors} correction${errors > 1 ? 's' : ''} made`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-subtle)] text-xs font-mono text-[var(--text-muted)]">
            <span>Stage {stage}/3</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* WPM */}
          <div className="p-3.5 rounded-2xl bg-[var(--surface-subtle)] border border-white/5 flex flex-col">
            <span className="text-[11px] font-mono uppercase text-[var(--text-tertiary)] flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
              Speed
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-[var(--text-main)]">
                {wpm}
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">WPM</span>
            </div>
            {wpm >= bestWpm && bestWpm > 0 && (
              <span className="text-[10px] text-[var(--accent-green)] font-mono mt-0.5">
                New Record!
              </span>
            )}
          </div>

          {/* Accuracy */}
          <div className="p-3.5 rounded-2xl bg-[var(--surface-subtle)] border border-white/5 flex flex-col">
            <span className="text-[11px] font-mono uppercase text-[var(--text-tertiary)] flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-[var(--accent-green)]" />
              Accuracy
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-[var(--text-main)]">
                {accuracy}%
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)] font-mono mt-0.5">
              {errors} error{errors !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Time Elapsed */}
          <div className="p-3.5 rounded-2xl bg-[var(--surface-subtle)] border border-white/5 flex flex-col">
            <span className="text-[11px] font-mono uppercase text-[var(--text-tertiary)] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
              Time
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-[var(--text-main)]">
                {elapsedSeconds}
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">s</span>
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)] font-mono mt-0.5">
              Duration
            </span>
          </div>

          {/* Scaffolding status */}
          <div className="p-3.5 rounded-2xl bg-[var(--surface-subtle)] border border-white/5 flex flex-col">
            <span className="text-[11px] font-mono uppercase text-[var(--text-tertiary)] flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[var(--accent-primary-soft)]" />
              Next Phase
            </span>
            <div className="mt-1 font-mono font-semibold text-sm text-[var(--accent-primary-soft)]">
              {stage === 1 && isCleanRun
                ? 'Stage 2 (Cloze)'
                : stage === 2 && isCleanRun
                ? 'Stage 3 (Blind)'
                : stage === 3 && isCleanRun
                ? '⭐ Mastered'
                : `Retry Stage ${stage}`}
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)] font-mono mt-0.5">
              {isCleanRun ? 'Advanced' : 'Needs Clean Run'}
            </span>
          </div>
        </div>

        {/* Command & Pedagogical Breakdown */}
        <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-white/5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
            <span>Executed Command</span>
          </div>

          <div className="px-3 py-2 rounded-xl bg-black/40 font-mono text-xs sm:text-sm text-[var(--accent-green)] break-all border border-white/5">
            {drill.command}
          </div>

          {drill.explanation && (
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              {drill.explanation}
            </p>
          )}

          {drill.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {drill.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md bg-[var(--surface-subtle)] text-[10px] font-mono text-[var(--text-tertiary)]"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] text-xs font-medium font-mono text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Repeat (R)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToDecks}
              className="px-4 py-2.5 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] text-xs font-medium font-mono text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            >
              Decks (Esc)
            </button>

            <button
              onClick={onNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-semibold font-mono shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <span>{isDeckFinished ? 'Review Decks' : 'Next Command'}</span>
              <ArrowRight className="w-4 h-4" />
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono">
                Enter ↵
              </kbd>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
