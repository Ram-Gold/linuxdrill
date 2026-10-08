import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  List,
  ChevronsDownUp,
  ChevronsUpDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Problem, Category } from "../lib/types";
import { CATEGORY_INFO } from "../lib/types";
import CategoryIcon from "./CategoryIcon";
import ProblemCard from "./ProblemCard";

interface CuratedRoadmapProps {
  problems: Problem[];
  solved: string[];
  hasActiveSearchOrFilter?: boolean;
}

export default function CuratedRoadmap({
  problems,
  solved,
  hasActiveSearchOrFilter = false,
}: CuratedRoadmapProps) {
  // 1. Find recommended next drill: first unsolved drill, or problem #1
  const upNextDrill = problems.find((p) => !solved.includes(p.id)) || problems[0];

  // 2. View mode: separate cards vs compact list
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  // 3. Group problems into tracks by category/topic
  const tracksMap = new Map<string, { topic: string; topicName: string; drills: Problem[] }>();

  problems.forEach((problem) => {
    const key = problem.topic || "OTHER";
    if (!tracksMap.has(key)) {
      tracksMap.set(key, {
        topic: key,
        topicName: problem.topicName || key,
        drills: [],
      });
    }
    tracksMap.get(key)!.drills.push(problem);
  });

  const tracks = Array.from(tracksMap.values());
  const upNextTrackKey = upNextDrill?.topic || (tracks[0]?.topic ?? "");

  // 4. User explicit toggle overrides (topicKey -> boolean)
  const [userOverrides, setUserOverrides] = useState<Record<string, boolean>>({});

  const isTrackExpanded = (topicKey: string): boolean => {
    if (userOverrides[topicKey] !== undefined) {
      return userOverrides[topicKey];
    }
    // Default: auto-expand during search/filter, or auto-expand only the up-next track
    if (hasActiveSearchOrFilter) {
      return true;
    }
    return topicKey === upNextTrackKey;
  };

  const toggleTrack = (topicKey: string) => {
    const currentlyExpanded = isTrackExpanded(topicKey);
    setUserOverrides((prev) => ({
      ...prev,
      [topicKey]: !currentlyExpanded,
    }));
  };

  const areAllExpanded = tracks.length > 0 && tracks.every((t) => isTrackExpanded(t.topic));

  const toggleAllTracks = () => {
    const targetState = !areAllExpanded;
    const newOverrides: Record<string, boolean> = {};
    tracks.forEach((t) => {
      newOverrides[t.topic] = targetState;
    });
    setUserOverrides(newOverrides);
  };

  const getDiffBadge = (diff: string) => {
    switch (diff) {
      case "Easy":
        return { label: "Easy", dot: "bg-[var(--accent-green)]", text: "text-[var(--accent-green)]" };
      case "Average":
        return { label: "Medium", dot: "bg-[var(--accent-amber)]", text: "text-[var(--accent-amber)]" };
      case "Difficult":
        return { label: "Hard", dot: "bg-[var(--accent-red)]", text: "text-[var(--accent-red)]" };
      default:
        return { label: diff, dot: "bg-[var(--text-muted)]", text: "text-[var(--text-muted)]" };
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* CURATED TRACK ROADMAP WITH SEPARATE CARDS & COLLAPSIBLE MODULES */}
      <div className="space-y-4">
        {/* Roadmap section header + View switcher + Expand/Collapse toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-main)]">
              Curated Learning Roadmap
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Structured progressive tracks. Click any track header to expand or collapse drills.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            <span className="text-xs font-mono text-[var(--text-tertiary)] hidden md:inline">
              {tracks.length} Tracks · {problems.length} Total Drills
            </span>

            {/* View Mode Toggle: Cards vs List (Icon only with spring sliding pill) */}
            <div className="relative flex items-center p-0.5 rounded-xl bg-[var(--surface-subtle)]">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`relative w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer mimo-press transition-colors ${
                  viewMode === "cards"
                    ? "text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
                title="Cards View"
                aria-label="Cards View"
              >
                {viewMode === "cards" && (
                  <motion.div
                    layoutId="roadmap-view-mode-pill"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    className="absolute inset-0 bg-[var(--accent-primary)] rounded-lg shadow-sm"
                  />
                )}
                <LayoutGrid className="w-4 h-4 relative z-10" />
              </button>

              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`relative w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer mimo-press transition-colors ${
                  viewMode === "list"
                    ? "text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
                title="Compact List View"
                aria-label="Compact List View"
              >
                {viewMode === "list" && (
                  <motion.div
                    layoutId="roadmap-view-mode-pill"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    className="absolute inset-0 bg-[var(--accent-primary)] rounded-lg shadow-sm"
                  />
                )}
                <List className="w-4 h-4 relative z-10" />
              </button>
            </div>

            <button
              type="button"
              onClick={toggleAllTracks}
              className="w-8 h-8 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center justify-center transition-colors cursor-pointer mimo-press"
              title={areAllExpanded ? "Collapse All Tracks" : "Expand All Tracks"}
              aria-label={areAllExpanded ? "Collapse All Tracks" : "Expand All Tracks"}
            >
              {areAllExpanded ? (
                <ChevronsDownUp className="w-4 h-4" />
              ) : (
                <ChevronsUpDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Tracks List */}
        <div className="space-y-3.5">
          {tracks.map((track, trackIdx) => {
            const isExpanded = isTrackExpanded(track.topic);
            const trackSolvedCount = track.drills.filter((d) => solved.includes(d.id)).length;
            const trackTotal = track.drills.length;
            const isCompleted = trackSolvedCount === trackTotal && trackTotal > 0;
            const percent = Math.round((trackSolvedCount / trackTotal) * 100);
            const topicInfo = CATEGORY_INFO[track.topic as Category];
            const topicDesc = topicInfo?.description;

            return (
              <div
                key={track.topic}
                className="rounded-2xl transition-colors duration-150 bg-[var(--surface-base)] p-1.5 sm:p-2"
              >
                {/* Track Section Header Button */}
                <button
                  type="button"
                  onClick={() => toggleTrack(track.topic)}
                  className={`w-full p-3.5 sm:p-4 rounded-xl flex items-center justify-between gap-3 text-left cursor-pointer mimo-press transition-all duration-150 ${
                    isExpanded
                      ? "bg-white/[0.02] hover:bg-white/[0.06]"
                      : "hover:bg-white/[0.05]"
                  }`}
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isCompleted
                          ? "bg-[var(--accent-green)]/15 text-[var(--accent-green)]"
                          : "bg-[var(--surface-subtle)] text-[var(--accent-primary-soft)]"
                      }`}
                    >
                      <CategoryIcon category={track.topic} className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
                          Track 0{trackIdx + 1}
                        </span>
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent-green)]">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Complete</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-[var(--text-main)] truncate track-title font-heading">
                        {track.topicName}
                      </h4>
                      {topicDesc && (
                        <p className="text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5 hidden sm:block">
                          {topicDesc}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right side: Progress Bar & Accordion Chevron */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono text-[var(--text-muted)]">
                        <span className="text-[var(--text-main)] font-semibold">{trackSolvedCount}</span>
                        /{trackTotal} done
                      </div>
                    </div>

                    <div className="w-16 sm:w-24 h-2 rounded-full bg-[var(--surface-subtle)] overflow-hidden hidden xs:block">
                      <div
                        className={`h-full transition-[width] duration-300 ease-out ${
                          isCompleted ? "bg-[var(--accent-green)]" : "bg-[var(--accent-primary)]"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                      className="w-7 h-7 rounded-lg bg-[var(--surface-subtle)] flex items-center justify-center text-[var(--text-muted)]"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </div>
                </button>

                {/* Collapsible Drill Items List with Smooth Ease-in Height Motion */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key={`content-${track.topic}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                        transition: {
                          height: {
                            duration: 0.36,
                            ease: [0.16, 1, 0.3, 1],
                          },
                          opacity: {
                            duration: 0.26,
                            delay: 0.05,
                            ease: "easeOut",
                          },
                        },
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                        transition: {
                          height: {
                            duration: 0.28,
                            ease: [0.25, 1, 0.5, 1],
                          },
                          opacity: {
                            duration: 0.18,
                            ease: "easeOut",
                          },
                        },
                      }}
                      className="overflow-hidden"
                    >
                      {viewMode === "cards" ? (
                        <div className="p-2 sm:p-2.5 pt-2">
                          {/* Separate Cards Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-3.5">
                            {track.drills.map((drill, idx) => (
                              <ProblemCard
                                key={drill.id}
                                problem={drill}
                                isSolved={solved.includes(drill.id)}
                                stepIndex={idx + 1}
                                isUpNext={upNextDrill?.id === drill.id && !solved.includes(drill.id)}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Compact List View */
                        <div className="p-1.5 sm:p-2 pt-2 space-y-1.5">
                          {track.drills.map((drill, idx) => {
                            const isSolved = solved.includes(drill.id);
                            const diff = getDiffBadge(drill.difficulty);

                            return (
                              <Link
                                key={drill.id}
                                to={`/p/${drill.id}`}
                                className={`group px-4 sm:px-5 py-3 rounded-xl flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                                  isSolved
                                    ? "bg-[var(--surface-card)]/60 hover:bg-[var(--surface-card-hover)]"
                                    : "bg-[var(--surface-card)] hover:bg-[var(--surface-card-hover)]"
                                }`}
                              >
                                {/* Step number + Title + Short description */}
                                <div className="flex items-center gap-3.5 min-w-0">
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono shrink-0 transition-colors ${
                                      isSolved
                                        ? "bg-[var(--accent-green)]/15 text-[var(--accent-green)] font-semibold"
                                        : "bg-[var(--surface-elevated)] text-[var(--text-tertiary)] group-hover:text-[var(--text-main)]"
                                    }`}
                                  >
                                    {isSolved ? (
                                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                    ) : (
                                      <span>{String(idx + 1).padStart(2, "0")}</span>
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <div className="text-sm font-medium text-[var(--text-main)] group-hover:text-[var(--accent-primary-soft)] transition-colors truncate">
                                      {drill.title}
                                    </div>
                                    <div className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">
                                      {drill.description || drill.task}
                                    </div>
                                  </div>
                                </div>

                                {/* Metadata: Level, points, right chevron */}
                                <div className="flex items-center gap-3 shrink-0">
                                  <div className="hidden sm:flex items-center text-xs font-mono">
                                    <span className={diff.text}>{diff.label}</span>
                                  </div>

                                  <span className="text-xs font-mono text-[var(--text-muted)]">
                                    {drill.points} pts
                                  </span>

                                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--text-tertiary)] group-hover:text-[var(--text-main)] group-hover:translate-x-0.5 transition-all">
                                    <ChevronRight className="w-4 h-4" />
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
