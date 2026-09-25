import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, CheckCircle2, ArrowRight, X } from "lucide-react";
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
  // Allow Esc key to close
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-xl border border-emerald-700/60 bg-[#0f172a] p-6 md:p-8 shadow-2xl text-slate-100 transform transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 h-8 w-8 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge & Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-400 mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-800 bg-emerald-950/90 px-3 py-1 text-xs font-mono font-semibold text-emerald-300 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>VERIFICATION PASSED</span>
          </div>

          <h2 id="confirmation-title" className="text-xl font-bold tracking-tight text-white mb-1">
            Challenge Solved
          </h2>
          <p className="text-xs text-slate-400 mb-4 font-mono">
            {problem.id} · <span className="text-cyan-400">{problem.topicName}</span>
          </p>

          {/* Points Highlight */}
          <div className="w-full flex items-center justify-around rounded-lg border border-slate-800 bg-[#090d16] py-3 px-4 mb-4">
            <div className="text-center">
              <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                Points Earned
              </span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                +{earnedPoints ?? problem.points} pts
              </span>
            </div>
            {totalScore !== undefined && (
              <div className="h-8 w-px bg-slate-800" />
            )}
            {totalScore !== undefined && (
              <div className="text-center">
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                  Total Score
                </span>
                <span className="text-lg font-bold text-white font-mono">
                  {totalScore} pts
                </span>
              </div>
            )}
          </div>

          {/* Checks passed breakdown if any */}
          {checks.length > 0 && (
            <div className="w-full text-left mb-4 rounded-lg border border-slate-800 bg-[#090d16] p-3 max-h-36 overflow-y-auto">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono block mb-2">
                Passed Verification Checks:
              </span>
              <ul className="space-y-1 text-xs text-slate-300 font-mono">
                {checks.map((chk, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className={chk.passed ? "text-slate-200" : "text-slate-400"}>
                      {chk.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-slate-400 leading-relaxed mb-5">
            Your terminal environment satisfies all scenario requirements.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
            {nextProblem ? (
              <Link
                to={`/p/${nextProblem.id}`}
                onClick={onClose}
                className="w-full flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 py-2.5 px-4 text-center text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Next Problem ({nextProblem.id})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                onClick={onClose}
                className="w-full flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 py-2.5 px-4 text-center text-xs font-semibold text-white transition cursor-pointer"
              >
                Continue Training
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full sm:w-auto rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 py-2.5 px-4 text-center text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
