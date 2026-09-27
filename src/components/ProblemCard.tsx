import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import type { Problem } from "../lib/types";

interface ProblemCardProps {
  problem: Problem;
  isSolved: boolean;
}

export default function ProblemCard({ problem, isSolved }: ProblemCardProps) {
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
      className={`group relative rounded-2xl border p-5 flex flex-col justify-between cursor-pointer mimo-press transition-all duration-150 ${
        isSolved
          ? "bg-[var(--surface-base)] border-[var(--accent-green)]/30 hover:border-[var(--accent-green)]/60"
          : "bg-[var(--surface-base)] border-[var(--border-subtle)] hover:border-[var(--accent-primary)]"
      }`}
    >
      <div>
        {/* Top bar: ID on left, Solved + Difficulty on right */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-xs text-[var(--text-muted)] font-medium">
            {problem.id}
          </span>
          <div className="flex items-center gap-2.5">
            {isSolved && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent-green)]">
                <Check className="w-3 h-3 stroke-[2.5]" />
                <span>Solved</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${diffConfig.dot}`} />
              <span className={diffConfig.color}>{diffConfig.text}</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[var(--text-main)] group-hover:text-[var(--accent-primary-soft)] transition-colors line-clamp-1">
          {problem.title}
        </h3>

        {/* Description / Task excerpt */}
        <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed mt-1.5 mb-4">
          {problem.description || problem.task}
        </p>
      </div>

      {/* Bottom bar: Points & Category on left, action on right */}
      <div className="flex items-center justify-between pt-3.5 border-t border-[var(--border-subtle)] text-xs">
        <div className="flex items-center gap-2 font-mono text-[var(--text-tertiary)]">
          <span>{problem.topicName || problem.topic}</span>
          <span>·</span>
          <span className="text-[var(--text-muted)] font-medium">{problem.points} pts</span>
        </div>
        <span className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-main)] font-medium flex items-center gap-1 transition-colors">
          <span>{isSolved ? "Review" : "Start drill"}</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
