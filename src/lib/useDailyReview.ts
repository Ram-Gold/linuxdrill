import { useState, useEffect, useCallback } from "react";
import { problems } from "./problems";

const REVIEW_KEY = "bashist:daily_review";
const LEGACY_REVIEW_KEY = "linuxdrill:daily_review";
const STREAK_KEY = "bashist:streak";
const LEGACY_STREAK_KEY = "linuxdrill:streak";
const REVIEW_EVENT = "bashist:review_updated";
const LEGACY_REVIEW_EVENT = "linuxdrill:review_updated";

interface DailyReviewState {
  date: string; // YYYY-MM-DD
  reviewIds: string[];
  completedIds: string[];
}

interface StreakState {
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Deterministically pick up to `count` items from an array based on date seed.
 */
function pickDailyReviews(solvedIds: string[], count = 3): string[] {
  if (solvedIds.length === 0) return [];
  if (solvedIds.length <= count) return [...solvedIds];

  const shuffled = [...solvedIds].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Standalone helper to mark a review drill as completed from anywhere (e.g. ProblemPage).
 */
export function completeDailyReviewDrill(drillId: string) {
  try {
    const today = getTodayString();
    const raw = localStorage.getItem(REVIEW_KEY) || localStorage.getItem(LEGACY_REVIEW_KEY);
    if (!raw) return;
    const parsed: DailyReviewState = JSON.parse(raw);
    if (parsed.date === today && parsed.reviewIds.includes(drillId)) {
      if (!parsed.completedIds.includes(drillId)) {
        parsed.completedIds.push(drillId);
        localStorage.setItem(REVIEW_KEY, JSON.stringify(parsed));
        window.dispatchEvent(new Event(REVIEW_EVENT));
        window.dispatchEvent(new Event(LEGACY_REVIEW_EVENT));
      }
    }
  } catch {
    // ignore
  }
}

/**
 * Standalone helper to record streak activity from anywhere.
 */
export function recordDailyStreakActivity() {
  try {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const raw = localStorage.getItem(STREAK_KEY) || localStorage.getItem(LEGACY_STREAK_KEY);
    const parsed: StreakState = raw ? JSON.parse(raw) : { streak: 0, lastActiveDate: "" };

    if (parsed.lastActiveDate === today) {
      return; // Already recorded today
    }

    const newStreak = parsed.lastActiveDate === yesterday ? parsed.streak + 1 : 1;
    localStorage.setItem(STREAK_KEY, JSON.stringify({
      streak: newStreak,
      lastActiveDate: today,
    }));
    window.dispatchEvent(new Event(REVIEW_EVENT));
    window.dispatchEvent(new Event(LEGACY_REVIEW_EVENT));
  } catch {
    // ignore
  }
}

function getInitialReviewState(solvedIds: string[]): DailyReviewState {
  const today = getTodayString();
  try {
    const raw = localStorage.getItem(REVIEW_KEY) || localStorage.getItem(LEGACY_REVIEW_KEY);
    if (raw) {
      const parsed: DailyReviewState = JSON.parse(raw);
      if (parsed.date === today) {
        if (parsed.reviewIds.length === 0 && solvedIds.length > 0) {
          const nextReviews = pickDailyReviews(solvedIds, 3);
          const updated: DailyReviewState = { ...parsed, reviewIds: nextReviews };
          localStorage.setItem(REVIEW_KEY, JSON.stringify(updated));
          return updated;
        }
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  const initialReviews = pickDailyReviews(solvedIds, 3);
  const newState: DailyReviewState = {
    date: today,
    reviewIds: initialReviews,
    completedIds: [],
  };
  try {
    localStorage.setItem(REVIEW_KEY, JSON.stringify(newState));
  } catch {
    // ignore
  }
  return newState;
}

export function useDailyReview(solvedIds: string[]) {
  const today = getTodayString();
  const yesterday = getYesterdayString();

  // Streak state
  const [streak, setStreak] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(STREAK_KEY) || localStorage.getItem(LEGACY_STREAK_KEY);
      if (!raw) return 0;
      const parsed: StreakState = JSON.parse(raw);
      if (parsed.lastActiveDate === today || parsed.lastActiveDate === yesterday) {
        return parsed.streak;
      }
      return 0; // Streak broken if inactive more than 1 day
    } catch {
      return 0;
    }
  });

  // Daily Review state initialized cleanly
  const [reviewState, setReviewState] = useState<DailyReviewState>(() =>
    getInitialReviewState(solvedIds)
  );

  // Listen to sync events across tabs or components
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const rawRev = localStorage.getItem(REVIEW_KEY) || localStorage.getItem(LEGACY_REVIEW_KEY);
        if (rawRev) setReviewState(JSON.parse(rawRev));

        const rawStreak = localStorage.getItem(STREAK_KEY) || localStorage.getItem(LEGACY_STREAK_KEY);
        if (rawStreak) {
          const parsed = JSON.parse(rawStreak);
          const currentToday = getTodayString();
          const currentYesterday = getYesterdayString();
          if (parsed.lastActiveDate === currentToday || parsed.lastActiveDate === currentYesterday) {
            setStreak(parsed.streak);
          } else {
            setStreak(0);
          }
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener(REVIEW_EVENT, handleUpdate);
    window.addEventListener(LEGACY_REVIEW_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(REVIEW_EVENT, handleUpdate);
      window.removeEventListener(LEGACY_REVIEW_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Mark a review drill as completed
  const markReviewComplete = useCallback((drillId: string) => {
    setReviewState((prev) => {
      if (prev.completedIds.includes(drillId)) return prev;
      const updated: DailyReviewState = {
        ...prev,
        completedIds: [...prev.completedIds, drillId],
      };
      try {
        localStorage.setItem(REVIEW_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    recordDailyStreakActivity();
  }, []);

  // Remaining review drills pending for today
  const pendingReviewIds = reviewState.reviewIds.filter(
    (id) => !reviewState.completedIds.includes(id)
  );

  const pendingReviewProblems = problems.filter((p) =>
    pendingReviewIds.includes(p.id)
  );

  return {
    streak,
    pendingReviewProblems,
    pendingReviewCount: pendingReviewProblems.length,
    totalDailyReviews: reviewState.reviewIds.length,
    markReviewComplete,
  };
}
