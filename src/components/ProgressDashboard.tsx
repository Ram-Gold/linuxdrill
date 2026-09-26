import { useState } from "react";
import { Trophy, X, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
    <div className="bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-2xl p-5 mb-6 shadow-[var(--card-shadow)] select-none transition-colors duration-150">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left column: Circular progress & primary stats */}
        <div className="lg:col-span-4 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] pb-5 lg:pb-0 lg:pr-6">
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="5.5"
                className="text-[var(--surface-subtle)]"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="5.5"
                strokeDasharray={201}
                strokeDashoffset={201 - (201 * percentage) / 100}
                strokeLinecap="round"
                className="text-[var(--accent-cyan)] transition-all duration-700 ease-out"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-mono font-bold text-base text-[var(--text-main)]">
                {percentage}%
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                Contest Score
              </span>
              <button
                onClick={() => setShowScoringGuide(true)}
                className="text-[11px] font-mono text-[var(--accent-cyan)] hover:brightness-110 flex items-center gap-1 cursor-pointer transition-colors apple-press"
                title="View Contest Scoring Rubric"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Guide</span>
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--text-main)] tracking-tight font-mono">
                {currentScore}
              </span>
              <span className="text-sm font-normal text-[var(--text-muted)] font-mono">
                / {totalScorePossible} PTS
              </span>
              <span className="text-xs text-[var(--text-tertiary)] font-mono ml-auto">
                ({solvedCount}/{total} Solved)
              </span>
            </div>

            {/* Score progress bar */}
            <div className="w-full h-1.5 bg-[var(--surface-subtle)] rounded-full overflow-hidden my-0.5">
              <div
                className="h-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-green)] transition-all duration-700 rounded-full"
                style={{ width: `${scorePercentage}%` }}
              />
            </div>

            {/* Difficulty breakdown pills */}
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--accent-green-bg)] text-[var(--accent-green)] border border-[var(--accent-green)]/20 font-medium"
                title="Easy challenges (5 pts each)"
              >
                Easy: {easySolved}/{easyProblems.length}
              </span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--accent-amber-bg)] text-[var(--accent-amber)] border border-[var(--accent-amber)]/20 font-medium"
                title="Average challenges (10 pts each)"
              >
                Avg: {avgSolved}/{avgProblems.length}
              </span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--accent-red-bg)] text-[var(--accent-red)] border border-[var(--accent-red)]/20 font-medium"
                title="Difficult challenges (50 pts each)"
              >
                Diff: {diffSolved}/{diffProblems.length}
              </span>
            </div>
          </div>
        </div>

        {/* Right column: Category progress grid */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Domain Coverage
            </span>
            <span className="text-xs text-[var(--text-tertiary)] font-mono">
              Click domain to filter
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                  className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer select-none apple-press ${
                    isSelected
                      ? "bg-[var(--surface-elevated)] border-[var(--accent-cyan)] text-[var(--text-main)] shadow-sm font-semibold"
                      : "bg-[var(--surface-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-main)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-mono font-semibold truncate flex items-center gap-1.5">
                      <CategoryIcon category={cat} className="w-3.5 h-3.5 text-[var(--accent-cyan)] shrink-0" />
                      <span className="truncate">{cat}</span>
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      {catSolved}/{catTotal}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--surface-active)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent-cyan)] transition-all duration-300 rounded-full"
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
      <AnimatePresence>
        {showScoringGuide && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm"
            onClick={() => setShowScoringGuide(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="relative w-full max-w-xl rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-base)] p-6 shadow-[var(--modal-shadow)] text-[var(--text-main)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                  <h3 className="text-base font-semibold text-[var(--text-main)]">Contest Scoring & Verification Guide</h3>
                </div>
                <button
                  onClick={() => setShowScoringGuide(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-lg hover:bg-[var(--surface-subtle)] transition-colors apple-press cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-[var(--text-muted)] leading-relaxed">
                <p>
                  The trainer simulates the exact grading environment of the <strong className="text-[var(--text-main)]">15th IT Skills Olympics (ITSO) Linux Administration Competition</strong>.
                </p>

                <div>
                  <h4 className="font-semibold text-[var(--text-main)] mb-2 font-mono text-[11px] uppercase tracking-wider text-[var(--accent-cyan)]">
                    Point Distribution (640 PTS Total)
                  </h4>
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                    <div className="p-3 rounded-xl border border-[var(--accent-green)]/20 bg-[var(--surface-subtle)]">
                      <div className="font-semibold text-[var(--accent-green)] text-[11px]">EASY TIER</div>
                      <div className="text-[var(--text-main)] text-base font-bold my-0.5">5 PTS</div>
                      <div className="text-[var(--text-muted)] text-[10px]">16 Challenges (80 pts)</div>
                    </div>
                    <div className="p-3 rounded-xl border border-[var(--accent-amber)]/20 bg-[var(--surface-subtle)]">
                      <div className="font-semibold text-[var(--accent-amber)] text-[11px]">AVERAGE TIER</div>
                      <div className="text-[var(--text-main)] text-base font-bold my-0.5">10 PTS</div>
                      <div className="text-[var(--text-muted)] text-[10px]">16 Challenges (160 pts)</div>
                    </div>
                    <div className="p-3 rounded-xl border border-[var(--accent-red)]/20 bg-[var(--surface-subtle)]">
                      <div className="font-semibold text-[var(--accent-red)] text-[11px]">DIFFICULT TIER</div>
                      <div className="text-[var(--text-main)] text-base font-bold my-0.5">50 PTS</div>
                      <div className="text-[var(--text-muted)] text-[10px]">8 Challenges (400 pts)</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[var(--text-main)] mb-1.5 font-mono text-[11px] uppercase tracking-wider text-[var(--accent-cyan)]">
                    Live Linux State Verification
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">
                    Verification inspects the <strong className="text-[var(--text-main)]">actual virtual file system state</strong>, including permissions (octal & SGID), systemd services, SELinux policies, network port bindings, and fstab entries.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowScoringGuide(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--accent-cyan)] hover:brightness-110 text-white font-medium text-xs font-mono transition-all apple-press cursor-pointer shadow-sm"
                >
                  Return to Challenges
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
