import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Dumbbell,
  Zap,
  ChevronRight,
  Clock,
  Sparkles,
  PartyPopper,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { problems } from "../lib/problems";
import { useDailyReview } from "../lib/useDailyReview";
import CategoryIcon from "./CategoryIcon";

interface HomeHeroProps {
  solvedCount: number;
  totalCount: number;
  progressPercent: number;
  totalPoints?: number;
  nextProblemId?: string;
  nextProblemTitle?: string;
  solved?: string[];
}

export default function HomeHero({
  totalPoints = 0,
  nextProblemId,
  nextProblemTitle,
  solved = [],
}: HomeHeroProps) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const reviewDropdownRef = useRef<HTMLDivElement>(null);

  // Daily review and streak system
  const {
    streak,
    pendingReviewProblems,
    pendingReviewCount,
  } = useDailyReview(solved);

  // Close review popover on outside click or Escape key
  useEffect(() => {
    if (!isReviewOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        reviewDropdownRef.current &&
        !reviewDropdownRef.current.contains(event.target as Node)
      ) {
        setIsReviewOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsReviewOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isReviewOpen]);

  // Current / Next drill
  const currentDrill = useMemo(() => {
    if (nextProblemId) {
      return problems.find((p) => p.id === nextProblemId) || problems[0];
    }
    return problems.find((p) => !solved.includes(p.id)) || problems[0];
  }, [nextProblemId, solved]);

  // Current Track and its drills
  const trackProblems = useMemo(() => {
    if (!currentDrill) return [];
    return problems.filter((p) => p.topic === currentDrill.topic);
  }, [currentDrill]);

  const trackTotal = trackProblems.length;
  const trackSolved = trackProblems.filter((p) => solved.includes(p.id)).length;
  const trackRemaining = Math.max(0, trackTotal - trackSolved);
  const trackProgressPercent =
    trackTotal > 0 ? Math.round((trackSolved / trackTotal) * 100) : 0;

  const trackRemainingText =
    trackRemaining === 0
      ? "Track completed!"
      : `${trackRemaining} ${trackRemaining === 1 ? "lesson" : "lessons"} to go`;

  const trackName = currentDrill?.topicName || "Basic Shell";

  return (
    <section className="space-y-2.5 select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP STATUS BAR (Title, Review, Daily Streak, XP)
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Track title ("Linux System Administration") */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
            Linux System Administration
          </h1>
        </div>

        {/* Right: Review pill button, Daily streak badge, and XP badge */}
        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          {/* Review Button & Dropdown Popover */}
          <div className="relative" ref={reviewDropdownRef}>
            <button
              onClick={() => setIsReviewOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-full bg-[var(--surface-base)] shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all mimo-press cursor-pointer"
              title="Daily spaced repetition review"
              aria-label="Daily Review"
              aria-expanded={isReviewOpen}
            >
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--accent-orange-bg)] text-[var(--accent-orange)] flex items-center justify-center shrink-0">
                <Dumbbell className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-semibold text-[var(--text-main)]">Review</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                  pendingReviewCount > 0
                    ? "bg-[var(--accent-orange)] text-white"
                    : "bg-[var(--surface-subtle)] text-[var(--text-muted)]"
                }`}
              >
                {pendingReviewCount}
              </span>
            </button>

            {/* Dropdown Popover (Apple fluid curve animation from Navbar) */}
            <AnimatePresence>
              {isReviewOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 4, scale: 0.97, filter: "blur(4px)" }}
                  transition={{
                    duration: 0.24,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{ willChange: "transform, opacity, filter" }}
                  className="absolute right-0 top-full mt-3.5 w-[22rem] sm:w-[28rem] bg-[var(--surface-base)] rounded-2xl shadow-[0_24px_56px_-6px_rgba(0,0,0,0.5),0_12px_24px_-6px_rgba(0,0,0,0.3)] z-50 p-4 sm:p-5 backdrop-blur-xl origin-top-right transform-gpu"
                >
                  {/* Speech bubble pointer / beak indicator pointing to Review button */}
                  <div
                    className="absolute -top-1.5 right-10 sm:right-12 w-3.5 h-3.5 bg-[var(--surface-base)] rotate-45 pointer-events-none shadow-[-3px_-3px_5px_rgba(0,0,0,0.08)]"
                    aria-hidden="true"
                  />

                  {/* Popover Header — only visible when there are pending review cards */}
                  {pendingReviewProblems.length > 0 && (
                    <div className="pb-3 border-b border-[var(--surface-subtle)] space-y-1">
                      <h3 className="text-sm sm:text-base font-bold text-[var(--text-main)]">
                        Daily Review Deck
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        We found some practice opportunities based on what you recently learned.
                      </p>
                    </div>
                  )}

                  {/* Popover Body */}
                  <div className={`${pendingReviewProblems.length > 0 ? "mt-3" : "py-1"} space-y-2.5 max-h-80 overflow-y-auto pr-1`}>
                    {pendingReviewProblems.length > 0 ? (
                      pendingReviewProblems.map((drill) => (
                        <Link
                          key={drill.id}
                          to={`/p/${drill.id}`}
                          onClick={() => {
                            setIsReviewOpen(false);
                          }}
                          className="group flex items-center justify-between p-4 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] transition-colors mimo-press"
                        >
                          <div className="min-w-0 pr-2 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-orange)] block">
                              {drill.category || drill.topicName || "REVIEW"}
                            </span>
                            <h4 className="text-xs font-bold text-[var(--text-main)] truncate leading-snug">
                              {drill.title}
                            </h4>
                            <span className="text-[11px] text-[var(--accent-amber)] font-medium block">
                              +{drill.points} XP
                            </span>
                          </div>
                          <div className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-primary-soft)] group-hover:translate-x-1 transition-transform pl-2">
                            <span>Practice</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="py-6 sm:py-8 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[var(--accent-amber-bg)] text-[var(--accent-amber)] flex items-center justify-center mx-auto">
                          <PartyPopper className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm sm:text-base font-bold text-[var(--text-main)]">
                            All Caught Up! 🎉
                          </h4>
                          <p className="text-xs text-[var(--text-muted)] max-w-[270px] mx-auto leading-relaxed">
                            Congratulations on finishing all your reviews! Great job staying sharp—come again next time for your next refresher deck!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Daily Streak Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-full bg-[var(--surface-base)] shadow-[var(--card-shadow)]"
            title="Consecutive active learning days"
          >
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--surface-subtle)] text-[var(--text-muted)] flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-semibold text-[var(--text-main)]">Daily Streak</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-[var(--surface-subtle)] text-[var(--text-muted)]">
              {streak}
            </span>
          </div>

          {/* XP Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-full bg-[var(--surface-base)] shadow-[var(--card-shadow)]"
            title="Total XP earned"
          >
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--accent-amber-bg)] text-[var(--accent-amber)] flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-semibold text-[var(--text-main)]">XP</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-[var(--surface-subtle)] text-[var(--accent-amber)]">
              {totalPoints.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CARD: PICK UP WHERE YOU LEFT OFF
          (Displays current track, lesson title, and lessons left)
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-[var(--surface-base)] shadow-[var(--card-shadow)] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all">
        {/* Left: Icon, Track Label, Current Lesson Title, Track Progress */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-0">
          {/* Circular Icon Badge matching the track you're on */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--accent-green-bg)] text-[var(--accent-green)] flex items-center justify-center shrink-0">
            <CategoryIcon
              category={currentDrill?.topic || currentDrill?.category}
              className="w-7 h-7 sm:w-8 sm:h-8"
            />
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            {/* Track Name Pill */}
            <div className="text-[11px] font-bold tracking-wider text-[var(--text-tertiary)] uppercase">
              LEARN · {trackName.toUpperCase()}
            </div>

            {/* Current Lesson Title Link with Chevron */}
            <Link
              to={nextProblemId ? `/p/${nextProblemId}` : `/p/${currentDrill?.id || ""}`}
              className="group inline-flex items-center gap-2 text-lg sm:text-xl font-bold font-heading text-[var(--text-main)] hover:text-[var(--accent-primary-soft)] transition-colors truncate max-w-full"
            >
              <span className="truncate">
                {currentDrill?.title || nextProblemTitle || "Continue Linux Systems Drill"}
              </span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-tertiary)] group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>

            {/* Track Progress Bar & Lessons Left */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[var(--text-muted)]">
              <div className="w-36 sm:w-48 h-2.5 rounded-full bg-[var(--surface-subtle)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--accent-green)] transition-all duration-500"
                  style={{ width: `${Math.max(trackProgressPercent, 4)}%` }}
                />
              </div>
              <span className="font-semibold font-mono text-[var(--text-main)]">{trackProgressPercent}%</span>
              <span className="inline-flex items-center gap-1.5 text-[var(--text-tertiary)]">
                <Clock className="w-3.5 h-3.5" />
                <span>{trackRemainingText}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Theme-Adaptive Action Button */}
        <div className="shrink-0">
          <Link
            to={nextProblemId ? `/p/${nextProblemId}` : `/p/${currentDrill?.id || ""}`}
            className="inline-flex items-center justify-center w-full md:w-auto px-6 py-3.5 rounded-2xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-sm sm:text-base font-bold shadow-sm mimo-press transition-all cursor-pointer"
          >
            <span>Keep Making Progress</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
