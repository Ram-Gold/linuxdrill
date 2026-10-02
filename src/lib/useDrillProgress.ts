import { useState, useEffect, useCallback, useMemo } from 'react';
import { type DomainCode, DRILL_DECKS, getAllDrills } from '../data/drillDecks';

const STORAGE_KEY = 'linuxdrill:drill_progress_v1';
const STREAK_KEY = 'linuxdrill:drill_streak_v1';
const PRACTICE_STAGE_KEY = 'linuxdrill:practice_stage_v1';
const DRILL_MODE_KEY = 'linuxdrill:drill_mode_v1';

export type DrillStage = 1 | 2 | 3;
export type DrillMode = 'typer' | 'shell';


export interface DrillItemProgress {
  stage: DrillStage;
  mastered: boolean;
  bestWpm: number;
  errorCount: number;
  lastReviewed: number;
  streak: number;
  attempts: number;
}

export type DrillProgress = Record<string, DrillItemProgress>;

interface StreakState {
  currentStreak: number;
  bestStreak: number;
}

function loadProgress(): DrillProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadStreak(): StreakState {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? JSON.parse(raw) : { currentStreak: 0, bestStreak: 0 };
  } catch {
    return { currentStreak: 0, bestStreak: 0 };
  }
}

function loadPracticeStage(): DrillStage {
  try {
    const raw = localStorage.getItem(PRACTICE_STAGE_KEY);
    if (raw === '1' || raw === '2' || raw === '3') {
      return Number(raw) as DrillStage;
    }
  } catch {
    // fallback
  }
  return 1;
}

function loadDrillMode(): DrillMode {
  try {
    const raw = localStorage.getItem(DRILL_MODE_KEY);
    if (raw === 'typer' || raw === 'shell') {
      return raw;
    }
  } catch {
    // fallback
  }
  return 'typer';
}

export function useDrillProgress() {
  const [progress, setProgress] = useState<DrillProgress>(loadProgress);
  const [streakState, setStreakState] = useState<StreakState>(loadStreak);
  const [practiceStage, setPracticeStageState] = useState<DrillStage>(loadPracticeStage);
  const [drillMode, setDrillModeState] = useState<DrillMode>(loadDrillMode);

  const setDrillMode = useCallback((mode: DrillMode) => {
    setDrillModeState(mode);
    try {
      localStorage.setItem(DRILL_MODE_KEY, mode);
    } catch {
      // storage unavailable
    }
  }, []);


  const setPracticeStage = useCallback((stage: DrillStage) => {
    setPracticeStageState(stage);
    try {
      localStorage.setItem(PRACTICE_STAGE_KEY, String(stage));
    } catch {
      // storage unavailable
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // storage unavailable
    }
  }, [progress]);

  useEffect(() => {
    try {
      localStorage.setItem(STREAK_KEY, JSON.stringify(streakState));
    } catch {
      // storage unavailable
    }
  }, [streakState]);

  const getDrillProgress = useCallback(
    (drillId: string): DrillItemProgress => {
      return (
        progress[drillId] || {
          stage: 1,
          mastered: false,
          bestWpm: 0,
          errorCount: 0,
          lastReviewed: 0,
          streak: 0,
          attempts: 0,
        }
      );
    },
    [progress]
  );

  const recordCompletion = useCallback(
    (drillId: string, currentStage: DrillStage, wpm: number, errors: number) => {
      let isNewMastery = false;
      let nextStage: DrillStage = currentStage;

      setProgress((prev) => {
        const existing = prev[drillId] || {
          stage: 1,
          mastered: false,
          bestWpm: 0,
          errorCount: 0,
          lastReviewed: 0,
          streak: 0,
          attempts: 0,
        };

        const isZeroError = errors === 0;
        const newStreak = isZeroError ? existing.streak + 1 : 0;
        const newBestWpm = Math.max(existing.bestWpm, Math.round(wpm));

        // Scaffolding progression rule:
        // Zero errors in Stage 1 -> advance to Stage 2
        // Zero errors in Stage 2 -> advance to Stage 3
        // Zero errors in Stage 3 -> MASTERED!
        let newStage: DrillStage = existing.stage;
        let isMastered = existing.mastered;

        if (isZeroError) {
          if (currentStage === 1 && existing.stage === 1) {
            newStage = 2;
            nextStage = 2;
          } else if (currentStage === 2 && existing.stage <= 2) {
            newStage = 3;
            nextStage = 3;
          } else if (currentStage === 3) {
            if (!existing.mastered) {
              isNewMastery = true;
            }
            isMastered = true;
            newStage = 3;
            nextStage = 3;
          }
        } else {
          // Keep current target stage
          nextStage = existing.stage;
        }

        return {
          ...prev,
          [drillId]: {
            stage: newStage,
            mastered: isMastered,
            bestWpm: newBestWpm,
            errorCount: existing.errorCount + errors,
            lastReviewed: Date.now(),
            streak: newStreak,
            attempts: existing.attempts + 1,
          },
        };
      });

      // Update streaks
      setStreakState((prev) => {
        const newCurrent = errors === 0 ? prev.currentStreak + 1 : 0;
        const newBest = Math.max(prev.bestStreak, newCurrent);
        return { currentStreak: newCurrent, bestStreak: newBest };
      });

      return { isNewMastery, nextStage };
    },
    []
  );

  const setDrillStage = useCallback((drillId: string, stage: DrillStage) => {
    setProgress((prev) => {
      const existing = prev[drillId] || {
        stage: 1,
        mastered: false,
        bestWpm: 0,
        errorCount: 0,
        lastReviewed: 0,
        streak: 0,
        attempts: 0,
      };
      return {
        ...prev,
        [drillId]: {
          ...existing,
          stage,
        },
      };
    });
  }, []);

  const getDomainStats = useCallback(
    (domain: DomainCode) => {
      const deck = DRILL_DECKS.find((d) => d.id === domain);
      if (!deck) return { total: 0, mastered: 0, completed: 0, avgWpm: 0, percentMastered: 0 };

      const total = deck.items.length;
      let mastered = 0;
      let completed = 0;
      let totalWpm = 0;
      let wpmSamples = 0;

      for (const item of deck.items) {
        const p = progress[item.id];
        if (p) {
          if (p.attempts > 0) completed++;
          if (p.mastered) mastered++;
          if (p.bestWpm > 0) {
            totalWpm += p.bestWpm;
            wpmSamples++;
          }
        }
      }

      const avgWpm = wpmSamples > 0 ? Math.round(totalWpm / wpmSamples) : 0;
      const percentMastered = total > 0 ? Math.round((mastered / total) * 100) : 0;

      return {
        total,
        mastered,
        completed,
        avgWpm,
        percentMastered,
      };
    },
    [progress]
  );

  const globalStats = useMemo(() => {
    const allDrills = getAllDrills();
    const totalDrills = allDrills.length;
    let totalMastered = 0;
    let totalCompleted = 0;
    let totalWpm = 0;
    let wpmSamples = 0;
    let bestWpm = 0;

    for (const item of allDrills) {
      const p = progress[item.id];
      if (p) {
        if (p.attempts > 0) totalCompleted++;
        if (p.mastered) totalMastered++;
        if (p.bestWpm > 0) {
          totalWpm += p.bestWpm;
          wpmSamples++;
          if (p.bestWpm > bestWpm) bestWpm = p.bestWpm;
        }
      }
    }

    const avgWpm = wpmSamples > 0 ? Math.round(totalWpm / wpmSamples) : 0;
    const masteryPercent = totalDrills > 0 ? Math.round((totalMastered / totalDrills) * 100) : 0;

    return {
      totalDrills,
      totalMastered,
      totalCompleted,
      masteryPercent,
      avgWpm,
      bestWpm,
      currentStreak: streakState.currentStreak,
      bestStreak: streakState.bestStreak,
    };
  }, [progress, streakState]);

  const resetDomainProgress = useCallback((domain: DomainCode) => {
    const deck = DRILL_DECKS.find((d) => d.id === domain);
    if (!deck) return;
    const ids = new Set(deck.items.map((i) => i.id));
    setProgress((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        delete next[id];
      }
      return next;
    });
  }, []);

  const resetAllProgress = useCallback(() => {
    setProgress({});
    setStreakState({ currentStreak: 0, bestStreak: 0 });
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STREAK_KEY);
  }, []);

  return {
    progress,
    practiceStage,
    setPracticeStage,
    drillMode,
    setDrillMode,
    getDrillProgress,
    recordCompletion,
    setDrillStage,
    getDomainStats,
    globalStats,
    resetDomainProgress,
    resetAllProgress,
  };
}
