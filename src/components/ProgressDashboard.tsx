import { useState } from "react";
import { Trophy, X } from "lucide-react";
import { CATEGORY_INFO, type Category, type Problem } from "../lib/types";
import CategoryIcon from "./CategoryIcon";

interface ProgressDashboardProps {
  problems: Problem[];
  solved: string[];
  selectedCategory: Category | "ALL";
  onSelectCategory: (category: Category | "ALL") => void;
}

export default function ProgressDashboard({
  problems,
  solved,
  selectedCategory,
  onSelectCategory,
}: ProgressDashboardProps) {
  const [showScoringGuide, setShowScoringGuide] = useState(false);
  const total = problems.length;
  const solvedCount = solved.length;
  const percentage = total > 0 ? Math.round((solvedCount / total) * 100) : 0;

  const totalScorePossible = 640;
  const currentScore = problems
    .filter((p) => solved.includes(p.id))
    .reduce((sum, p) => sum + p.points, 0);
  const scorePercentage = Math.round((currentScore / totalScorePossible) * 100);

  const easyProblems = problems.filter((p) => p.difficulty === "Easy");
  const easySolved = easyProblems.filter((p) => solved.includes(p.id)).length;

  const avgProblems = problems.filter((p) => p.difficulty === "Average");
  const avgSolved = avgProblems.filter((p) => solved.includes(p.id)).length;

  const diffProblems = problems.filter((p) => p.difficulty === "Difficult");
  const diffSolved = diffProblems.filter((p) => solved.includes(p.id)).length;

  const categories = Object.keys(CATEGORY_INFO) as Category[];

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 mb-6 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left column: Circular progress & primary stats */}
        <div className="lg:col-span-4 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-slate-800 pb-5 lg:pb-0 lg:pr-6">
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={201}
                strokeDashoffset={201 - (201 * percentage) / 100}
                strokeLinecap="round"
                className="text-cyan-400 transition-all duration-500 ease-out"
                fill="transparent"
              />
            </svg>
            <span className="absolute font-mono font-bold text-base text-white">
              {percentage}%
            </span>
          </div>

          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Contest Score
              </span>
              <button
                onClick={() => setShowScoringGuide(true)}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                title="View Contest Scoring Rubric"
              >
                How scoring works?
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tracking-tight font-mono">
                {currentScore}
              </span>
              <span className="text-sm font-normal text-slate-400 font-mono">
                / {totalScorePossible} PTS
              </span>
              <span className="text-xs text-slate-500 font-mono ml-auto">
                ({solvedCount}/{total} Solved)
              </span>
            </div>

            {/* Score progress bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden my-1">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${scorePercentage}%` }}
              />
            </div>

            {/* Difficulty breakdown pills with points */}
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 font-medium"
                title="Easy challenges (5 pts each)"
              >
                Easy 5p ({easySolved}/{easyProblems.length})
              </span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 font-medium"
                title="Average challenges (10 pts each)"
              >
                Avg 10p ({avgSolved}/{avgProblems.length})
              </span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40 font-medium"
                title="Difficult challenges (50 pts each)"
              >
                Diff 50p ({diffSolved}/{diffProblems.length})
              </span>
            </div>
          </div>
        </div>

        {/* Right column: Category progress grid */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Domain Coverage
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Click domain to filter
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {categories.map((cat) => {
              const catProblems = problems.filter((p) => p.topic === cat);
              const catSolved = catProblems.filter((p) => solved.includes(p.id)).length;
              const catTotal = catProblems.length || 1;
              const isSelected = selectedCategory === cat;
              const catPct = Math.round((catSolved / catTotal) * 100);

              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(isSelected ? "ALL" : cat)}
                  className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                    isSelected
                      ? "bg-slate-800/90 border-cyan-500/70 text-white shadow-sm shadow-cyan-950/40"
                      : "bg-[#090d16]/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-mono font-semibold truncate text-slate-200 flex items-center gap-1.5">
                      <CategoryIcon category={cat} className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{cat}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {catSolved}/{catTotal}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-300 rounded-full"
                      style={{ width: `${catPct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal: Scoring & Evaluation Guide */}
      {showScoringGuide && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setShowScoringGuide(false)}
        >
          <div
            className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                <h3 className="text-lg font-bold text-white">Contest Scoring & Verification Guide</h3>
              </div>
              <button
                onClick={() => setShowScoringGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <p>
                The trainer simulates the exact grading environment of the <strong>15th IT Skills Olympics (ITSO) Linux Administration Competition</strong>.
              </p>

              <div>
                <h4 className="font-semibold text-white mb-2 font-mono text-xs uppercase tracking-wider text-cyan-400">
                  1. Point Distribution (640 PTS Total)
                </h4>
                <div className="grid grid-cols-3 gap-2.5 font-mono text-xs">
                  <div className="p-3 rounded-lg border border-emerald-800/40 bg-emerald-950/30">
                    <div className="font-bold text-emerald-400">EASY TIER</div>
                    <div className="text-white text-base font-bold my-1">5 PTS</div>
                    <div className="text-slate-400 text-[11px]">16 Challenges (80 pts max)</div>
                    <div className="text-slate-400 text-[11px] mt-1">Single commands, user adds, permissions</div>
                  </div>
                  <div className="p-3 rounded-lg border border-amber-800/40 bg-amber-950/30">
                    <div className="font-bold text-amber-400">AVERAGE TIER</div>
                    <div className="text-white text-base font-bold my-1">10 PTS</div>
                    <div className="text-slate-400 text-[11px]">16 Challenges (160 pts max)</div>
                    <div className="text-slate-400 text-[11px] mt-1">Multi-step setups, services, ACLs, DNF repos</div>
                  </div>
                  <div className="p-3 rounded-lg border border-rose-800/40 bg-rose-950/30">
                    <div className="font-bold text-rose-400">DIFFICULT TIER</div>
                    <div className="text-white text-base font-bold my-1">50 PTS</div>
                    <div className="text-slate-400 text-[11px]">8 Challenges (400 pts max)</div>
                    <div className="text-slate-400 text-[11px] mt-1">Complex LVM, bash scripting, persistent repos</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-1.5 font-mono text-xs uppercase tracking-wider text-cyan-400">
                  2. How Live State Verification Works
                </h4>
                <p className="text-slate-300 leading-relaxed text-xs">
                  Unlike brittle tutorial sites that check whether your typed command string matches a specific regex, this trainer inspects the <strong>actual simulated Linux state</strong>. It inspects:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-400 mt-1 space-y-1 font-mono">
                  <li>File existence, paths, and contents (e.g. <code className="text-slate-200">/etc/fstab</code>, <code className="text-slate-200">/etc/passwd</code>)</li>
                  <li>Exact octal and symbolic permissions (e.g. <code className="text-slate-200">0600</code>, <code className="text-slate-200">0440</code>, <code className="text-slate-200">2770 SGID</code>)</li>
                  <li>Systemd daemon states (<code className="text-slate-200">active</code>, <code className="text-slate-200">enabled</code> on boot)</li>
                  <li>SELinux modes, firewall open ports, and LVM logical volume mappings</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-1 font-mono text-xs uppercase tracking-wider text-cyan-400">
                  3. How to Trigger Evaluation
                </h4>
                <p className="text-xs text-slate-300">
                  You can click the <strong>Check Answer</strong> button on the challenge panel at any time, or simply type <code className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">verify</code> or <code className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">check</code> inside the interactive terminal.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowScoringGuide(false)}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs font-mono transition"
              >
                Got It, Back to Challenges
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
