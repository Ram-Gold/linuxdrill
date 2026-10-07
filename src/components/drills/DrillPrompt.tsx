import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { type DrillStage } from '../../lib/useDrillProgress';
import { AlertCircle, Eye, EyeOff, RotateCcw } from 'lucide-react';

interface DrillPromptProps {
  typed: string;
  target: string;
  isLocked: boolean;
  mistakeChar: string | null;
  stage: DrillStage;
  clozeTemplate: string;
  shakeKey: number;
  onReset: () => void;
}

export default function DrillPrompt({
  typed,
  target,
  isLocked,
  mistakeChar,
  stage,
  clozeTemplate,
  shakeKey,
  onReset,
}: DrillPromptProps) {
  const [peekBlind, setPeekBlind] = useState(false);

  // Compute split rendering
  // Span 1: Correctly typed characters
  const typedPart = typed;

  // Span 3: Ghost/Cloze/Blind remainder
  let remainder = '';
  if (stage === 1) {
    // Stage 1: Full Ghost Assist
    remainder = target.slice(typed.length + (isLocked ? 0 : 0));
  } else if (stage === 2) {
    // Stage 2: Partial Cloze Blanking
    remainder = clozeTemplate.slice(typed.length);
  } else if (stage === 3) {
    // Stage 3: Blind Recall
    remainder = peekBlind ? target.slice(typed.length) : '';
  }

  return (
    <div
      className={`relative w-full rounded-2xl bg-[var(--surface-card)] transition-all duration-150 overflow-hidden shadow-2xl ${
        isLocked
          ? 'animate-drill-shake ring-2 ring-[var(--accent-red)]/50'
          : 'ring-1 ring-white/10 hover:ring-white/20'
      }`}
      key={shakeKey}
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--surface-subtle)]/70 backdrop-blur-md select-none border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-xs" />
          </div>
          <span className="text-xs font-mono text-[var(--text-tertiary)] ml-2 flex items-center gap-1.5">
            <span>bash</span>
            <span className="text-white/20">•</span>
            <span>CLI Memory Typer</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Stage 3 Peek Toggle */}
          {stage === 3 && (
            <button
              onClick={() => setPeekBlind((p) => !p)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)] transition-colors cursor-pointer"
              title="Peek target command"
            >
              {peekBlind ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{peekBlind ? 'Hide' : 'Peek'}</span>
            </button>
          )}

          {/* Quick Restart Button */}
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)] transition-colors cursor-pointer"
            title="Restart drill (Tab)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restart</span>
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-5 sm:p-6 lg:p-7 font-mono text-sm sm:text-base lg:text-lg min-h-[140px] flex flex-col justify-center">
        {/* Terminal Line */}
        <div className="flex flex-wrap items-center leading-relaxed tracking-wide select-none break-all">
          {/* Shell Prompt Prefix */}
          <span className="text-[var(--accent-green)] font-semibold shrink-0 mr-2">
            student@bashist
          </span>
          <span className="text-white/40 mr-1">:</span>
          <span className="text-[var(--accent-blue)] font-medium shrink-0 mr-1.5">
            ~
          </span>
          <span className="text-[var(--text-muted)] font-bold shrink-0 mr-2.5">
            $
          </span>

          {/* ─── CHARACTER BUFFER SPLIT RENDERING ─── */}
          <span className="relative inline-flex items-center flex-wrap">
            {/* Span 1: Correctly Typed Characters */}
            <span className="text-[var(--accent-green)] font-medium bg-[var(--accent-green-bg)]/30 rounded-xs px-0.5 py-0.5">
              {typedPart}
            </span>

            {/* Span 2: Active Cursor & Lock Indicator */}
            {isLocked ? (
              <span className="relative inline-flex items-center mx-0.5">
                {/* Mistyped red block */}
                <span className="px-1.5 py-0.5 bg-[var(--accent-red)] text-white font-bold rounded-xs shadow-md animate-pulse">
                  {mistakeChar === ' ' ? '␣' : mistakeChar || 'X'}
                </span>
              </span>
            ) : (
              <span className="relative inline-block w-2.5 h-5 -mb-1 bg-[var(--accent-primary-soft)] animate-cursor-blink rounded-xs shadow-[0_0_8px_var(--accent-primary)]" />
            )}

            {/* Span 3: Dim Ghost Text / Cloze Template / Blind Dots */}
            {stage === 3 && !peekBlind ? (
              <span className="text-[var(--text-tertiary)]/40 italic ml-1 text-xs select-none">
                {typedPart.length === 0 ? 'Type from active recall...' : ''}
              </span>
            ) : (
              <span
                className={`select-none ml-0.5 ${
                  stage === 2
                    ? 'text-[var(--text-tertiary)]/70 tracking-widest font-bold'
                    : 'text-[var(--text-muted)]/40 font-normal'
                }`}
              >
                {remainder}
              </span>
            )}
          </span>
        </div>

        {/* Error Lock Status Notification */}
        <AnimatePresence>
          {isLocked && (
            <motion.div
              key="syntax-lock-banner"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--accent-red-bg)] text-[var(--accent-red)] text-xs font-medium select-none border border-[var(--accent-red)]/20"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                <strong>Syntax Lock:</strong> Incorrect key struck! Press{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-base)] text-white font-mono text-[11px] border border-white/10 shadow-xs">
                  Backspace
                </kbd>{' '}
                to clear the mistake and resume.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scaffolding Stage Mode Footer Pill */}
      <div className="px-5 py-2.5 bg-[var(--surface-subtle)]/40 border-t border-white/5 flex items-center justify-between text-xs text-[var(--text-tertiary)] font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)]">Mode:</span>
          {stage === 1 && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--accent-blue-bg)] text-[var(--accent-blue)] font-medium text-[11px]">
              Stage 1 • Full Ghost Assist
            </span>
          )}
          {stage === 2 && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--accent-amber-bg)] text-[var(--accent-amber)] font-medium text-[11px]">
              Stage 2 • Cloze Syntax Blanking
            </span>
          )}
          {stage === 3 && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--accent-primary-bg)] text-[var(--accent-primary-soft)] font-medium text-[11px]">
              Stage 3 • Blind Motor Recall
            </span>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <span>
            Progress: {typed.length} / {target.length} chars
          </span>
          <span>Tab: Restart</span>
        </div>
      </div>
    </div>
  );
}
