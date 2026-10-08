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
      className={`group relative rounded-2xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer mimo-press transition-[transform,background-color,box-shadow,border-color,opacity,filter] duration-180 ease-out hover:-translate-y-0.5 ${
        isSolved
          ? "border-[1.5px] border-dashed border-[var(--accent-green)]/50 hover:border-[var(--accent-green)]/80 bg-[var(--surface-card)]/75 hover:bg-[var(--surface-card-hover)] opacity-75 saturate-50 hover:opacity-100 hover:saturate-100"
          : isUpNext
          ? "border-[1.5px] border-solid border-transparent bg-[var(--surface-card)] hover:bg-[var(--surface-card-hover)]"
          : "border-[1.5px] border-solid border-transparent bg-[var(--surface-card)] hover:bg-[var(--surface-card-hover)]"
      }`}
    >
      <div>
        {/* Top metadata bar: Step / Next / Solved on left, Difficulty on right */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Step Number Pill */}
            <span
              className={`inline-flex items-center justify-center h-5 px-2 rounded-full font-mono text-[10px] font-semibold shrink-0 transition-colors ${
                isSolved
                  ? "bg-[var(--accent-green-bg)] text-[var(--accent-green)]"
                  : isUpNext
                  ? "bg-[var(--accent-primary-bg)] text-[var(--accent-primary-soft)] font-bold"
                  : "bg-[var(--surface-base)] text-[var(--text-tertiary)] group-hover:text-[var(--text-main)]"
              }`}
            >
              {typeof stepIndex === "number"
                ? String(stepIndex).padStart(2, "0")
                : problem.id}
            </span>

            {/* Next Pill */}
            {isUpNext && (
              <span className="inline-flex items-center gap-1 h-5 px-2 rounded-full text-[10px] font-semibold bg-[var(--accent-primary)] text-white shrink-0">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Next</span>
              </span>
            )}

            {/* Solved Badge (Checkmark only) */}
            {isSolved && !isUpNext && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[var(--accent-green)] bg-[var(--accent-green-bg)] shrink-0">
                <Check className="w-3 h-3 stroke-[2.5]" />
              </span>
            )}
          </div>

          {/* Difficulty Pill */}
          <div className="inline-flex items-center h-5 px-2 rounded-full bg-[var(--surface-base)] text-[10px] font-mono shrink-0">
            <span className={diffConfig.color}>{diffConfig.text}</span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-[var(--text-main)] group-hover:text-[var(--accent-primary-soft)] transition-colors line-clamp-1 card-title font-heading">
          {problem.title}
        </h4>

        {/* Description / Task excerpt */}
        <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed mt-1.5 mb-3.5">
          {problem.description || problem.task}
        </p>
      </div>

      {/* Bottom bar: Points & Action CTA */}
      <div className="pt-2 flex items-center justify-between text-xs min-h-[28px]">
        <div className="flex items-center gap-1.5 font-mono text-xs text-[var(--accent-amber)] font-medium">
          <span>+{problem.points}</span>
          <span className="text-[var(--text-tertiary)] font-normal">pts</span>
        </div>

        <div className="flex items-center gap-1 text-xs font-medium">
          {isSolved ? (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[var(--text-tertiary)] group-hover:text-[var(--accent-green)] flex items-center gap-1">
              <span>Review</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          ) : isUpNext ? (
            <span className="text-[var(--accent-primary-soft)] group-hover:text-white flex items-center gap-1 font-semibold transition-colors">
              <span>Start</span>
              <Play className="w-3 h-3 fill-current group-hover:translate-x-0.5 transition-transform" />
            </span>
          ) : (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[var(--text-muted)] group-hover:text-[var(--text-main)] flex items-center gap-1">
              <span>Start Drill</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
