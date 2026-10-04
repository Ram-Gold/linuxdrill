import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DRILL_DECKS,
  type DomainCode,
  type DrillItem,
  getDeckByDomain,
} from '../data/drillDecks';
import { useDrillProgress, type DrillStage } from '../lib/useDrillProgress';
import { useDrillEngine } from '../lib/useDrillEngine';
import { ShellContext } from '../lib/vfs/commands';
import MinimalTyperCard from '../components/drills/MinimalTyperCard';
import MinimalStatsCard from '../components/drills/MinimalStatsCard';
import DrillSettingsModal from '../components/drills/DrillSettingsModal';
import CompetencyDecksModal from '../components/drills/CompetencyDecksModal';

const LAST_DOMAIN_KEY = 'linuxdrill:last_domain';
const BLITZ_MODE_KEY = 'linuxdrill:blitz_mode_v1';

export default function DrillsPage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDecksOpen, setIsDecksOpen] = useState(false);

  // Blitz mode toggle state (persistent across drills, decks, reloads, and sessions)
  const [isBlitzMode, setIsBlitzMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BLITZ_MODE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleBlitzMode = useCallback((enabled: boolean) => {
    setIsBlitzMode(enabled);
    try {
      localStorage.setItem(BLITZ_MODE_KEY, String(enabled));
    } catch {
      // ignore
    }
  }, []);

  // Deck & drill selection
  const [selectedDomain, setSelectedDomain] = useState<DomainCode>(() => {
    try {
      const saved = localStorage.getItem(LAST_DOMAIN_KEY);
      if (saved && DRILL_DECKS.some((d) => d.id === saved)) {
        return saved as DomainCode;
      }
    } catch {
      // fallback
    }
    return 'BASIC';
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastResult, setLastResult] = useState<{
    wpm: number;
    accuracy: number;
    errors: number;
    elapsedSeconds: number;
    isNewMastery: boolean;
  } | null>(null);

  const {
    getDrillProgress,
    recordCompletion,
    setDrillStage,
    practiceStage,
    setPracticeStage,
    drillMode,
    setDrillMode,
  } = useDrillProgress();

  const [resetKey, setResetKey] = useState(0);

  const currentDeck = useMemo(() => {
    return getDeckByDomain(selectedDomain) || DRILL_DECKS[0];
  }, [selectedDomain]);

  const currentDrill: DrillItem = useMemo(() => {
    return currentDeck.items[currentIndex] || currentDeck.items[0];
  }, [currentDeck, currentIndex]);

  // Fresh isolated shell instance for semantic execution in Shell mode
  const shellContext = useMemo(() => {
    if (!currentDrill.id || !selectedDomain || resetKey < 0) return new ShellContext();
    return new ShellContext();
  }, [currentDrill.id, selectedDomain, resetKey]);

  const drillProgress = useMemo(() => {
    return getDrillProgress(currentDrill.id);
  }, [getDrillProgress, currentDrill.id]);

  // Persistent practice stage across all drills, decks, and sessions
  const effectiveStage = practiceStage;

  // Persist last selected domain
  useEffect(() => {
    try {
      localStorage.setItem(LAST_DOMAIN_KEY, selectedDomain);
    } catch {
      // ignore
    }
  }, [selectedDomain]);

  // Listen for Escape key to dismiss the result card
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isSettingsOpen && !isDecksOpen && lastResult) {
        setLastResult(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, isDecksOpen, lastResult]);

  const resetDrillRef = useRef<() => void>(() => {});
  const isAdvancingRef = useRef(false);

  // Advance to next drill in deck
  const handleNextDrill = useCallback(() => {
    setLastResult(null);
    setResetKey((k) => k + 1);
    resetDrillRef.current?.();
    if (currentIndex + 1 < currentDeck.items.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed entire deck -> loop back
      setCurrentIndex(0);
      if (!isBlitzMode) {
        setIsSettingsOpen(true);
      }
    }
  }, [currentIndex, currentDeck.items.length, isBlitzMode]);

  // Immediate advancement in Blitz Mode (debounced to avoid accidental double-skips)
  const advanceImmediately = useCallback(() => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;
    handleNextDrill();
    setTimeout(() => {
      isAdvancingRef.current = false;
    }, 100);
  }, [handleNextDrill]);

  // Completion handler called by typing engine
  const handleDrillComplete = useCallback(
    (result: {
      wpm: number;
      accuracy: number;
      errors: number;
      elapsedSeconds: number;
    }) => {
      const { isNewMastery } = recordCompletion(
        currentDrill.id,
        effectiveStage,
        result.wpm,
        result.errors
      );

      if (isBlitzMode) {
        // In Blitz mode, advance immediately to next drill without showing stats dialog
        setTimeout(() => {
          advanceImmediately();
        }, 75);
      } else {
        setLastResult({
          ...result,
          isNewMastery,
        });
      }
    },
    [recordCompletion, currentDrill.id, effectiveStage, isBlitzMode, advanceImmediately]
  );

  // Hook into drill engine (supports both adaptive typer and freeform shell)
  const {
    typed,
    target,
    isLocked,
    mistakes,
    mistakeChar,
    liveWpm,
    accuracy,
    clozeTemplate,
    shellFeedback,
    resetDrill,
  } = useDrillEngine({
    drill: currentDrill,
    stage: effectiveStage,
    mode: drillMode,
    shellContext,
    isEnabled: !isSettingsOpen && !isDecksOpen && !lastResult,
    onEnter: isBlitzMode ? advanceImmediately : undefined,
    onComplete: handleDrillComplete,
  });

  useEffect(() => {
    resetDrillRef.current = resetDrill;
  }, [resetDrill]);

  // Repeat current drill
  const handleRetryDrill = () => {
    setLastResult(null);
    setResetKey((k) => k + 1);
    resetDrill();
  };

  // Toggle execution mode
  const handleToggleMode = useCallback(() => {
    setDrillMode(drillMode === 'typer' ? 'shell' : 'typer');
    setLastResult(null);
  }, [drillMode, setDrillMode]);

  // Change domain
  const handleSelectDomain = (domain: DomainCode) => {
    setSelectedDomain(domain);
    setCurrentIndex(0);
    setLastResult(null);
    setResetKey((k) => k + 1);
  };

  // Change stage globally and persist
  const handleSelectStage = (s: DrillStage) => {
    setPracticeStage(s);
    setDrillStage(currentDrill.id, s);
    setLastResult(null);
    resetDrill();
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between">
      {/* ─── Full-Screen Minimal Typer / Shell Card ─── */}
      <MinimalTyperCard
        drill={currentDrill}
        stage={effectiveStage}
        mode={drillMode}
        currentIndex={currentIndex}
        totalInDeck={currentDeck.items.length}
        domainName={currentDeck.name}
        typed={typed}
        target={target}
        isLocked={isLocked}
        mistakes={mistakes}
        mistakeChar={mistakeChar}
        clozeTemplate={clozeTemplate}
        liveWpm={liveWpm}
        accuracy={accuracy}
        isBlitzMode={isBlitzMode}
        shellFeedback={shellFeedback}
        onToggleMode={handleToggleMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDecks={() => setIsDecksOpen(true)}
      />

      {/* ─── Completion Stats Modal (SoundSettingsModal style) ─── */}
      <AnimatePresence>
        {lastResult && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setLastResult(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <MinimalStatsCard
              drill={currentDrill}
              stage={effectiveStage}
              wpm={lastResult.wpm}
              accuracy={lastResult.accuracy}
              errors={lastResult.errors}
              elapsedSeconds={lastResult.elapsedSeconds}
              bestWpm={drillProgress.bestWpm}
              isNewMastery={lastResult.isNewMastery}
              isDeckFinished={currentIndex + 1 >= currentDeck.items.length}
              onNext={handleNextDrill}
              onRetry={handleRetryDrill}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ─── Minimal Deck, Stage & Mode Switcher Modal (SoundSettingsModal style) ─── */}
      <DrillSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentStage={effectiveStage}
        onSelectStage={handleSelectStage}
        drillMode={drillMode}
        onSelectDrillMode={setDrillMode}
        isBlitzMode={isBlitzMode}
        onToggleBlitzMode={handleToggleBlitzMode}
      />

      {/* ─── Competency Decks Modal ─── */}
      <CompetencyDecksModal
        isOpen={isDecksOpen}
        onClose={() => setIsDecksOpen(false)}
        selectedDomain={selectedDomain}
        onSelectDomain={handleSelectDomain}
      />
    </div>
  );
}
