import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Problem } from "../lib/types";
import CategoryIcon from "./CategoryIcon";

interface ProblemCardProps {
  problem: Problem;
  isSolved: boolean;
}

export default function ProblemCard({ problem, isSolved }: ProblemCardProps) {
  const getDifficultyBadge = (difficulty: Problem["difficulty"]) => {
    switch (difficulty) {
      case "Easy":
        return "bg-[var(--accent-green-bg)] text-[var(--accent-green)] border border-[var(--accent-green)]/20";
      case "Average":
        return "bg-[var(--accent-amber-bg)] text-[var(--accent-amber)] border border-[var(--accent-amber)]/20";
      case "Difficult":
        return "bg-[var(--accent-red-bg)] text-[var(--accent-red)] border border-[var(--accent-red)]/20";
      default:
        return "bg-[var(--surface-subtle)] text-[var(--text-muted)] border-[var(--border-subtle)]";
    }
  };

  return (
    <Link
      to={`/p/${problem.id}`}
      className={`group relative rounded-2xl border p-5 flex flex-col justify-between shadow-[var(--card-shadow)] cursor-pointer select-none apple-press transition-colors duration-150 ${
        isSolved
          ? "border-[var(--accent-green)]/40 bg-[var(--surface-base)] hover:border-[var(--accent-green)]/70 hover:bg-[var(--surface-subtle)]"
          : "bg-[var(--surface-base)] hover:bg-[var(--surface-subtle)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
      }`}
    >
      <div>
        {/* Top row: ID, Category tag, Difficulty badge, Solved status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-[var(--accent-cyan)] bg-[var(--surface-subtle)] px-2.5 py-1 rounded-lg border border-[var(--border-subtle)]">
              {problem.id}
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1.5">
              <CategoryIcon category={problem.topic} className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
              <span className="truncate max-w-[130px]">{problem.topicName}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isSolved && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-[var(--accent-green)] bg-[var(--accent-green-bg)] px-2 py-0.5 rounded-lg border border-[var(--accent-green)]/20 font-medium">
                <CheckCircle2 className="w-3 h-3 text-[var(--accent-green)]" />
                <span>Solved</span>
              </span>
            )}
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border font-medium ${getDifficultyBadge(
                problem.difficulty
              )}`}
            >
              {problem.difficulty}
            </span>
          </div>
        </div>

        {/* Title & description */}
        <h3 className="font-sans font-semibold text-[15px] text-[var(--text-main)] group-hover:text-[var(--accent-cyan)] transition-colors mb-1.5 line-clamp-1 tracking-tight">
          {problem.title}
        </h3>
        <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed font-sans mb-4">
          {problem.description || problem.task}
        </p>
      </div>

      {/* Bottom row: Reward Points + Action Link */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-xs">
        <span className="font-mono text-[var(--text-muted)]">
          Reward: <strong className="text-[var(--accent-cyan)] font-semibold">+{problem.points} PTS</strong>
        </span>

        <span
          className={`font-mono flex items-center gap-1 text-xs font-medium transition-colors ${
            isSolved
              ? "text-[var(--accent-green)] group-hover:brightness-110"
              : "text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)]"
          }`}
        >
          <span>{isSolved ? "Review Solution" : "Solve Challenge"}</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
