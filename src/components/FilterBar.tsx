import { useEffect, useRef } from "react";
import { Search, X, Check } from "lucide-react";
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    <div className="bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-2xl p-4 mb-6 space-y-3.5 shadow-[var(--card-shadow)] select-none transition-colors duration-150">
      {/* Top row: Spotlight Search + Hide Solved switch */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search scenarios by ID, command, topic, or keyword..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)] text-xs sm:text-sm rounded-xl pl-9 pr-16 py-2 placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-cyan)] focus:ring-1 focus:ring-[var(--accent-cyan)]/30 transition-all font-sans"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                onClick={() => onSearchChange("")}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-md transition-colors cursor-pointer"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block text-[10px] font-mono text-[var(--text-muted)] bg-[var(--surface-elevated)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                ⌘K
              </kbd>
            )}
          </div>
        </div>

        {/* Apple-style Toggle Switch for Hide Solved */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleHideSolved}
            className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-xl border transition-all cursor-pointer apple-press ${
              hideSolved
                ? "bg-[var(--surface-elevated)] border-[var(--accent-cyan)] text-[var(--text-main)] font-semibold shadow-sm"
                : "bg-[var(--surface-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
                hideSolved
                  ? "bg-[var(--accent-cyan)] border-[var(--accent-cyan)] text-white"
                  : "border-[var(--border-strong)] bg-transparent"
              }`}
            >
              {hideSolved && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </div>
            <span>Hide Solved</span>
          </button>
        </div>
      </div>

      {/* Bottom row: macOS Segmented Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 pt-2.5 border-t border-[var(--border-subtle)]">
        {/* Domain Segmented Control */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider font-semibold mr-1">
            Domain
          </span>
          <div className="bg-[var(--surface-subtle)] p-1 rounded-xl border border-[var(--border-subtle)] flex items-center gap-1 flex-wrap">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={`text-xs font-mono px-2.5 py-1 rounded-lg transition-all cursor-pointer apple-press flex items-center gap-1.5 ${
                    active
                      ? "bg-[var(--surface-elevated)] text-[var(--text-main)] font-semibold border border-[var(--border-strong)] shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)]"
                  }`}
                >
                  {cat === "ALL" ? (
                    "ALL"
                  ) : (
                    <>
                      <CategoryIcon category={cat} className="w-3 h-3 text-[var(--accent-cyan)]" />
                      <span>{cat}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden lg:block w-px h-5 bg-[var(--border-subtle)]" />

        {/* Difficulty Segmented Control */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider font-semibold mr-1">
            Level
          </span>
          <div className="bg-[var(--surface-subtle)] p-1 rounded-xl border border-[var(--border-subtle)] flex items-center gap-1">
            {difficulties.map((diff) => {
              const active = selectedDifficulty === diff;
              let dotColor = "bg-[var(--accent-cyan)]";
              if (diff === "Easy") dotColor = "bg-[var(--accent-green)]";
              if (diff === "Average") dotColor = "bg-[var(--accent-amber)]";
              if (diff === "Difficult") dotColor = "bg-[var(--accent-red)]";

              return (
                <button
                  key={diff}
                  onClick={() => onDifficultyChange(diff)}
                  className={`text-xs font-mono px-2.5 py-1 rounded-lg transition-all cursor-pointer apple-press flex items-center gap-1.5 ${
                    active
                      ? "bg-[var(--surface-elevated)] text-[var(--text-main)] font-semibold border border-[var(--border-strong)] shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)]"
                  }`}
                >
                  {diff !== "ALL" && (
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                  )}
                  <span>{diff}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
