import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, X } from "lucide-react";
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
    <motion.div
      key="success-confirmation-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="relative w-full max-w-lg rounded-2xl bg-[var(--surface-base)] p-6 sm:p-7 shadow-[var(--modal-shadow)] text-[var(--text-main)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 h-7 w-7 rounded-lg bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)] flex items-center justify-center transition-colors cursor-pointer mimo-press"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">

          <h2 id="confirmation-title" className="text-lg font-semibold tracking-tight text-[var(--text-main)] mb-1">
            Challenge Solved!
          </h2>
          <p className="text-xs text-[var(--text-muted)] mb-4 font-mono">
            {problem.id} · <span className="text-[var(--accent-primary-soft)]">{problem.topicName}</span>
          </p>

          {/* Points Highlight */}
          <div className="w-full flex items-center justify-around rounded-2xl bg-[var(--surface-subtle)] py-3 px-4 mb-4">
            <div className="text-center">
              <span className="block text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-mono">
                Points Earned
              </span>
              <span className="text-base font-bold text-[var(--accent-green)] font-mono">
                +{earnedPoints ?? problem.points} pts
              </span>
            </div>
            {totalScore !== undefined && (
              <div className="h-6 w-px bg-[var(--surface-active)]" />
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
            <div className="w-full text-left mb-4 rounded-2xl bg-[var(--surface-subtle)] p-3.5 max-h-36 overflow-y-auto">
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

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
            {nextProblem ? (
              <Link
                to={`/p/${nextProblem.id}`}
                onClick={onClose}
                className="btn-mimo-primary w-full flex-1 h-10 text-xs"
              >
                <span>Continue to {nextProblem.id}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                onClick={onClose}
                className="btn-mimo-primary w-full flex-1 h-10 text-xs"
              >
                Continue Training
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
