import { useState, useEffect, useRef, useCallback } from 'react';
import { type DrillItem, generateClozeMask } from '../data/drillDecks';
import { type DrillStage } from './useDrillProgress';
import { playSuccessChime } from './sound';

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
}

export interface UseDrillEngineProps {
  drill: DrillItem;
  stage: DrillStage;
  isEnabled?: boolean;
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
  isEnabled = true,
  onComplete,
}: UseDrillEngineProps) {
  const targetCommand = drill.command;

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

  // References for low-latency event processing
  const stateRef = useRef({
    typed: '',
    mistakes: '',
    isLocked: false,
    target: targetCommand,
    mistakeCount: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    isCompleted: false,
    startTime: null as number | null,
    endTime: null as number | null,
  });

  // Keep ref synchronized
  useEffect(() => {
    stateRef.current.typed = typed;
    stateRef.current.mistakes = mistakes;
    stateRef.current.isLocked = isLocked;
    stateRef.current.target = targetCommand;
    stateRef.current.mistakeCount = mistakeCount;
    stateRef.current.totalKeystrokes = totalKeystrokes;
    stateRef.current.correctKeystrokes = correctKeystrokes;
    stateRef.current.isCompleted = isCompleted;
    stateRef.current.startTime = startTime;
    stateRef.current.endTime = endTime;
  }, [
    typed,
    mistakes,
    isLocked,
    targetCommand,
    mistakeCount,
    totalKeystrokes,
    correctKeystrokes,
    isCompleted,
    startTime,
    endTime,
  ]);

  const currentDrillKey = `${drill.id}-${stage}`;
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

    stateRef.current = {
      typed: '',
      mistakes: '',
      isLocked: false,
      target: targetCommand,
      mistakeCount: 0,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      isCompleted: false,
      startTime: null,
      endTime: null,
    };
  }, [targetCommand]);

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
  }

  useEffect(() => {
    stateRef.current = {
      typed: '',
      mistakes: '',
      isLocked: false,
      target: targetCommand,
      mistakeCount: 0,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      isCompleted: false,
      startTime: null,
      endTime: null,
    };
  }, [drill.id, stage, targetCommand]);

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
        stateRef.current.mistakes = '';
        stateRef.current.typed = '';
        stateRef.current.isLocked = false;
        return;
      }

      // Check if this is a word-delete or normal backspace:
      // Ctrl+Backspace, Alt+Backspace, Cmd+Backspace, or Ctrl+W (POSIX word rubout)
      const isWordDelete =
        (e.key === 'Backspace' && (e.ctrlKey || e.altKey || e.metaKey)) ||
        (e.ctrlKey && (e.key === 'w' || e.key === 'W'));

      const isBackspace = e.key === 'Backspace' || (e.ctrlKey && (e.key === 'w' || e.key === 'W'));

      // Allow other functional browser shortcuts through (Ctrl+C, Ctrl+V, F5, F12, etc.)
      if ((e.ctrlKey || e.altKey || e.metaKey) && !isBackspace) {
        return;
      }

      // Ignore navigation / modifier keys that shouldn't impact typing buffer
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

      const { typed: curTyped, mistakes: curMistakes, target } = stateRef.current;

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

      // No active mistakes - check if typed key matches expected character
      const expectedChar = target[curTyped.length];

      if (e.key === expectedChar) {
        // Correct character typed
        const newCorrectStrokes = stateRef.current.correctKeystrokes + 1;
        setCorrectKeystrokes(newCorrectStrokes);
        stateRef.current.correctKeystrokes = newCorrectStrokes;

        const nextTyped = curTyped + e.key;
        setTyped(nextTyped);
        stateRef.current.typed = nextTyped;

        // Check if full target command completed!
        if (nextTyped.length === target.length) {
          const finishTime = performance.now();
          setEndTime(finishTime);
          setIsCompleted(true);
          stateRef.current.isCompleted = true;
          stateRef.current.endTime = finishTime;

          const elapsedSec = (finishTime - nowStart) / 1000;
          const words = target.length / 5;
          const finalWpm = Math.max(1, Math.round(words / (elapsedSec / 60)));
          const finalAcc = Math.round((newCorrectStrokes / newTotalStrokes) * 100);

          setLiveWpm(finalWpm);

          // Celebrate zero-mistake run!
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
        }
      } else {
        // First mistake detected
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
    [isEnabled, resetDrill, playErrorTick, onComplete]
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

  // Mask string computation for Stage 2 (Cloze)
  const clozeTemplate = drill.clozeMask || generateClozeMask(targetCommand);

  return {
    typed,
    target: targetCommand,
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
    resetDrill,
  };
}
