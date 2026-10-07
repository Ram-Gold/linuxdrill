import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ExitConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  problemTitle?: string;
  problemId?: string;
}

export function ExitConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  problemTitle,
  problemId,
}: ExitConfirmationModalProps) {
  // ESC key to cancel/close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="exit-confirmation-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onClick={onCancel}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-modal-title"
        >
          {/* Modal Panel - Clean, minimal, borderless card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[440px] bg-[var(--surface-base)] rounded-3xl shadow-2xl shadow-black/40 z-10 text-[var(--text-main)] p-6 sm:p-7 select-none overflow-hidden"
          >
            {/* Header: Warning badge + Title + Close Button */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2
                    id="exit-modal-title"
                    className="text-base font-semibold tracking-tight text-[var(--text-main)]"
                  >
                    Exit without finishing?
                  </h2>
                  <p className="text-[11px] font-mono text-[var(--text-tertiary)] mt-0.5">
                    Unsaved progress will be lost
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onCancel}
                className="p-1.5 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--surface-subtle)] cursor-pointer transition-colors"
                aria-label="Cancel and close"
                title="Cancel (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Details */}
            <div className="my-5 space-y-3">
              <p className="text-[13px] leading-relaxed text-[var(--text-muted)]">
                Are you sure you want to exit without finishing? Your terminal session, command history, and unverified changes for this scenario will be reset.
              </p>

              {(problemTitle || problemId) && (
                <div className="px-3.5 py-2.5 rounded-xl bg-[var(--surface-subtle)] flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--text-tertiary)] truncate">
                    {problemId ? `${problemId} · ` : ""}{problemTitle || "Active Scenario"}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 text-[10px] font-medium shrink-0 ml-2">
                    In Progress
                  </span>
                </div>
              )}
            </div>

            {/* Actions: Cancel vs Confirm */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={onCancel}
                className="h-9 px-4 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] transition-colors cursor-pointer border-0 mimo-press"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onConfirm}
                className="h-9 px-4.5 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer border-0 shadow-xs mimo-press flex items-center gap-1.5"
              >
                <span>Yes, Exit</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ExitConfirmationModal;
