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
        return "bg-emerald-950/80 text-emerald-400 border-emerald-800/60";
      case "Average":
        return "bg-amber-950/80 text-amber-400 border-amber-800/60";
      case "Difficult":
        return "bg-rose-950/80 text-rose-400 border-rose-800/60";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <Link
      to={`/p/${problem.id}`}
      className={`group relative rounded-xl border p-5 transition-all duration-200 flex flex-col justify-between shadow-sm cursor-pointer ${
        isSolved
          ? "border-emerald-600/50 bg-[#0c1524] hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-950/30"
          : "bg-[#0f172a] hover:bg-[#131d33] border-slate-800 hover:border-cyan-500/50 hover:shadow-md hover:shadow-cyan-950/20"
      }`}
    >
      <div>
        {/* Top row: ID, Category tag, Difficulty badge, Solved status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
              {problem.id}
            </span>
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <CategoryIcon category={problem.topic} className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[130px]">{problem.topicName}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isSolved && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-700/60 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Solved</span>
              </span>
            )}
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded border font-medium ${getDifficultyBadge(
                problem.difficulty
              )}`}
            >
              {problem.difficulty}
            </span>
          </div>
        </div>

        {/* Title & description */}
        <h3 className="font-sans font-bold text-base text-white group-hover:text-cyan-300 transition-colors mb-2 line-clamp-1">
          {problem.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans mb-5">
          {problem.description || problem.task}
        </p>
      </div>

      {/* Bottom row: Reward Points + Action Link */}
      <div className="flex items-center justify-between pt-3.5 border-t border-slate-800/80 text-xs">
        <span className="font-mono text-slate-400">
          Reward: <strong className="text-cyan-400 font-bold">+{problem.points} PTS</strong>
        </span>

        <span
          className={`font-mono flex items-center gap-1 transition-all font-semibold ${
            isSolved
              ? "text-emerald-400 group-hover:text-emerald-300"
              : "text-slate-300 group-hover:text-cyan-300"
          }`}
        >
          <span>{isSolved ? "Review Solution" : "Solve Challenge"}</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
