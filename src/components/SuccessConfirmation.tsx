import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, CheckCircle2, ArrowRight, X } from "lucide-react";
import { motion } from "motion/react";
import type { Problem } from "../lib/types";

interface SuccessConfirmationProps {
  problem: Problem;
  nextProblem?: Problem | null;
  checks?: { name: string; passed: boolean }[];
  onClose: () => void;
  earnedPoints?: number;
  totalScore?: number;
}

export default function SuccessConfirmation({
  problem,
  nextProblem,
  checks = [],
  onClose,
  earnedPoints,
  totalScore,
}: SuccessConfirmationProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="relative w-full max-w-lg rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-base)] p-6 sm:p-7 shadow-[var(--modal-shadow)] text-[var(--text-main)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 h-7 w-7 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)] flex items-center justify-center transition-colors cursor-pointer apple-press"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Badge & Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-green-bg)] border border-[var(--accent-green)]/20 text-[var(--accent-green)] mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-green)]/20 bg-[var(--accent-green-bg)] px-3 py-0.5 text-[11px] font-mono font-medium text-[var(--accent-green)] mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-green)]" />
            <span>VERIFICATION PASSED</span>
          </div>

          <h2 id="confirmation-title" className="text-lg font-semibold tracking-tight text-[var(--text-main)] mb-1">
            Challenge Solved!
          </h2>
          <p className="text-xs text-[var(--text-muted)] mb-4 font-mono">
            {problem.id} · <span className="text-[var(--accent-cyan)]">{problem.topicName}</span>
          </p>

          {/* Points Highlight */}
          <div className="w-full flex items-center justify-around rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] py-3 px-4 mb-4">
            <div className="text-center">
              <span className="block text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-mono">
                Points Earned
              </span>
              <span className="text-base font-bold text-[var(--accent-green)] font-mono">
                +{earnedPoints ?? problem.points} pts
              </span>
            </div>
            {totalScore !== undefined && (
              <div className="h-6 w-px bg-[var(--border-subtle)]" />
            )}
            {totalScore !== undefined && (
              <div className="text-center">
                <span className="block text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-mono">
                  Total Score
                </span>
                <span className="text-base font-bold text-[var(--text-main)] font-mono">
                  {totalScore} pts
                </span>
              </div>
            )}
          </div>

          {/* Checks passed breakdown */}
          {checks.length > 0 && (
            <div className="w-full text-left mb-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-3 max-h-36 overflow-y-auto">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono block mb-2">
                Passed Verification Checks:
              </span>
              <ul className="space-y-1 text-xs text-[var(--text-main)] font-mono">
                {checks.map((chk, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[var(--accent-green)] shrink-0" />
                    <span className={chk.passed ? "text-[var(--text-main)]" : "text-[var(--text-muted)]"}>
                      {chk.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-5">
            Your CentOS 9 terminal satisfies all system requirements.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
            {nextProblem ? (
              <Link
                to={`/p/${nextProblem.id}`}
                onClick={onClose}
                className="w-full flex-1 rounded-xl bg-[var(--accent-green)] hover:brightness-110 py-2 px-4 text-center text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer apple-press shadow-sm"
              >
                <span>Continue to {nextProblem.id}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                onClick={onClose}
                className="w-full flex-1 rounded-xl bg-[var(--accent-green)] hover:brightness-110 py-2 px-4 text-center text-xs font-semibold text-white transition-all cursor-pointer apple-press shadow-sm"
              >
                Continue Training
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] py-2 px-4 text-center text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer apple-press"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
