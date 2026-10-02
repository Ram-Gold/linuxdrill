import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Award, RotateCcw } from 'lucide-react';
import { DRILL_DECKS, type DomainCode } from '../../data/drillDecks';
import { type DrillStage, useDrillProgress } from '../../lib/useDrillProgress';

interface DrillSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDomain: DomainCode;
  onSelectDomain: (domain: DomainCode) => void;
  currentStage: DrillStage;
  onSelectStage: (stage: DrillStage) => void;
}

export default function DrillSettingsModal({
  isOpen,
  onClose,
  selectedDomain,
  onSelectDomain,
  currentStage,
  onSelectStage,
}: DrillSettingsModalProps) {
  const { getDomainStats, globalStats, resetDomainProgress } = useDrillProgress();
  const modalRef = useRef<HTMLDivElement>(null);
  const [stageOverride, setStageOverride] = useState<DrillStage | null>(null);

  const pendingStage = stageOverride ?? currentStage;
  const hasStageChanged = stageOverride !== null && stageOverride !== currentStage;

  const handleClose = useCallback(() => {
    setStageOverride(null);
    onClose();
  }, [onClose]);

  const handleApplyStage = useCallback(() => {
    if (stageOverride !== null) {
      onSelectStage(stageOverride);
    }
    setStageOverride(null);
    onClose();
  }, [stageOverride, onSelectStage, onClose]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleClose();
      }
    }
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  // Handle Escape key and Enter key (to confirm stage changes)
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleClose();
      } else if (e.key === 'Enter' && hasStageChanged) {
        e.preventDefault();
        e.stopPropagation();
        handleApplyStage();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, hasStageChanged, handleApplyStage]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Panel - Styled to match SoundSettingsModal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="relative w-full max-w-[560px] bg-[var(--surface-base)] rounded-3xl shadow-2xl shadow-black/40 z-10 text-[var(--text-main)] p-6 sm:p-8 select-none border border-white/10 max-h-[88vh] overflow-y-auto"
          >
            {/* Header: Title + Close */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-[var(--text-main)]">
                  Drill Setup & Competencies
                </h2>
                <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                  {globalStats.totalMastered}/{globalStats.totalDrills} Mastered ({globalStats.masteryPercent}%) • Best: {globalStats.bestWpm} WPM
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--surface-subtle)] cursor-pointer transition-colors"
                aria-label="Close settings"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scaffolding Stage Mode Selector */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium font-mono">
                  Practice Stage
                </span>
                {hasStageChanged && (
                  <span className="text-[10px] font-mono text-[var(--accent-amber)] font-medium">
                    Unsaved stage change
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { stage: 1 as DrillStage, name: '1. Assist', desc: 'Full ghost text' },
                  { stage: 2 as DrillStage, name: '2. Cloze', desc: 'Syntax blanking' },
                  { stage: 3 as DrillStage, name: '3. Blind', desc: 'Pure recall' },
                ].map((s) => {
                  const isActive = pendingStage === s.stage;
                  return (
                    <button
                      key={s.stage}
                      type="button"
                      onClick={() => setStageOverride(s.stage === currentStage ? null : s.stage)}
                      className={`p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-[var(--surface-active)] border-[var(--accent-primary)]/50 text-[var(--text-main)] shadow-sm'
                          : 'bg-[var(--surface-subtle)] border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)]/50'
                      }`}
                    >
                      <div className="text-xs font-semibold font-mono flex items-center justify-between">
                        <span>{s.name}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary-soft)]" />
                        )}
                      </div>
                      <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{s.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Competency Track Decks */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium font-mono px-0.5">
                Linux Competency Decks
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DRILL_DECKS.map((deck) => {
                  const stats = getDomainStats(deck.id);
                  const isSelected = selectedDomain === deck.id;

                  return (
                    <button
                      key={deck.id}
                      onClick={() => {
                        if (hasStageChanged) {
                          onSelectStage(pendingStage);
                        }
                        onSelectDomain(deck.id);
                        onClose();
                      }}
                      className={`p-3 rounded-2xl text-left transition-all cursor-pointer border flex items-center justify-between group ${
                        isSelected
                          ? 'bg-[var(--surface-active)] border-[var(--accent-primary)]/50 text-[var(--text-main)] shadow-sm'
                          : 'bg-[var(--surface-subtle)] border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)]/50'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: deck.accentColor }}
                          />
                          <span className="text-xs font-semibold truncate text-[var(--text-main)]">
                            {deck.name}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-[var(--text-tertiary)] mt-1 flex items-center gap-2">
                          <span>{stats.mastered}/{stats.total} Mastered</span>
                          {stats.avgWpm > 0 && <span>• {stats.avgWpm} WPM</span>}
                        </div>
                      </div>

                      {isSelected ? (
                        <Check className="w-4 h-4 text-[var(--accent-primary-soft)] shrink-0" />
                      ) : stats.percentMastered === 100 ? (
                        <Award className="w-4 h-4 text-[var(--accent-green)] shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Confirm Stage Change Button appears at the bottom of the modal */}
            <AnimatePresence>
              {hasStageChanged && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 8 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="overflow-hidden mt-6"
                >
                  <button
                    type="button"
                    onClick={handleApplyStage}
                    className="w-full py-2.5 px-4 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-semibold font-mono flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent-primary)]/20 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply Changes & Confirm</span>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono ml-1">
                      Enter ↵
                    </kbd>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer with Reset option */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[var(--text-tertiary)] font-mono">
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Reset progress for ${selectedDomain} deck?`)) {
                    resetDomainProgress(selectedDomain);
                  }
                }}
                className="flex items-center gap-1.5 text-[var(--text-tertiary)] hover:text-[var(--accent-red)] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset {selectedDomain}</span>
              </button>

              <span>Press Esc to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
