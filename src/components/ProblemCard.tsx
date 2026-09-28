import { Link } from "react-router-dom";
import { ArrowRight, Check, Play, Sparkles } from "lucide-react";
import type { Problem } from "../lib/types";

interface ProblemCardProps {
  problem: Problem;
  isSolved: boolean;
  stepIndex?: number;
  isUpNext?: boolean;
}

export default function ProblemCard({
  problem,
  isSolved,
  stepIndex,
  isUpNext = false,
}: ProblemCardProps) {
  const diffConfig = {
    Easy: {
      text: "Easy",
      color: "text-[var(--accent-green)]",
      dot: "bg-[var(--accent-green)]",
    },
    Average: {
      text: "Medium",
      color: "text-[var(--accent-amber)]",
      dot: "bg-[var(--accent-amber)]",
    },
    Difficult: {
      text: "Hard",
      color: "text-[var(--accent-red)]",
      dot: "bg-[var(--accent-red)]",
    },
  }[problem.difficulty] || {
    text: problem.difficulty,
    color: "text-[var(--text-muted)]",
    dot: "bg-[var(--text-muted)]",
  };

  return (
    <Link
      to={`/p/${problem.id}`}
      className={`group relative rounded-xl border p-4 sm:p-4.5 flex flex-col justify-between cursor-pointer mimo-press transition-all duration-200 ${
        isUpNext
          ? "bg-[var(--surface-base)] border-[var(--accent-primary)]/80 ring-2 ring-[var(--accent-primary)]/20 shadow-md hover:border-[var(--accent-primary)] hover:-translate-y-0.5 hover:shadow-lg"
          : isSolved
          ? "bg-[var(--surface-base)]/85 border-[var(--accent-green)]/35 hover:border-[var(--accent-green)]/70 hover:bg-[var(--surface-base)] hover:-translate-y-0.5 hover:shadow-md"
          : "bg-[var(--surface-base)] border-[var(--border-subtle)] hover:border-[var(--accent-primary)] hover:bg-[var(--surface-elevated)] hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div>
        {/* Top metadata bar: Step / Solved on left, Difficulty on right */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            {typeof stepIndex === "number" ? (
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-medium shrink-0 transition-colors ${
                  isSolved
                    ? "bg-[var(--accent-green)]/15 border border-[var(--accent-green)]/30 text-[var(--accent-green)] font-semibold"
                    : isUpNext
                    ? "bg-[var(--accent-primary)] text-white font-bold"
                    : "bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] group-hover:text-[var(--text-main)] group-hover:border-[var(--accent-primary)]/40"
                }`}
              >
                {isSolved ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <span>{String(stepIndex).padStart(2, "0")}</span>
                )}
              </div>
            ) : (
              <span className="font-mono text-xs text-[var(--text-muted)] font-medium">
                {problem.id}
              </span>
            )}

            {isUpNext && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--accent-primary)] text-white shrink-0">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Next</span>
              </span>
            )}

            {isSolved && !isUpNext && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent-green)] shrink-0">
                <span>Solved</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-[11px] font-mono shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${diffConfig.dot}`} />
            <span className={diffConfig.color}>{diffConfig.text}</span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-[var(--text-main)] group-hover:text-[var(--accent-primary-soft)] transition-colors line-clamp-1">
          {problem.title}
        </h4>

        {/* Description / Task excerpt */}
        <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed mt-1.5 mb-3.5">
          {problem.description || problem.task}
        </p>
      </div>

      {/* Bottom bar: Points & Action CTA */}
      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-mono text-xs text-[var(--accent-amber)] font-medium">
          <span>+{problem.points}</span>
          <span className="text-[var(--text-tertiary)] font-normal">pts</span>
        </div>

        <div className="flex items-center gap-1 text-xs font-medium transition-colors">
          {isSolved ? (
            <span className="text-[var(--text-tertiary)] group-hover:text-[var(--accent-green)] flex items-center gap-1">
              <span>Review</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          ) : isUpNext ? (
            <span className="text-[var(--accent-primary-soft)] group-hover:text-white flex items-center gap-1 font-semibold">
              <span>Start</span>
              <Play className="w-3 h-3 fill-current group-hover:translate-x-0.5 transition-transform" />
            </span>
          ) : (
            <span className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] flex items-center gap-1">
              <span>Start drill</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
