import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { type DrillItem, generateClozeMask } from '../data/drillDecks';
import { type DrillStage, type DrillMode } from './useDrillProgress';
import { playSuccessChime } from './sound';
import { getAllDrillVariants, evaluateDrillCommand } from './drillEquivalence';
import { ShellContext } from './vfs/commands';

export interface DrillEngineState {
  typed: string;
  isLocked: boolean;
  mistakes: string;
  mistakeChar: string | null;
  mistakeCount: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  isCompleted: boolean;
  startTime: number | null;
  endTime: number | null;
  liveWpm: number;
  accuracy: number;
  shakeKey: number;
  shellFeedback?: { message: string; isError: boolean } | null;
}

export interface UseDrillEngineProps {
  drill: DrillItem;
  stage: DrillStage;
  mode?: DrillMode;
  shellContext?: ShellContext;
  isEnabled?: boolean;
  onEnter?: () => void;
  onComplete?: (result: {
    wpm: number;
    accuracy: number;
    errors: number;
    elapsedSeconds: number;
  }) => void;
}

function deletePreviousWord(text: string): string {
  // If ends with spaces, remove spaces and the preceding word
  // e.g. "mkdir -p " -> "mkdir "
  // e.g. "mkdir -p" -> "mkdir "
  // e.g. "systemctl" -> ""
  const match = text.match(/^(.*?)(\s*\S+)\s*$/);
  return match ? match[1] : '';
}

export function useDrillEngine({
  drill,
  stage,
  mode = 'typer',
  shellContext,
  isEnabled = true,
  onEnter,
  onComplete,
}: UseDrillEngineProps) {
  // Compute all acceptable command variants for this drill
  const allVariants = useMemo(() => getAllDrillVariants(drill), [drill]);
  const [activeTarget, setActiveTarget] = useState(drill.command);

  const [typed, setTyped] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [liveWpm, setLiveWpm] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [shellFeedback, setShellFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  // References for low-latency event processing
  const stateRef = useRef({
    typed: '',
    mistakes: '',
    isLocked: false,
    target: drill.command,
    activeTarget: drill.command,
    allVariants,
    mistakeCount: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    isCompleted: false,
    startTime: null as number | null,
    endTime: null as number | null,
    mode,
    shellFeedback: null as { message: string; isError: boolean } | null,
  });

  // Keep ref synchronized
  useEffect(() => {
    stateRef.current.typed = typed;
    stateRef.current.mistakes = mistakes;
    stateRef.current.isLocked = isLocked;
    stateRef.current.target = drill.command;
    stateRef.current.activeTarget = activeTarget;
    stateRef.current.allVariants = allVariants;
    stateRef.current.mistakeCount = mistakeCount;
    stateRef.current.totalKeystrokes = totalKeystrokes;
    stateRef.current.correctKeystrokes = correctKeystrokes;
    stateRef.current.isCompleted = isCompleted;
    stateRef.current.startTime = startTime;
    stateRef.current.endTime = endTime;
    stateRef.current.mode = mode;
    stateRef.current.shellFeedback = shellFeedback;
  }, [
    typed,
    mistakes,
    isLocked,
    drill.command,
    activeTarget,
    allVariants,
    mistakeCount,
    totalKeystrokes,
    correctKeystrokes,
    isCompleted,
    startTime,
    endTime,
    mode,
    shellFeedback,
  ]);

  const currentDrillKey = `${drill.id}-${stage}-${mode}`;
  const [prevDrillKey, setPrevDrillKey] = useState(currentDrillKey);

  const resetDrill = useCallback(() => {
    setTyped('');
    setMistakes('');
    setIsLocked(false);
    setMistakeCount(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setIsCompleted(false);
    setStartTime(null);
    setEndTime(null);
    setLiveWpm(0);
    setShakeKey(0);
    setShellFeedback(null);
    setActiveTarget(drill.command);

    stateRef.current = {
      typed: '',
      mistakes: '',
      isLocked: false,
      target: drill.command,
      activeTarget: drill.command,
      allVariants,
      mistakeCount: 0,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      isCompleted: false,
      startTime: null,
      endTime: null,
      mode,
      shellFeedback: null,
    };
  }, [drill.command, allVariants, mode]);

  if (prevDrillKey !== currentDrillKey) {
    setPrevDrillKey(currentDrillKey);
    setTyped('');
    setMistakes('');
    setIsLocked(false);
    setMistakeCount(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setIsCompleted(false);
    setStartTime(null);
    setEndTime(null);
    setLiveWpm(0);
    setShakeKey(0);
    setShellFeedback(null);
    setActiveTarget(drill.command);
  }

  useEffect(() => {
    stateRef.current = {
      typed: '',
      mistakes: '',
      isLocked: false,
      target: drill.command,
      activeTarget: drill.command,
      allVariants,
      mistakeCount: 0,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      isCompleted: false,
      startTime: null,
      endTime: null,
      mode,
      shellFeedback: null,
    };
  }, [drill.id, stage, drill.command, allVariants, mode]);

  // Live WPM ticker while typing
  useEffect(() => {
    if (!startTime || isCompleted) return;

    const interval = setInterval(() => {
      const now = performance.now();
      const elapsedSeconds = (now - startTime) / 1000;
      if (elapsedSeconds > 0.4 && stateRef.current.typed.length > 0) {
        const words = stateRef.current.typed.length / 5;
        const minutes = elapsedSeconds / 60;
        const currentWpm = Math.round(words / minutes);
        setLiveWpm(currentWpm);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [startTime, isCompleted]);

  // Subtle acoustic error tick
  const playErrorTick = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // ignore safely
    }
  }, []);

  // Completion trigger helper
  const triggerCompletion = useCallback(
    (completedLength: number, customWpm?: number) => {
      const finishTime = performance.now();
      const nowStart = stateRef.current.startTime || finishTime - 1000;
      setEndTime(finishTime);
      setIsCompleted(true);
      stateRef.current.isCompleted = true;
      stateRef.current.endTime = finishTime;

      const elapsedSec = Math.max(0.4, (finishTime - nowStart) / 1000);
      const words = Math.max(1, completedLength / 5);
      const finalWpm = customWpm ?? Math.max(1, Math.round(words / (elapsedSec / 60)));
      const finalAcc =
        stateRef.current.totalKeystrokes > 0
          ? Math.round(
              (stateRef.current.correctKeystrokes / stateRef.current.totalKeystrokes) * 100
            )
          : 100;

      setLiveWpm(finalWpm);

      // Celebrate clean run
      if (stateRef.current.mistakeCount === 0) {
        playSuccessChime();
      }

      if (onComplete) {
        onComplete({
          wpm: finalWpm,
          accuracy: finalAcc,
          errors: stateRef.current.mistakeCount,
          elapsedSeconds: Math.round(elapsedSec * 10) / 10,
        });
      }
    },
    [onComplete]
  );

  // Primary sub-5ms keyboard event handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isEnabled || stateRef.current.isCompleted) return;

      // Handle Ctrl+R to restart drill
      if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        resetDrill();
        return;
      }

      // Handle Ctrl+U to clear whole line (POSIX readline / bash shortcut)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        setMistakes('');
        setTyped('');
        setIsLocked(false);
        setShellFeedback(null);
        stateRef.current.mistakes = '';
        stateRef.current.typed = '';
        stateRef.current.isLocked = false;
        stateRef.current.shellFeedback = null;
        return;
      }

      // Check if this is a word-delete or normal backspace:
      const isWordDelete =
        (e.key === 'Backspace' && (e.ctrlKey || e.altKey || e.metaKey)) ||
        (e.ctrlKey && (e.key === 'w' || e.key === 'W'));

      const isBackspace = e.key === 'Backspace' || (e.ctrlKey && (e.key === 'w' || e.key === 'W'));

      // Allow functional browser shortcuts through (Ctrl+C, Ctrl+V, F5, F12, etc.)
      if ((e.ctrlKey || e.altKey || e.metaKey) && !isBackspace) {
        return;
      }

      // Ignore navigation / modifier keys
      if (
        [
          'Shift',
          'Control',
          'Alt',
          'Meta',
          'CapsLock',
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
          'PageUp',
          'PageDown',
          'Home',
          'End',
          'Escape',
        ].includes(e.key)
      ) {
        return;
      }

      // Tab key restarts the drill
      if (e.key === 'Tab') {
        e.preventDefault();
        resetDrill();
        return;
      }

      // ──────────────────────────────────────────────────────────
      // SHELL MODE HANDLING (Freeform typing + Enter evaluation)
      // ──────────────────────────────────────────────────────────
      if (mode === 'shell') {
        // Handle Enter key in Shell mode: Run & Evaluate command
        if (e.key === 'Enter') {
          e.preventDefault();
          const currentInput = stateRef.current.typed;
          if (!currentInput.trim()) return;

          // Start timer if not running
          if (!stateRef.current.startTime) {
            const now = performance.now();
            setStartTime(now);
            stateRef.current.startTime = now;
          }

          // Evaluate command using semantic equivalence engine + VFS
          const evalResult = evaluateDrillCommand(drill, currentInput, shellContext);

          if (evalResult.passed) {
            setShellFeedback(null);
            triggerCompletion(currentInput.length);
          } else {
            playErrorTick();
            setShakeKey((k) => k + 1);
            setMistakeCount((c) => c + 1);
            stateRef.current.mistakeCount += 1;
            setShellFeedback({
              message: evalResult.message || 'Command did not satisfy requirements.',
              isError: true,
            });
          }
          return;
        }

        // Backspace in shell mode
        if (isBackspace) {
          e.preventDefault();
          setShellFeedback(null);
          if (isWordDelete) {
            setTyped((prev) => {
              const next = deletePreviousWord(prev);
              stateRef.current.typed = next;
              return next;
            });
          } else {
            setTyped((prev) => {
              const next = prev.slice(0, -1);
              stateRef.current.typed = next;
              return next;
            });
          }
          return;
        }

        // Printable characters in shell mode (freeform entry, no character-by-character blocking)
        if (e.key.length === 1) {
          e.preventDefault();
          setShellFeedback(null);

          // Start timer on first keypress
          if (!stateRef.current.startTime) {
            const now = performance.now();
            setStartTime(now);
            stateRef.current.startTime = now;
          }

          setTotalKeystrokes((k) => k + 1);
          setCorrectKeystrokes((k) => k + 1);
          stateRef.current.totalKeystrokes += 1;
          stateRef.current.correctKeystrokes += 1;

          setTyped((prev) => {
            const next = prev + e.key;
            stateRef.current.typed = next;
            return next;
          });
          return;
        }

        return;
      }

      // ──────────────────────────────────────────────────────────
      // ADAPTIVE TYPER MODE HANDLING (Multi-variant prefix matching)
      // ──────────────────────────────────────────────────────────

      // Enter key in Typer mode (e.g. Blitz Mode instant advance or early submit of completed variant)
      if (e.key === 'Enter') {
        const { typed: curTyped, allVariants: variants } = stateRef.current;
        // If current typed is already a valid variant in full, complete it!
        const matchingExact = variants.find((v) => v === curTyped);
        if (matchingExact) {
          e.preventDefault();
          triggerCompletion(curTyped.length);
          return;
        }
        if (onEnter) {
          e.preventDefault();
          onEnter();
          return;
        }
      }

      const { typed: curTyped, mistakes: curMistakes, allVariants: variants } = stateRef.current;

      // Handle Backspace or Word Delete:
      if (isBackspace) {
        e.preventDefault();

        if (isWordDelete) {
          if (curMistakes.length > 0) {
            // First clear mistakes in current word
            const nextMistakes = deletePreviousWord(curMistakes);
            setMistakes(nextMistakes);
            setIsLocked(nextMistakes.length > 0);
            stateRef.current.mistakes = nextMistakes;
            stateRef.current.isLocked = nextMistakes.length > 0;
          } else if (curTyped.length > 0) {
            // If no mistakes, delete previous word from typed text
            const nextTyped = deletePreviousWord(curTyped);
            setTyped(nextTyped);
            stateRef.current.typed = nextTyped;

            // Re-adapt active target based on remaining typed prefix
            const matching = variants.filter((v) => v.startsWith(nextTyped));
            if (matching.length > 0) {
              setActiveTarget(matching[0]);
              stateRef.current.activeTarget = matching[0];
            }
          }
          return;
        }

        // Single character backspace
        if (curMistakes.length > 0) {
          const nextMistakes = curMistakes.slice(0, -1);
          setMistakes(nextMistakes);
          setIsLocked(nextMistakes.length > 0);
          stateRef.current.mistakes = nextMistakes;
          stateRef.current.isLocked = nextMistakes.length > 0;
        } else if (curTyped.length > 0) {
          const nextTyped = curTyped.slice(0, -1);
          setTyped(nextTyped);
          stateRef.current.typed = nextTyped;

          // Re-adapt active target
          const matching = variants.filter((v) => v.startsWith(nextTyped));
          if (matching.length > 0) {
            setActiveTarget(matching[0]);
            stateRef.current.activeTarget = matching[0];
          }
        }
        return;
      }

      // Only handle printable characters (length === 1)
      if (e.key.length !== 1) {
        return;
      }

      e.preventDefault();

      // Start timer on first valid keypress
      let nowStart = stateRef.current.startTime;
      if (!nowStart) {
        nowStart = performance.now();
        setStartTime(nowStart);
        stateRef.current.startTime = nowStart;
      }

      const newTotalStrokes = stateRef.current.totalKeystrokes + 1;
      setTotalKeystrokes(newTotalStrokes);
      stateRef.current.totalKeystrokes = newTotalStrokes;

      // If user already has active mistakes, subsequent keystrokes go beside the previous ones
      if (curMistakes.length > 0) {
        const nextMistakes = curMistakes + e.key;
        const newMistakeCount = stateRef.current.mistakeCount + 1;
        setMistakes(nextMistakes);
        setIsLocked(true);
        setMistakeCount(newMistakeCount);
        setShakeKey((k) => k + 1);

        stateRef.current.mistakes = nextMistakes;
        stateRef.current.isLocked = true;
        stateRef.current.mistakeCount = newMistakeCount;
        playErrorTick();
        return;
      }

      // ADAPTIVE MULTI-VARIANT CHECK:
      // Does curTyped + e.key match a prefix of ANY accepted variant?
      const candidateString = curTyped + e.key;
      const matchingVariants = variants.filter((v) => v.startsWith(candidateString));

      if (matchingVariants.length > 0) {
        // Correct character typed for at least one accepted variant!
        const bestVariant = matchingVariants[0];
        setActiveTarget(bestVariant);
        stateRef.current.activeTarget = bestVariant;

        const newCorrectStrokes = stateRef.current.correctKeystrokes + 1;
        setCorrectKeystrokes(newCorrectStrokes);
        stateRef.current.correctKeystrokes = newCorrectStrokes;

        setTyped(candidateString);
        stateRef.current.typed = candidateString;

        // Check if any accepted variant is completely typed!
        const completedMatch = matchingVariants.find((v) => v === candidateString);
        if (completedMatch) {
          triggerCompletion(completedMatch.length);
        }
      } else {
        // First mistake detected (no valid variant matches this prefix)
        const nextMistakes = e.key;
        const newMistakeCount = stateRef.current.mistakeCount + 1;
        setMistakes(nextMistakes);
        setIsLocked(true);
        setMistakeCount(newMistakeCount);
        setShakeKey((k) => k + 1);

        stateRef.current.mistakes = nextMistakes;
        stateRef.current.isLocked = true;
        stateRef.current.mistakeCount = newMistakeCount;
        playErrorTick();
      }
    },
    [isEnabled, mode, drill, shellContext, resetDrill, playErrorTick, onEnter, triggerCompletion]
  );

  // Bind keydown listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const accuracy =
    totalKeystrokes > 0
      ? Math.round((correctKeystrokes / totalKeystrokes) * 100)
      : 100;

  // Mask string computation for Stage 2 (Cloze) based on active target
  const clozeTemplate = drill.clozeMask || generateClozeMask(activeTarget);

  return {
    typed,
    target: activeTarget,
    isLocked,
    mistakes,
    mistakeChar: mistakes.length > 0 ? mistakes : null,
    mistakeCount,
    totalKeystrokes,
    correctKeystrokes,
    isCompleted,
    startTime,
    endTime,
    liveWpm,
    accuracy,
    shakeKey,
    clozeTemplate,
    shellFeedback,
    allVariants,
    resetDrill,
  };
}
