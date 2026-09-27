import { useState, useMemo } from "react";
import { Search, X, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { problems } from "../lib/problems";
import { useProgress } from "../lib/useProgress";
import { type Category, type Difficulty, CATEGORY_INFO } from "../lib/types";
import ProblemCard from "../components/ProblemCard";
import CategoryIcon from "../components/CategoryIcon";

export default function Home() {
  const { solved } = useProgress();

  const [selectedCategory, setSelectedCategory] = useState<Category | "ALL">("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [hideSolved, setHideSolved] = useState(false);

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      if (selectedCategory !== "ALL" && p.topic !== selectedCategory) return false;
      if (selectedDifficulty !== "ALL" && p.difficulty !== selectedDifficulty) return false;
      if (hideSolved && solved.includes(p.id)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = p.id.toLowerCase().includes(q);
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = (p.description || "").toLowerCase().includes(q);
        const matchesTopic = (p.topicName || "").toLowerCase().includes(q);
        const matchesTask = p.task.toLowerCase().includes(q);
        return matchesId || matchesTitle || matchesDesc || matchesTopic || matchesTask;
      }

      return true;
    });
  }, [selectedCategory, selectedDifficulty, hideSolved, searchQuery, solved]);

  const handleResetFilters = () => {
    setSelectedCategory("ALL");
    setSelectedDifficulty("ALL");
    setSearchQuery("");
    setHideSolved(false);
  };

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

  const hasActiveFilter =
    selectedCategory !== "ALL" ||
    selectedDifficulty !== "ALL" ||
    searchQuery.trim() !== "" ||
    hideSolved;

  const solvedCount = solved.length;
  const totalCount = problems.length;
  const progressPercent = Math.round((solvedCount / totalCount) * 100);
  const totalPoints = problems
    .filter((p) => solved.includes(p.id))
    .reduce((sum, p) => sum + p.points, 0);

  return (
    <div className="max-w-[1200px] mx-auto select-none space-y-7">
      {/* Header section */}
      <div className="pt-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-main)] tracking-tight">
              Linux Systems Challenges
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1.5 max-w-xl leading-relaxed">
              Master POSIX utilities, system administration, and shell diagnostics in a live CentOS sandbox.
            </p>
          </div>

          {/* Minimal progress tracker */}
          <div className="shrink-0 flex flex-col items-start md:items-end gap-1.5">
            <div className="text-xs font-mono text-[var(--text-muted)]">
              <span className="text-[var(--text-main)] font-semibold">{solvedCount}</span>
              <span>/{totalCount} completed</span>
              <span className="text-[var(--text-tertiary)]"> ({progressPercent}%)</span>
              <span className="mx-1.5 text-[var(--border-strong)]">·</span>
              <span className="text-[var(--accent-amber)] font-medium">{totalPoints} pts</span>
            </div>
            <div className="w-48 h-1.5 rounded-full bg-[var(--surface-subtle)] overflow-hidden border border-[var(--border-subtle)]">
              <div
                className="h-full bg-[var(--accent-primary)] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
        <div className="h-px w-full bg-[var(--border-subtle)]" />
      </div>

      {/* Search & Filters */}
      <div className="space-y-3.5">
        {/* Search input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search drills by command (e.g. sed, grep), concept, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-[var(--surface-base)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] text-[var(--text-main)] text-sm rounded-xl pl-10 pr-10 placeholder-[var(--text-tertiary)] transition-colors focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter controls row */}
        <div className="flex flex-col gap-2.5">
          {/* Categories */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`chip-mimo mimo-press ${active ? "active" : ""}`}
                >
                  {cat.id !== "ALL" && (
                    <CategoryIcon category={cat.id} className="w-3.5 h-3.5" />
                  )}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Level + Hide Solved + Reset */}
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
            <span className="text-[var(--text-tertiary)] font-mono text-[11px] uppercase tracking-wider mr-1">
              Difficulty:
            </span>
            {difficulties.map((diff) => {
              const active = selectedDifficulty === diff.id;
              return (
                <button
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`relative px-3 py-1 rounded-full border text-xs font-mono transition-colors cursor-pointer mimo-press flex items-center gap-1.5 ${
                    active
                      ? "border-[var(--accent-primary)] text-white font-medium"
                      : "bg-[var(--surface-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-main)]"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="difficulty-active-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      className="absolute inset-0 bg-[var(--accent-primary)] rounded-full -z-10"
                    />
                  )}
                  {diff.color && <span className={`w-1.5 h-1.5 rounded-full ${diff.color} relative z-10`} />}
                  <span className="relative z-10">{diff.label}</span>
                </button>
              );
            })}

            <div className="w-px h-4 bg-[var(--border-subtle)] mx-1 hidden sm:block" />

            {/* Hide solved toggle */}
            <button
              onClick={() => setHideSolved(!hideSolved)}
              className={`px-3 py-1 rounded-full border text-xs transition-colors cursor-pointer mimo-press ${
                hideSolved
                  ? "bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white font-medium"
                  : "bg-[var(--surface-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-main)]"
              }`}
            >
              Hide solved
            </button>

            {/* Reset filters button */}
            {hasActiveFilter && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-[var(--accent-primary-soft)] hover:text-white flex items-center gap-1 cursor-pointer transition-colors ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
        <span>
          Showing {filteredProblems.length} drill{filteredProblems.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Cards grid */}
      {filteredProblems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProblems.map((problem) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              isSolved={solved.includes(problem.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-12 text-center max-w-lg mx-auto">
          <p className="text-sm text-[var(--text-muted)] mb-4">
            No challenges match your current search and filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="btn-mimo-primary text-xs"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
