import React from 'react';
import {
  Terminal,
  Users,
  Package,
  Network,
  HardDrive,
  Cpu,
  ShieldCheck,
  FileCode2,
  ChevronRight,
  Flame,
  Award,
  Sparkles,
  Zap,
} from 'lucide-react';
import { DRILL_DECKS, type DomainCode } from '../../data/drillDecks';
import { useDrillProgress } from '../../lib/useDrillProgress';

interface DrillDeckSelectorProps {
  onSelectDeck: (domain: DomainCode) => void;
  selectedDomain?: DomainCode;
}

const DOMAIN_ICONS: Record<DomainCode, React.ReactNode> = {
  BASIC: <Terminal className="w-5 h-5" />,
  USER: <Users className="w-5 h-5" />,
  PKG: <Package className="w-5 h-5" />,
  NET: <Network className="w-5 h-5" />,
  FS: <HardDrive className="w-5 h-5" />,
  SVC: <Cpu className="w-5 h-5" />,
  SEC: <ShieldCheck className="w-5 h-5" />,
  SCR: <FileCode2 className="w-5 h-5" />,
};

export default function DrillDeckSelector({
  onSelectDeck,
  selectedDomain,
}: DrillDeckSelectorProps) {
  const { getDomainStats, globalStats } = useDrillProgress();

  return (
    <div className="w-full space-y-6">
      {/* Overview Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Mastered */}
        <div className="p-4 rounded-2xl bg-[var(--surface-base)] border border-white/5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-green-bg)] text-[var(--accent-green)] flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--text-main)]">
              {globalStats.totalMastered}
              <span className="text-xs text-[var(--text-tertiary)] font-normal">
                /{globalStats.totalDrills}
              </span>
            </div>
            <div className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
              Mastered ({globalStats.masteryPercent}%)
            </div>
          </div>
        </div>

        {/* Global Streak */}
        <div className="p-4 rounded-2xl bg-[var(--surface-base)] border border-white/5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-amber-bg)] text-[var(--accent-amber)] flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--accent-amber)]">
              {globalStats.currentStreak}
              <span className="text-xs text-[var(--text-tertiary)] font-normal ml-1">
                (Best: {globalStats.bestStreak})
              </span>
            </div>
            <div className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
              Clean Streak
            </div>
          </div>
        </div>

        {/* Average Typing Speed */}
        <div className="p-4 rounded-2xl bg-[var(--surface-base)] border border-white/5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-blue-bg)] text-[var(--accent-blue)] flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--text-main)]">
              {globalStats.avgWpm}
              <span className="text-xs text-[var(--text-tertiary)] font-normal ml-1">
                WPM
              </span>
            </div>
            <div className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
              Average Speed
            </div>
          </div>
        </div>

        {/* Peak Speed Record */}
        <div className="p-4 rounded-2xl bg-[var(--surface-base)] border border-white/5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary-bg)] text-[var(--accent-primary-soft)] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--text-main)]">
              {globalStats.bestWpm}
              <span className="text-xs text-[var(--text-tertiary)] font-normal ml-1">
                WPM
              </span>
            </div>
            <div className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
              Peak Speed
            </div>
          </div>
        </div>
      </div>

      {/* Domain Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DRILL_DECKS.map((deck) => {
          const stats = getDomainStats(deck.id);
          const isSelected = selectedDomain === deck.id;

          return (
            <div
              key={deck.id}
              onClick={() => onSelectDeck(deck.id)}
              className={`group relative p-5 rounded-3xl bg-[var(--surface-base)] border transition-all duration-150 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5 ${
                isSelected
                  ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20 shadow-lg'
                  : 'border-white/5 hover:border-white/15'
              }`}
            >
              <div>
                {/* Header Icon + Domain code */}
                <div className="flex items-center justify-between mb-3.5">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105"
                    style={{ backgroundColor: `${deck.accentColor}25`, color: deck.accentColor }}
                  >
                    {DOMAIN_ICONS[deck.id]}
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-subtle)] text-[11px] font-mono font-semibold text-[var(--text-tertiary)]">
                    {deck.shortName}
                  </span>
                </div>

                {/* Deck Title */}
                <h3 className="text-base font-semibold tracking-tight text-[var(--text-main)] group-hover:text-[var(--accent-primary-soft)] transition-colors">
                  {deck.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed">
                  {deck.subtitle}
                </p>
              </div>

              {/* Progress & Stats Bar */}
              <div className="mt-5 pt-3.5 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--text-tertiary)]">Mastery</span>
                  <span className="font-semibold text-[var(--text-main)]">
                    {stats.mastered}/{stats.total}{' '}
                    <span className="text-[var(--text-tertiary)] font-normal">
                      ({stats.percentMastered}%)
                    </span>
                  </span>
                </div>

                {/* Micro Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-[var(--surface-subtle)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${stats.percentMastered}%`,
                      backgroundColor: stats.percentMastered === 100 ? '#7ed957' : deck.accentColor,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-tertiary)] pt-1">
                  <span>{stats.avgWpm > 0 ? `${stats.avgWpm} WPM Avg` : 'Not started'}</span>
                  <span className="flex items-center gap-0.5 text-[var(--accent-primary-soft)] group-hover:translate-x-0.5 transition-transform font-medium">
                    Drill Deck
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
