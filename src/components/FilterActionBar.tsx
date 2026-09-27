import { useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown, Check, RotateCcw, Filter, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Category, Difficulty } from "../lib/types";
import { CATEGORY_INFO } from "../lib/types";
import CategoryIcon from "./CategoryIcon";
import { problems } from "../lib/problems";

interface FilterActionBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: Category | "ALL";
  setSelectedCategory: (c: Category | "ALL") => void;
  selectedDifficulty: Difficulty | "ALL";
  setSelectedDifficulty: (d: Difficulty | "ALL") => void;
  hideSolved: boolean;
  setHideSolved: (h: boolean | ((prev: boolean) => boolean)) => void;
  handleResetFilters: () => void;
  hasActiveFilter: boolean;
  solved: string[];
}

export default function FilterActionBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  hideSolved,
  setHideSolved,
  handleResetFilters,
  hasActiveFilter,
  solved,
}: FilterActionBarProps) {
  const [topicOpen, setTopicOpen] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);

  const topicRef = useRef<HTMLDivElement>(null);
  const diffRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (topicRef.current && !topicRef.current.contains(event.target as Node)) {
        setTopicOpen(false);
      }
      if (diffRef.current && !diffRef.current.contains(event.target as Node)) {
        setDiffOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setTopicOpen(false);
        setDiffOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const categories: { id: Category | "ALL"; label: string }[] = [
    { id: "ALL", label: "All Topics" },
    ...Object.entries(CATEGORY_INFO).map(([key, val]) => ({
      id: key as Category,
      label: val.name,
    })),
  ];

  const difficulties: { id: Difficulty | "ALL"; label: string; color?: string }[] = [
    { id: "ALL", label: "All Levels" },
    { id: "Easy", label: "Easy", color: "bg-[var(--accent-green)]" },
    { id: "Average", label: "Medium", color: "bg-[var(--accent-amber)]" },
    { id: "Difficult", label: "Hard", color: "bg-[var(--accent-red)]" },
  ];

  // Calculate drill counts
  const categoryCounts: Record<string, number> = { ALL: problems.length };
  for (const p of problems) {
    categoryCounts[p.topic] = (categoryCounts[p.topic] || 0) + 1;
  }

  const difficultyCounts: Record<string, number> = { ALL: problems.length };
  for (const p of problems) {
    difficultyCounts[p.difficulty] = (difficultyCounts[p.difficulty] || 0) + 1;
  }

  const unsolvedCount = problems.length - solved.length;

  const currentCategoryLabel =
    selectedCategory === "ALL"
      ? "All Topics"
      : CATEGORY_INFO[selectedCategory]?.name || selectedCategory;

  const currentDiffObj = difficulties.find((d) => d.id === selectedDifficulty);

  return (
    <div className="space-y-2.5">
      {/* Unified Compact Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-1.5 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-2xl shadow-sm">
        {/* Search input with integrated clear */}
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search drills by command (sed, grep), concept, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 bg-[var(--surface-subtle)] border border-transparent focus:border-[var(--accent-primary)] text-[var(--text-main)] text-sm rounded-xl pl-10 pr-9 placeholder-[var(--text-tertiary)] transition-colors focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter controls cluster */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Topic Dropdown Trigger */}
          <div className="relative" ref={topicRef}>
            <button
              onClick={() => {
                setTopicOpen(!topicOpen);
                setDiffOpen(false);
              }}
              className={`h-10 px-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 cursor-pointer transition-all mimo-press ${
                selectedCategory !== "ALL"
                  ? "bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white shadow-sm"
                  : "bg-[var(--surface-subtle)] border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--border-strong)]"
              }`}
              title="Filter by topic"
            >
              {selectedCategory !== "ALL" ? (
                <CategoryIcon category={selectedCategory} className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Filter className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
              )}
              <span className="truncate max-w-[130px]">{currentCategoryLabel}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 text-[var(--text-muted)] ${
                  selectedCategory !== "ALL" ? "text-white" : ""
                } ${topicOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Topic Dropdown Menu */}
            <AnimatePresence>
              {topicOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-64 bg-[var(--surface-base)] border border-[var(--border-strong)] rounded-2xl shadow-xl z-50 p-1.5 overflow-hidden backdrop-blur-md"
                >
                  <div className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] border-b border-[var(--border-subtle)] mb-1">
                    Select Topic
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-0.5 scrollbar-subtle pr-0.5">
                    {categories.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      const count = categoryCounts[cat.id] || 0;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setTopicOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-[var(--accent-primary-bg)] text-[var(--accent-primary-soft)] font-medium"
                              : "text-[var(--text-main)] hover:bg-[var(--surface-subtle)]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            {cat.id !== "ALL" ? (
                              <CategoryIcon category={cat.id} className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-dashed border-[var(--text-muted)] shrink-0" />
                            )}
                            <span className="truncate">{cat.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                              {count}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent-primary-soft)]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Difficulty Dropdown Trigger */}
          <div className="relative" ref={diffRef}>
            <button
              onClick={() => {
                setDiffOpen(!diffOpen);
                setTopicOpen(false);
              }}
              className={`h-10 px-3.5 rounded-xl border text-xs font-mono flex items-center gap-2 cursor-pointer transition-all mimo-press ${
                selectedDifficulty !== "ALL"
                  ? "bg-[var(--surface-subtle)] border-[var(--accent-primary)] text-[var(--text-main)] font-medium"
                  : "bg-[var(--surface-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-main)]"
              }`}
              title="Filter by difficulty"
            >
              {currentDiffObj?.color && (
                <span className={`w-2 h-2 rounded-full ${currentDiffObj.color} shrink-0`} />
              )}
              <span>{currentDiffObj?.label}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 text-[var(--text-muted)] ${
                  diffOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Difficulty Dropdown Menu */}
            <AnimatePresence>
              {diffOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-[var(--surface-base)] border border-[var(--border-strong)] rounded-2xl shadow-xl z-50 p-1.5 overflow-hidden backdrop-blur-md"
                >
                  <div className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] border-b border-[var(--border-subtle)] mb-1">
                    Difficulty Level
                  </div>
                  <div className="space-y-0.5">
                    {difficulties.map((diff) => {
                      const isSelected = selectedDifficulty === diff.id;
                      const count = difficultyCounts[diff.id] || 0;
                      return (
                        <button
                          key={diff.id}
                          onClick={() => {
                            setSelectedDifficulty(diff.id);
                            setDiffOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-[var(--accent-primary-bg)] text-[var(--accent-primary-soft)] font-medium"
                              : "text-[var(--text-main)] hover:bg-[var(--surface-subtle)]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {diff.color ? (
                              <span className={`w-2 h-2 rounded-full ${diff.color}`} />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-[var(--text-tertiary)] opacity-40" />
                            )}
                            <span>{diff.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                              {count}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent-primary-soft)]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hide Solved Toggle */}
          <button
            onClick={() => setHideSolved((prev) => !prev)}
            className={`h-10 px-3 rounded-xl border text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all mimo-press ${
              hideSolved
                ? "bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white font-medium"
                : "bg-[var(--surface-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-main)]"
            }`}
            title="Hide completed drills"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Unsolved only ({unsolvedCount})</span>
          </button>

          {/* Reset Filters (conditional) */}
          {hasActiveFilter && (
            <button
              onClick={handleResetFilters}
              className="h-10 px-2.5 rounded-xl text-xs text-[var(--accent-primary-soft)] hover:text-white hover:bg-[var(--surface-subtle)] flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active summary tags row (only shows when filters active) */}
      <AnimatePresence>
        {hasActiveFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] flex-wrap pt-0.5 px-1"
          >
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
              Filtered by:
            </span>
            {selectedCategory !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)] text-[11px]">
                <CategoryIcon category={selectedCategory} className="w-3 h-3 text-[var(--accent-primary-soft)]" />
                <span>{currentCategoryLabel}</span>
                <button
                  onClick={() => setSelectedCategory("ALL")}
                  className="hover:text-red-400 cursor-pointer ml-0.5"
                  title="Clear topic filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedDifficulty !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)] text-[11px]">
                <span className={`w-1.5 h-1.5 rounded-full ${currentDiffObj?.color}`} />
                <span>{currentDiffObj?.label}</span>
                <button
                  onClick={() => setSelectedDifficulty("ALL")}
                  className="hover:text-red-400 cursor-pointer ml-0.5"
                  title="Clear difficulty filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {hideSolved && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)] text-[11px]">
                <span>Unsolved only</span>
                <button
                  onClick={() => setHideSolved(false)}
                  className="hover:text-red-400 cursor-pointer ml-0.5"
                  title="Show solved drills"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-main)] text-[11px]">
                <span>"{searchQuery}"</span>
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:text-red-400 cursor-pointer ml-0.5"
                  title="Clear search query"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-[var(--accent-primary-soft)] hover:underline ml-1 cursor-pointer"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
