import { Flame, Gauge, Target, Sparkles } from 'lucide-react';
import { type DrillStage } from '../../lib/useDrillProgress';

interface DrillStatsProps {
  wpm: number;
  accuracy: number;
  stage: DrillStage;
  onSelectStage: (stage: DrillStage) => void;
  mistakeCount: number;
  streak: number;
  bestWpm: number;
  isMastered: boolean;
}

export default function DrillStats({
  wpm,
  accuracy,
  stage,
  onSelectStage,
  mistakeCount,
  streak,
  bestWpm,
  isMastered,
}: DrillStatsProps) {
  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[var(--surface-base)] border border-white/5 shadow-md">
      {/* Left: Speed & Accuracy Metrics */}
      <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
        {/* WPM Gauge */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-blue-bg)] flex items-center justify-center text-[var(--accent-blue)]">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[var(--text-main)]">
                {wpm}
              </span>
              <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)]">
                WPM
              </span>
            </div>
            {bestWpm > 0 && (
              <div className="text-[10px] font-mono text-[var(--text-tertiary)]">
                Best: {bestWpm} WPM
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-white/10" />

        {/* Accuracy Metric */}
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              accuracy === 100
                ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green)]'
                : accuracy >= 95
                ? 'bg-[var(--accent-primary-bg)] text-[var(--accent-primary-soft)]'
                : 'bg-[var(--accent-amber-bg)] text-[var(--accent-amber)]'
            }`}
          >
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[var(--text-main)]">
                {accuracy}%
              </span>
              <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)]">
                Acc
              </span>
            </div>
            <div className="text-[10px] font-mono text-[var(--text-tertiary)]">
              {mistakeCount === 0 ? (
                <span className="text-[var(--accent-green)] font-medium">Clean Run</span>
              ) : (
                <span className="text-[var(--accent-red)]">{mistakeCount} error{mistakeCount > 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        </div>

        {/* Streak Counter */}
        {streak > 0 && (
          <>
            <div className="hidden sm:block w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-amber-bg)] flex items-center justify-center text-[var(--accent-amber)] animate-bounce">
                <Flame className="w-4 h-4 fill-current" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--accent-amber)]">
                    {streak}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)]">
                    Streak
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[var(--text-tertiary)]">
                  Zero-error runs
                </div>
              </div>
            </div>
          </>
        )}

        {/* Mastered Badge */}
        {isMastered && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-green-bg)] text-[var(--accent-green)] text-xs font-medium border border-[var(--accent-green)]/20 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mastered</span>
          </div>
        )}
      </div>

      {/* Right: Stage Scaffolding Segmented Controller */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-subtle)] border border-white/5">
        <span className="text-[11px] font-mono uppercase text-[var(--text-tertiary)] px-2 hidden md:inline">
          Stage:
        </span>
        <button
          onClick={() => onSelectStage(1)}
          className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
            stage === 1
              ? 'bg-[var(--surface-base)] text-[var(--text-main)] shadow-sm font-semibold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
          title="Stage 1: Full Ghost Assistance"
        >
          1. Assist
        </button>
        <button
          onClick={() => onSelectStage(2)}
          className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
            stage === 2
              ? 'bg-[var(--surface-base)] text-[var(--text-main)] shadow-sm font-semibold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
          title="Stage 2: Cloze Flag Blanking"
        >
          2. Cloze
        </button>
        <button
          onClick={() => onSelectStage(3)}
          className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
            stage === 3
              ? 'bg-[var(--surface-base)] text-[var(--text-main)] shadow-sm font-semibold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
          title="Stage 3: Pure Blind Recall (No Ghosting)"
        >
          3. Blind
        </button>
      </div>
    </div>
  );
}
