import { useState, useMemo } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { problems } from "../lib/problems";
import { useProgress } from "../lib/useProgress";
import { type Category, type Difficulty } from "../lib/types";
import ProgressDashboard from "../components/ProgressDashboard";
import FilterBar from "../components/FilterBar";
import ProblemCard from "../components/ProblemCard";

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

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto select-none">
      {/* Clean macOS Pro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-main)] tracking-tight font-sans">
              Linux Systems Challenges
            </h1>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[var(--surface-subtle)] text-[var(--accent-cyan)] border border-[var(--border-subtle)] font-semibold">
              40 Scenarios
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl font-sans leading-relaxed">
            Hands-on contest scenarios modeled after the 15th IT Skills Olympics (ITSO) competition on CentOS Stream 9. Select any scenario to enter its dedicated workstation.
          </p>
        </div>
      </div>

      {/* Progress & Contest Scoring Dashboard */}
      <ProgressDashboard
        problems={problems}
        solved={solved}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* Search & Filter Controls */}
      <FilterBar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        hideSolved={hideSolved}
        onToggleHideSolved={() => setHideSolved(!hideSolved)}
      />

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] px-1">
        <span>
          Showing <strong className="text-[var(--text-main)] font-semibold">{filteredProblems.length}</strong> of{" "}
          <strong className="text-[var(--text-main)]">{problems.length}</strong> challenges
        </span>
        {(selectedCategory !== "ALL" || selectedDifficulty !== "ALL" || searchQuery || hideSolved) && (
          <button
            onClick={handleResetFilters}
            className="text-[var(--accent-cyan)] hover:brightness-110 flex items-center gap-1 cursor-pointer font-medium transition-all apple-press"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Problem Cards Grid */}
      {filteredProblems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProblems.map((problem) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              isSolved={solved.includes(problem.id)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-12 text-center space-y-4 shadow-[var(--card-shadow)]">
          <div className="w-12 h-12 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] mx-auto flex items-center justify-center text-[var(--text-muted)]">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--text-main)] mb-1">No matching challenges found</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              Try loosening your search keywords, switching domain filters, or toggling hidden solved challenges.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-mono px-4 py-2 rounded-xl bg-[var(--accent-cyan)] hover:brightness-110 text-white font-medium transition-all cursor-pointer apple-press shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters & Search</span>
          </button>
        </div>
      )}
    </div>
  );
}
