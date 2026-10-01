import { useState, useMemo } from "react";
import { problems } from "../lib/problems";
import { useProgress } from "../lib/useProgress";
import { type Category, type Difficulty } from "../lib/types";
import HomeHero from "../components/HomeHero";
import CuratedRoadmap from "../components/CuratedRoadmap";
import FilterActionBar from "../components/FilterActionBar";

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

  const nextProblem = useMemo(() => {
    return problems.find((p) => !solved.includes(p.id)) || problems[0];
  }, [solved]);

  return (
    <div className="max-w-[1400px] mx-auto select-none space-y-3.5 sm:space-y-4">
      {/* Hero Section */}
      <HomeHero
        solvedCount={solvedCount}
        totalCount={totalCount}
        progressPercent={progressPercent}
        totalPoints={totalPoints}
        nextProblemId={nextProblem?.id}
        nextProblemTitle={nextProblem?.title}
        solved={solved}
      />

      {/* Filter Action Bar (Unified Compact UX) */}
      <FilterActionBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
        hideSolved={hideSolved}
        setHideSolved={setHideSolved}
        handleResetFilters={handleResetFilters}
        hasActiveFilter={Boolean(hasActiveFilter)}
        solved={solved}
      />

      {/* Curated Roadmap (Progressive Tracks with Spotlight Hero) */}
      {filteredProblems.length > 0 ? (
        <CuratedRoadmap
          problems={filteredProblems}
          solved={solved}
          hasActiveSearchOrFilter={Boolean(hasActiveFilter)}
        />
      ) : (
        <div className="rounded-2xl bg-[var(--surface-base)] p-12 text-center max-w-lg mx-auto">
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
