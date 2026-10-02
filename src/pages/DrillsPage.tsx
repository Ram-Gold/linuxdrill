import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DRILL_DECKS,
  type DomainCode,
  type DrillItem,
  getDeckByDomain,
} from '../data/drillDecks';
import { useDrillProgress, type DrillStage } from '../lib/useDrillProgress';
import { useDrillEngine } from '../lib/useDrillEngine';
import MinimalTyperCard from '../components/drills/MinimalTyperCard';
import MinimalStatsCard from '../components/drills/MinimalStatsCard';
import DrillSettingsModal from '../components/drills/DrillSettingsModal';

const LAST_DOMAIN_KEY = 'linuxdrill:last_domain';

export default function DrillsPage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  const { getDrillProgress, recordCompletion, setDrillStage } = useDrillProgress();

  const currentDeck = useMemo(() => {
    return getDeckByDomain(selectedDomain) || DRILL_DECKS[0];
  }, [selectedDomain]);

  const currentDrill: DrillItem = useMemo(() => {
    return currentDeck.items[currentIndex] || currentDeck.items[0];
  }, [currentDeck, currentIndex]);

  const drillProgress = useMemo(() => {
    return getDrillProgress(currentDrill.id);
  }, [getDrillProgress, currentDrill.id]);

  // Stage scaffolding state
  const [manualStage, setManualStage] = useState<DrillStage | null>(null);
  const effectiveStage = manualStage ?? drillProgress.stage;

  // Persist last selected domain
  useEffect(() => {
    try {
      localStorage.setItem(LAST_DOMAIN_KEY, selectedDomain);
    } catch {
      // ignore
    }
  }, [selectedDomain]);

  // Listen for Escape key to toggle the Settings modal when not in completion state
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isSettingsOpen) {
        if (lastResult) {
          // If result card is open, dismiss it
          setLastResult(null);
        } else {
          // Open settings modal
          setIsSettingsOpen(true);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, lastResult]);

  // Completion handler called by typing engine
  const handleDrillComplete = useCallback(
    (result: {
      wpm: number;
      accuracy: number;
      errors: number;
      elapsedSeconds: number;
    }) => {
      const { isNewMastery, nextStage } = recordCompletion(
        currentDrill.id,
        effectiveStage,
        result.wpm,
        result.errors
      );

      setLastResult({
        ...result,
        isNewMastery,
      });

      if (manualStage !== null) {
        setManualStage(nextStage);
      }
    },
    [recordCompletion, currentDrill.id, effectiveStage, manualStage]
  );

  // Hook into typing engine
  const {
    typed,
    target,
    isLocked,
    mistakeChar,
    liveWpm,
    accuracy,
    clozeTemplate,
    resetDrill,
  } = useDrillEngine({
    drill: currentDrill,
    stage: effectiveStage,
    isEnabled: !isSettingsOpen && !lastResult,
    onComplete: handleDrillComplete,
  });

  // Advance to next drill in deck
  const handleNextDrill = () => {
    setLastResult(null);
    if (currentIndex + 1 < currentDeck.items.length) {
      setCurrentIndex((prev) => prev + 1);
      setManualStage(null);
    } else {
      // Completed entire deck -> loop back or open settings
      setCurrentIndex(0);
      setIsSettingsOpen(true);
    }
  };

  // Repeat current drill
  const handleRetryDrill = () => {
    setLastResult(null);
    resetDrill();
  };

  // Change domain
  const handleSelectDomain = (domain: DomainCode) => {
    setSelectedDomain(domain);
    setCurrentIndex(0);
    setManualStage(null);
    setLastResult(null);
  };

  // Change stage
  const handleSelectStage = (s: DrillStage) => {
    setManualStage(s);
    setDrillStage(currentDrill.id, s);
    setLastResult(null);
    resetDrill();
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between">
      {/* ─── Full-Screen Minimal Typer ─── */}
      <MinimalTyperCard
        drill={currentDrill}
        stage={effectiveStage}
        currentIndex={currentIndex}
        totalInDeck={currentDeck.items.length}
        domainName={currentDeck.name}
        typed={typed}
        target={target}
        isLocked={isLocked}
        mistakeChar={mistakeChar}
        clozeTemplate={clozeTemplate}
        liveWpm={liveWpm}
        accuracy={accuracy}
        onReset={resetDrill}
        onOpenSettings={() => setIsSettingsOpen(true)}
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

      {/* ─── Minimal Deck & Stage Switcher Modal (SoundSettingsModal style) ─── */}
      <DrillSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedDomain={selectedDomain}
        onSelectDomain={handleSelectDomain}
        currentStage={effectiveStage}
        onSelectStage={handleSelectStage}
      />
    </div>
  );
}
