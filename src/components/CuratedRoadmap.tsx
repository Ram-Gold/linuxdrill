import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Sparkles, ChevronDown, ChevronRight, Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Problem } from "../lib/types";
import CategoryIcon from "./CategoryIcon";

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
  const isUpNextSolved = upNextDrill ? solved.includes(upNextDrill.id) : false;

  // 2. Group problems into tracks by category/topic
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

  // 3. User explicit toggle overrides (topicKey -> boolean)
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
      {/* 1. UP NEXT SPOTLIGHT (Cures "where do I start?" paralysis) */}
      {upNextDrill && (
        <div className="relative overflow-hidden rounded-2xl border border-[var(--accent-primary)]/40 bg-gradient-to-r from-[var(--surface-base)] via-[var(--surface-subtle)] to-[var(--surface-base)] p-5 sm:p-6 transition-all duration-200 hover:border-[var(--accent-primary)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--accent-primary)] text-white">
                  <Sparkles className="w-3 h-3" />
                  <span>{isUpNextSolved ? "Review Drill" : "Recommended Next Drill"}</span>
                </span>
                <span className="text-xs font-mono text-[var(--text-tertiary)]">
                  {upNextDrill.topicName}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-main)]">
                {upNextDrill.title}
              </h2>

              <p className="text-xs sm:text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                {upNextDrill.description || upNextDrill.task}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-mono font-medium text-[var(--accent-amber)]">
                  +{upNextDrill.points} pts
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] capitalize">
                  {upNextDrill.difficulty} level
                </div>
              </div>

              <Link
                to={`/p/${upNextDrill.id}`}
                className="btn-mimo-primary flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-sm hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isUpNextSolved ? "Replay Drill" : "Start Drill"}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. CURATED TRACK ROADMAP WITH COLLAPSIBLE MODULES */}
      <div className="space-y-4">
        {/* Roadmap section header + Expand/Collapse All toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-main)]">
              Curated Learning Roadmap
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Structured progressive tracks. Click any track header to expand or collapse drills.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="text-xs font-mono text-[var(--text-tertiary)] hidden sm:inline">
              {tracks.length} Tracks · {problems.length} Total Drills
            </span>

            <button
              type="button"
              onClick={toggleAllTracks}
              className="text-xs font-mono text-[var(--accent-primary-soft)] hover:text-white transition-colors cursor-pointer"
            >
              {areAllExpanded ? "Collapse All Tracks" : "Expand All Tracks"}
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

            return (
              <div
                key={track.topic}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? "bg-[var(--surface-base)] border-[var(--border-strong)]"
                    : "bg-[var(--surface-base)]/80 border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
                }`}
              >
                {/* Track Section Header Button */}
                <button
                  type="button"
                  onClick={() => toggleTrack(track.topic)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer mimo-press transition-colors hover:bg-[var(--surface-subtle)]/40"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                        isCompleted
                          ? "bg-[var(--accent-green)]/15 border-[var(--accent-green)]/30 text-[var(--accent-green)]"
                          : "bg-[var(--surface-elevated)] border-[var(--border-subtle)] text-[var(--accent-primary-soft)]"
                      }`}
                    >
                      <CategoryIcon category={track.topic} className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[var(--text-tertiary)]">
                          Track 0{trackIdx + 1}
                        </span>
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent-green)]">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Complete</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-[var(--text-main)] truncate">
                        {track.topicName}
                      </h4>
                    </div>
                  </div>

                  {/* Right side: Progress Bar & Accordion Chevron */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono text-[var(--text-muted)]">
                        <span className="text-[var(--text-main)] font-semibold">{trackSolvedCount}</span>
                        /{trackTotal} done
                      </div>
                    </div>

                    <div className="w-20 sm:w-24 h-1.5 rounded-full bg-[var(--surface-elevated)] overflow-hidden border border-[var(--border-subtle)] hidden xs:block">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? "bg-[var(--accent-green)]" : "bg-[var(--accent-primary)]"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                      className="w-7 h-7 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]"
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
                            ease: "easeIn",
                          },
                        },
                      }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] bg-[var(--surface-subtle)]/20">
                        {track.drills.map((drill, idx) => {
                          const isSolved = solved.includes(drill.id);
                          const diff = getDiffBadge(drill.difficulty);

                          return (
                            <Link
                              key={drill.id}
                              to={`/p/${drill.id}`}
                              className={`group px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                                isSolved
                                  ? "bg-[var(--surface-base)]/40 hover:bg-[var(--surface-subtle)]/70"
                                  : "hover:bg-[var(--surface-subtle)]"
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
                                <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono">
                                  <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
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
