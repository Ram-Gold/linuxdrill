import { Search, X } from "lucide-react";
import { CATEGORY_INFO, type Category, type Difficulty } from "../lib/types";
import CategoryIcon from "./CategoryIcon";

interface FilterBarProps {
  selectedCategory: Category | "ALL";
  onCategoryChange: (cat: Category | "ALL") => void;
  selectedDifficulty: Difficulty | "ALL";
  onDifficultyChange: (diff: Difficulty | "ALL") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  hideSolved: boolean;
  onToggleHideSolved: () => void;
}

export default function FilterBar({
  selectedCategory,
  onCategoryChange,
  selectedDifficulty,
  onDifficultyChange,
  searchQuery,
  onSearchChange,
  hideSolved,
  onToggleHideSolved,
}: FilterBarProps) {
  const categories: (Category | "ALL")[] = [
    "ALL",
    ...(Object.keys(CATEGORY_INFO) as Category[]),
  ];
  const difficulties: (Difficulty | "ALL")[] = [
    "ALL",
    "Easy",
    "Average",
    "Difficult",
  ];

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 mb-6 space-y-4 shadow-sm">
      {/* Top row: Search input + Hide Solved toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-mono text-xs">
            <Search className="w-4 h-4 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search problems by ID, command, topic, or keywords..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#090d16] border border-slate-800 text-slate-100 text-sm rounded-lg pl-9 pr-8 py-2 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-200"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300 hover:text-slate-100 select-none">
            <input
              type="checkbox"
              checked={hideSolved}
              onChange={onToggleHideSolved}
              className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
            />
            <span>Hide Solved</span>
          </label>
        </div>
      </div>

      {/* Bottom row: Category & Difficulty Chips */}
      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800/80">
        {/* Category chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-500 uppercase mr-1 font-semibold">
            Domain:
          </span>
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`text-xs font-mono px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  active
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {cat === "ALL" ? (
                  "ALL"
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <CategoryIcon category={cat} className="w-3.5 h-3.5" />
                    <span>{cat}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden lg:block w-[1px] h-5 bg-slate-800" />

        {/* Difficulty chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-500 uppercase mr-1 font-semibold">
            Level:
          </span>
          {difficulties.map((diff) => {
            const active = selectedDifficulty === diff;
            let activeStyle = "bg-cyan-500 text-slate-950 font-bold shadow-sm";
            if (diff === "Easy" && active)
              activeStyle = "bg-emerald-500 text-slate-950 font-bold shadow-sm";
            if (diff === "Average" && active)
              activeStyle = "bg-amber-500 text-slate-950 font-bold shadow-sm";
            if (diff === "Difficult" && active)
              activeStyle = "bg-rose-500 text-slate-950 font-bold shadow-sm";

            return (
              <button
                key={diff}
                onClick={() => onDifficultyChange(diff)}
                className={`text-xs font-mono px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  active
                    ? activeStyle
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {diff}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
