import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Zap, Terminal, Keyboard, HelpCircle, Settings } from 'lucide-react';
import SquishSwitch from '../SquishSwitch';
import { type DrillStage, type DrillMode, useDrillProgress } from '../../lib/useDrillProgress';

interface DrillSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStage: DrillStage;
  onSelectStage: (stage: DrillStage) => void;
  drillMode: DrillMode;
  onSelectDrillMode: (mode: DrillMode) => void;
  isBlitzMode: boolean;
  onToggleBlitzMode: (enabled: boolean) => void;
}

export default function DrillSettingsModal({
  isOpen,
  onClose,
  currentStage,
  onSelectStage,
  drillMode,
  onSelectDrillMode,
  isBlitzMode,
  onToggleBlitzMode,
}: DrillSettingsModalProps) {
  const { globalStats } = useDrillProgress();
  const modalRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const helpBtnRef = useRef<HTMLButtonElement>(null);
  const [stageOverride, setStageOverride] = useState<DrillStage | null>(null);
  const [showExecutionInfo, setShowExecutionInfo] = useState(false);

  const pendingStage = stageOverride ?? currentStage;
  const hasStageChanged = stageOverride !== null && stageOverride !== currentStage;

  const handleClose = useCallback(() => {
    setStageOverride(null);
    setShowExecutionInfo(false);
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

  // Close speechbox on outside click
  useEffect(() => {
    if (!showExecutionInfo) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !helpBtnRef.current?.contains(e.target as Node)
      ) {
        setShowExecutionInfo(false);
      }
    }
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [showExecutionInfo]);

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
                <h2 className="text-base font-semibold tracking-tight text-[var(--text-main)] flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[var(--accent-primary-soft)]" />
                  Drill Settings
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

            {/* Execution Mode Selector */}
            <div className="mb-6 space-y-2 relative">
              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium font-mono">
                    Execution Mode
                  </span>
                  <button
                    ref={helpBtnRef}
                    type="button"
                    onClick={() => setShowExecutionInfo((v) => !v)}
                    className="p-0.5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                    title="What is Execution Mode? (?)"
                    aria-label="Execution mode help"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Monotone Speechbox Popover Modal */}
              <AnimatePresence>
                {showExecutionInfo && (
                  <motion.div
                    ref={popoverRef}
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{
                      duration: 0.25,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="absolute left-0 top-7 w-[19rem] sm:w-[22rem] bg-[var(--surface-base)] border border-white/10 rounded-2xl shadow-[0_24px_56px_-6px_rgba(0,0,0,0.7),0_12px_24px_-6px_rgba(0,0,0,0.4)] z-50 p-4 select-text origin-top-left"
                  >
                    {/* Speech bubble pointer / beak indicator pointing to (?) button */}
                    <div
                      className="absolute -top-1.5 left-27 w-3 h-3 bg-[var(--surface-base)] border-t border-l border-white/10 rotate-45 pointer-events-none"
                      aria-hidden="true"
                    />

                    <div className="space-y-3 font-mono text-left">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <span className="text-xs font-semibold text-[var(--text-main)] tracking-tight">
                          Execution Mode
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowExecutionInfo(false)}
                          className="text-[var(--text-tertiary)] hover:text-[var(--text-main)] transition-colors p-0.5 cursor-pointer"
                          aria-label="Close"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                        Defines how your commands are entered, processed, and validated during drills.
                      </p>

                      <div className="space-y-2.5 pt-1 border-t border-white/5">
                        <div>
                          <div className="text-[11px] font-semibold text-[var(--text-main)]">
                            Adaptive Typer
                          </div>
                          <p className="text-[10px] text-[var(--text-muted)] leading-relaxed mt-0.5">
                            Real-time keystroke trainer. Dynamically evaluates keystrokes against all valid command variations, flag orders, or omitted defaults without character locking.
                          </p>
                        </div>

                        <div>
                          <div className="text-[11px] font-semibold text-[var(--text-main)]">
                            Freeform Shell
                          </div>
                          <p className="text-[10px] text-[var(--text-muted)] leading-relaxed mt-0.5">
                            Terminal input line. Type any command or chained pipeline freely (e.g. <span className="text-[var(--text-main)]">useradd alice &amp;&amp; passwd</span>) and press Enter to evaluate against the virtual system.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onSelectDrillMode('typer')}
                  className={`p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                    drillMode === 'typer'
                      ? 'bg-[var(--surface-active)] border-[var(--accent-primary)]/50 text-[var(--text-main)] shadow-sm'
                      : 'bg-[var(--surface-subtle)] border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)]/50'
                  }`}
                >
                  <div className="text-xs font-semibold font-mono flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[var(--text-main)]">
                      <Keyboard className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      Adaptive Typer
                    </span>
                    {drillMode === 'typer' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary-soft)]" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectDrillMode('shell')}
                  className={`p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                    drillMode === 'shell'
                      ? 'bg-[var(--surface-active)] border-[var(--accent-primary)]/50 text-[var(--text-main)] shadow-sm'
                      : 'bg-[var(--surface-subtle)] border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)]/50'
                  }`}
                >
                  <div className="text-xs font-semibold font-mono flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[var(--text-main)]">
                      <Terminal className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      Freeform Shell
                    </span>
                    {drillMode === 'shell' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary-soft)]" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Blitz Mode Toggle */}
            <div className="mb-6 p-3 px-3.5 rounded-2xl bg-[var(--surface-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-[var(--text-main)]">
                <Zap className="w-4 h-4 text-[var(--accent-amber)]" />
                <span>Blitz mode</span>
              </div>

              <SquishSwitch
                checked={isBlitzMode}
                onChange={onToggleBlitzMode}
                trackColor="var(--surface-active)"
                trackOnColor="var(--accent-primary)"
                thumbColor="#ffffff"
                thumbOnColor="#ffffff"
                width={42}
                height={22}
                radius={11}
                speed={60}
                stretch={32}
                ariaLabel="Toggle Blitz mode"
              />
            </div>

            {/* Confirm Stage Change Button appears at the bottom of the modal */}
            <AnimatePresence>
              {hasStageChanged && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 8 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="overflow-hidden"
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

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-end text-xs text-[var(--text-tertiary)] font-mono">
              <span>Press Esc to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
