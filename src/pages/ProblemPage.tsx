import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useBlocker } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { clsx } from "clsx";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckSquare,
  ChevronRight,
  Copy,
  FileCode,
  FileText,
  HelpCircle,
  Lightbulb,
  PanelLeftOpen,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import { problems } from "../lib/problems";
import { useProgress } from "../lib/useProgress";
import { fireGrandCelebration } from "../lib/confetti";
import { playSuccessChime } from "../lib/sound";
import { verifyProblem, type VerificationResult } from "../lib/verifyProblem";
import { completeDailyReviewDrill, recordDailyStreakActivity } from "../lib/useDailyReview";
import type { ShellContext } from "../lib/vfs/commands";
import Markdown from "../components/Markdown";
import Terminal, { type TerminalHandle } from "../components/Terminal";
import SuccessConfirmation from "../components/SuccessConfirmation";
import HintAccordion from "../components/HintAccordion";
import ExitConfirmationModal from "../components/ExitConfirmationModal";


export default function ProblemPage() {
  const { id } = useParams();
  const problem = problems.find((p) => p.id === id);
  const { solved, markSolved, unmarkSolved } = useProgress();
  const isSolved = problem ? solved.includes(problem.id) : false;

  // Navigation blocker: alert user when navigating away from an unfinished task
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !isSolved && currentLocation.pathname !== nextLocation.pathname
  );

  // Tab close / reload protection for active scenario
  useEffect(() => {
    if (isSolved) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSolved]);

  const [showSolution, setShowSolution] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [mobileTab, setMobileTab] = useState<"spec" | "term">("spec");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastChecks, setLastChecks] = useState<{ name: string; passed: boolean }[]>([]);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    passed: boolean;
    message: string;
    hint?: string;
  } | null>(null);
  const [copiedTerminal, setCopiedTerminal] = useState(false);

  // Resizable split ratio (percentage for left specification pane)
  const [splitRatio, setSplitRatio] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("linuxdrill_split_ratio");
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val >= 0 && val <= 80) return val;
      }
    } catch {
      // ignore
    }
    return 42;
  });
  const [lastRatio, setLastRatio] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("linuxdrill_split_ratio");
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val >= 20 && val <= 80) return val;
      }
    } catch {
      // ignore
    }
    return 42;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );

  const terminalRef = useRef<TerminalHandle>(null);
  const workstationRef = useRef<HTMLDivElement>(null);
  const specScrollRef = useRef<HTMLDivElement>(null);
  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setShowSolution(false);
    setShowVerify(false);
    setShowConfirmation(false);
    setVerificationFeedback(null);
    setLastChecks([]);
    setCopiedTerminal(false);
    setMobileTab("spec");
  }

  // Scroll spec pane back to top when navigating to another problem
  useEffect(() => {
    specScrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const SNAP_THRESHOLD = 14; // Percentage threshold below which pane snaps to left (fullscreen terminal)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!workstationRef.current) return;
      const rect = workstationRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const currentX = moveEvent.clientX - rect.left;
      const percentage = (currentX / rect.width) * 100;

      if (percentage < SNAP_THRESHOLD) {
        setSplitRatio(0);
      } else {
        const clamped = Math.min(75, Math.max(20, percentage));
        setSplitRatio(clamped);
        setLastRatio(clamped);
      }
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      if (workstationRef.current) {
        const rect = workstationRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          const currentX = upEvent.clientX - rect.left;
          const percentage = (currentX / rect.width) * 100;
          if (percentage < SNAP_THRESHOLD) {
            setSplitRatio(0);
            try {
              localStorage.setItem("linuxdrill_split_ratio", "0");
            } catch {
              // ignore
            }
          } else {
            const clamped = Math.min(75, Math.max(20, percentage));
            setSplitRatio(clamped);
            setLastRatio(clamped);
            try {
              localStorage.setItem("linuxdrill_split_ratio", clamped.toFixed(1));
            } catch {
              // ignore
            }
          }
        }
      }
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const handleRevert = () => {
    const target = lastRatio >= 20 ? lastRatio : 42;
    setSplitRatio(target);
    try {
      localStorage.setItem("linuxdrill_split_ratio", target.toFixed(1));
    } catch {
      // ignore
    }
  };

  const handleResetRatio = () => {
    if (splitRatio === 0) {
      handleRevert();
    } else {
      setSplitRatio(42);
      setLastRatio(42);
      try {
        localStorage.setItem("linuxdrill_split_ratio", "42");
      } catch {
        // ignore
      }
    }
  };

  const handleCopyTerminal = () => {
    terminalRef.current?.copyOutput();
    setCopiedTerminal(true);
    setTimeout(() => setCopiedTerminal(false), 1500);
  };

  const handleResetTerminal = () => {
    terminalRef.current?.resetVm();
  };

  const handleCheckAnswer = useCallback(
    (customShell?: ShellContext) => {
      const shell = customShell || terminalRef.current?.getShell();
      if (!shell || !problem) return;

      const result: VerificationResult = verifyProblem(problem, shell);
      setLastChecks(result.checks);
      setVerificationFeedback({
        passed: result.passed,
        message: result.message,
        hint: result.missingHint,
      });

      if (result.passed) {
        markSolved(problem.id);
        completeDailyReviewDrill(problem.id);
        recordDailyStreakActivity();
        fireGrandCelebration();
        playSuccessChime();
        setShowConfirmation(true);
        terminalRef.current?.appendOutput(
          `\n============================================================\n` +
            `[PASS] VERIFICATION PASSED: That's the right answer!\n` +
            `[PASS] Challenge ${problem.id} marked as SOLVED (+${problem.points} pts)\n` +
            `============================================================\n`
        );
      } else {
        terminalRef.current?.appendOutput(
          `\n------------------------------------------------------------\n` +
            `[!] Verification check incomplete: ${result.message}\n` +
            (result.missingHint ? `    Tip: ${result.missingHint}\n` : "") +
            `------------------------------------------------------------\n`
        );
      }
    },
    [problem, markSolved]
  );

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleCheckAnswer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCheckAnswer]);

  if (!problem) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <p className="text-sm text-[var(--text-muted)] mb-4">Scenario '{id}' not found.</p>
        <Link
          to="/"
          className="text-sm text-[var(--accent-primary)] hover:opacity-80 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to challenges</span>
        </Link>
      </div>
    );
  }

  const idx = problems.findIndex((p) => p.id === id);
  const prevProblem = idx > 0 ? problems[idx - 1] : null;
  const nextProblem = idx >= 0 && idx + 1 < problems.length ? problems[idx + 1] : null;
  const totalEarned = problems
    .filter((p) => solved.includes(p.id) || (isSolved && p.id === problem.id))
    .reduce((sum, p) => sum + p.points, 0);

  const handleToggleSolved = () => {
    if (isSolved) {
      unmarkSolved(problem.id);
      setVerificationFeedback(null);
    } else {
      markSolved(problem.id);
      completeDailyReviewDrill(problem.id);
      recordDailyStreakActivity();
      fireGrandCelebration();
      playSuccessChime();
      setLastChecks([{ name: `Challenge ${problem.id} task requirements completed`, passed: true }]);
      setVerificationFeedback({ passed: true, message: "Problem confirmed and marked as solved!" });
      setShowConfirmation(true);
      terminalRef.current?.appendOutput(
        `\n[PASS] Challenge ${problem.id} confirmed and marked as solved (+${problem.points} pts)!\n`
      );
    }
  };

  const verifyPass = verificationFeedback ? verificationFeedback.passed : isSolved;

  return (
    <div className="flex flex-col gap-3 select-none w-full">
      {/* ── Toolbar ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        {/* Left: Back button only (cleaned up redundancy) */}
        <div className="flex items-center min-w-0">
          <Link
            to="/"
            className="h-8 px-3 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] transition-colors inline-flex items-center gap-1.5 mimo-press"
            title="Back to challenges"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Link>
        </div>

        {/* Right: Actions (all uniform h-8 buttons with same sizes) */}
        <div className="flex items-center gap-2 flex-wrap">
          {isSolved && (
            <span className="h-8 px-2.5 rounded-xl bg-[var(--accent-green-bg)] text-[var(--accent-green)] text-xs font-medium inline-flex items-center gap-1.5 shadow-xs">
              <Check className="w-3.5 h-3.5" />
              <span>+{problem.points} pts</span>
            </span>
          )}

          {/* Prev / Next Pagination */}
          <div className="flex items-center gap-1">
            {prevProblem ? (
              <Link
                to={`/p/${prevProblem.id}`}
                className="h-8 w-8 rounded-xl text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] transition-colors inline-flex items-center justify-center mimo-press"
                title={`Previous: ${prevProblem.title}`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span className="h-8 w-8 rounded-xl text-xs text-[var(--text-tertiary)] bg-[var(--surface-subtle)]/40 inline-flex items-center justify-center opacity-40 cursor-not-allowed">
                <ArrowLeft className="w-3.5 h-3.5" />
              </span>
            )}
            {nextProblem ? (
              <Link
                to={`/p/${nextProblem.id}`}
                className="h-8 w-8 rounded-xl text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] transition-colors inline-flex items-center justify-center mimo-press"
                title={`Next: ${nextProblem.title}`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span className="h-8 w-8 rounded-xl text-xs text-[var(--text-tertiary)] bg-[var(--surface-subtle)]/40 inline-flex items-center justify-center opacity-40 cursor-not-allowed">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* Copy Terminal Output */}
          <button
            onClick={handleCopyTerminal}
            className="h-8 px-3 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] transition-colors inline-flex items-center gap-1.5 cursor-pointer mimo-press"
            title="Copy terminal output"
          >
            {copiedTerminal ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--accent-green)]" />
                <span className="text-[var(--accent-green)]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          {/* Reset VM */}
          <button
            onClick={handleResetTerminal}
            className="h-8 px-3 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] transition-colors inline-flex items-center gap-1.5 cursor-pointer mimo-press"
            title="Reset terminal VM state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset VM</span>
          </button>

          {/* Mark / Unmark Solved */}
          <button
            id="mark-solved-btn"
            onClick={handleToggleSolved}
            className={clsx(
              "h-8 px-3 rounded-xl text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer mimo-press",
              isSolved
                ? "bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] text-[var(--accent-green)]"
                : "bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
            )}
            title={isSolved ? "Mark challenge as unsolved" : "Mark challenge as solved"}
          >
            <Check className={clsx("w-3.5 h-3.5", isSolved ? "text-[var(--accent-green)]" : "opacity-50")} />
            <span>{isSolved ? "Solved" : "Mark Solved"}</span>
          </button>

          {/* Check Answer (strictly h-8 matching all other buttons) */}
          <button
            id="check-answer-btn"
            onClick={() => handleCheckAnswer()}
            className="h-8 px-3.5 rounded-xl text-xs font-semibold bg-[var(--text-main)] text-[var(--surface-base)] inline-flex items-center justify-center gap-2 cursor-pointer transition-all hover:opacity-95 active:scale-[0.98] shadow-xs mimo-press"
            title="Check your solution (Ctrl+Enter)"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Check Answer</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-normal rounded bg-[var(--surface-base)]/15 text-[var(--surface-base)]">
              Ctrl ↵
            </kbd>
          </button>
        </div>
      </div>

      {/* ── Mobile tabs ───────────────────────────────────── */}
      <div className="flex lg:hidden items-center gap-1 rounded-2xl p-1 text-xs bg-[var(--surface-base)] shadow-sm">
        {(["spec", "term"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={clsx(
              "flex-1 py-1.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer mimo-press text-xs font-medium",
              mobileTab === tab
                ? "bg-[var(--accent-primary)] text-white shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            )}
          >
            {tab === "spec" ? "Specification" : "Terminal"}
          </button>
        ))}
      </div>

      {/* ── Split workstation ─────────────────────────────── */}
      <div
        ref={workstationRef}
        className="h-[calc(100vh-140px)] min-h-[640px] max-h-[960px] rounded-2xl overflow-hidden flex flex-col transition-colors shadow-[var(--card-shadow)] relative"
        style={{ backgroundColor: "var(--surface-base)" }}
      >
        {/* Floating restore button when left pane is snapped full screen */}
        {splitRatio === 0 && isDesktop && (
          <button
            onClick={handleRevert}
            className="absolute top-2 left-2 z-30 h-7 px-2.5 rounded-lg text-xs font-medium text-[var(--text-main)] bg-[var(--surface-base)] hover:bg-[var(--surface-active)] shadow-md inline-flex items-center gap-1.5 transition-all mimo-press cursor-pointer border border-[var(--surface-subtle)]"
            title="Restore specification pane"
          >
            <PanelLeftOpen className="w-3.5 h-3.5 text-[var(--accent-primary-soft)]" />
            <span>Show Specification</span>
          </button>
        )}

        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">
          {/* ── Left: Spec pane ──────────────────────────────── */}
          <div
            className={clsx(
              "flex flex-col h-full min-h-0 overflow-hidden",
              mobileTab === "term" ? "hidden lg:flex" : "flex",
              isDragging
                ? "transition-none select-none pointer-events-none"
                : "transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
            )}
            style={{
              backgroundColor: "var(--bg-canvas)",
              width: isDesktop ? `${splitRatio}%` : "100%",
              opacity: isDesktop && splitRatio === 0 ? 0 : 1,
              pointerEvents: isDesktop && splitRatio === 0 ? "none" : undefined,
            }}
          >
            <div className="w-full min-w-[320px] flex flex-col h-full min-h-0">
              {/* Pane toolbar */}
              <div className="h-10 px-4 flex items-center justify-between shrink-0 shadow-xs" style={{ backgroundColor: 'var(--surface-base)' }}>
                <span className="text-xs text-[var(--text-muted)] font-medium">Specification</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className={clsx(
                      "px-3 py-1 text-xs rounded-xl transition-colors cursor-pointer mimo-press",
                      showSolution
                        ? "text-[var(--accent-green)] bg-[var(--accent-green-bg)] font-medium"
                        : "text-[var(--text-muted)] bg-[var(--surface-subtle)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)]"
                    )}
                  >
                    Solution
                  </button>
                  <button
                    onClick={() => setShowVerify(!showVerify)}
                    className={clsx(
                      "px-3 py-1 text-xs rounded-xl transition-colors cursor-pointer mimo-press",
                      showVerify
                        ? "text-[var(--accent-primary-soft)] bg-[var(--accent-primary-bg)] font-medium"
                        : "text-[var(--text-muted)] bg-[var(--surface-subtle)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)]"
                    )}
                  >
                    Verify Guide
                  </button>
                </div>
              </div>

              {/* Pane body */}
              <div ref={specScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 select-text">
                {/* Title */}
                <div className="pb-1">
                  <h2 className="text-base sm:text-[17px] font-semibold text-[var(--text-main)] mb-1">{problem.title}</h2>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{problem.description}</p>
                </div>

                {/* Task */}
                <div className="rounded-2xl p-4 space-y-2 shadow-xs" style={{ backgroundColor: 'var(--surface-base)' }}>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--accent-primary)] font-medium mb-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Task</span>
                  </div>
                  <div className="text-sm text-[var(--text-main)] leading-relaxed">
                    <Markdown>{problem.task}</Markdown>
                  </div>
                </div>

                {/* Setup */}
                {problem.setup && (
                  <div className="rounded-2xl p-4 space-y-2 shadow-xs" style={{ backgroundColor: 'var(--surface-base)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--accent-amber)] font-medium">
                        <Play className="w-3.5 h-3.5" />
                        <span>Setup</span>
                      </span>
                      <button
                        onClick={() => terminalRef.current?.runSetup()}
                        className="text-[11px] text-[var(--accent-amber)] bg-[var(--accent-amber-bg)] rounded-lg px-2.5 py-1 hover:opacity-80 transition-colors cursor-pointer mimo-press font-medium"
                      >
                        Run
                      </button>
                    </div>
                    <div className="text-sm text-[var(--text-main)] leading-relaxed">
                      <Markdown>{problem.setup}</Markdown>
                    </div>
                  </div>
                )}

                {/* Verification result */}
                <AnimatePresence>
                  {(isSolved || verificationFeedback) && (
                    <motion.div
                      key="verification"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="rounded-2xl p-4 space-y-2 shadow-xs"
                      style={{ backgroundColor: 'var(--surface-base)' }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={clsx(
                            "flex items-center gap-1.5 text-xs font-medium",
                            verifyPass ? "text-[var(--accent-green)]" : "text-[var(--accent-amber)]"
                          )}
                        >
                          {verifyPass ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          <span>{verifyPass ? "Passed" : "Incomplete"}</span>
                        </span>
                        {verifyPass && (
                          <span className="text-xs text-[var(--accent-green)]">+{problem.points} pts</span>
                        )}
                      </div>

                      <ul className="space-y-1 font-mono">
                        {lastChecks.length > 0 ? (
                          lastChecks.map((chk, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs">
                              <span className={chk.passed ? "text-[var(--accent-green)]" : "text-[var(--accent-amber)]"}>
                                {chk.passed ? "✓" : "✗"}
                              </span>
                              <span className={chk.passed ? "text-[var(--text-main)]" : "text-[var(--text-muted)]"}>
                                {chk.name}
                              </span>
                            </li>
                          ))
                        ) : isSolved ? (
                          <li className="flex items-start gap-2 text-xs">
                            <span className="text-[var(--accent-green)]">✓</span>
                            <span className="text-[var(--text-main)]">All objectives verified.</span>
                          </li>
                        ) : null}
                      </ul>

                      {verificationFeedback?.hint && (
                        <div className="flex items-start gap-1.5 text-xs text-[var(--accent-amber)] bg-[var(--surface-subtle)] p-2.5 rounded-xl mt-2">
                          <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{verificationFeedback.hint}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Solution */}
                <AnimatePresence>
                  {showSolution && (
                    <motion.div
                      key="solution"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="rounded-2xl p-4 space-y-2 shadow-xs"
                      style={{ backgroundColor: 'var(--surface-base)' }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-1.5 text-xs text-[var(--accent-green)] font-medium">
                          <FileCode className="w-3.5 h-3.5" />
                          <span>Solution</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              const clean = problem.solution.replace(/```[a-z]*\n?/g, "").replace(/```/g, "").trim();
                              navigator.clipboard.writeText(clean);
                            }}
                            className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] px-2.5 py-1 rounded-lg transition-colors cursor-pointer mimo-press font-medium"
                          >
                            copy
                          </button>
                          <button
                            onClick={() => setShowSolution(false)}
                            className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] p-1 rounded-lg transition-colors cursor-pointer mimo-press inline-flex items-center justify-center"
                            title="Close solution"
                            aria-label="Close solution"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-[var(--text-main)]">
                        <Markdown>{problem.solution}</Markdown>
                      </div>
                      {problem.watchOut && (
                        <div className="bg-[var(--surface-subtle)] p-3 rounded-xl text-sm text-[var(--accent-amber)] mt-2">
                          <span className="text-[11px] uppercase tracking-wider block mb-1 font-medium">Watch out</span>
                          <Markdown>{problem.watchOut}</Markdown>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Verify Guide */}
                <AnimatePresence>
                  {showVerify && (
                    <motion.div
                      key="verify"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="rounded-2xl p-4 space-y-2 shadow-xs"
                      style={{ backgroundColor: 'var(--surface-base)' }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--accent-primary)] font-medium">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>How It's Verified</span>
                        </div>
                        <button
                          onClick={() => setShowVerify(false)}
                          className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] p-1 rounded-lg transition-colors cursor-pointer mimo-press inline-flex items-center justify-center"
                          title="Close verify guide"
                          aria-label="Close verify guide"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-sm text-[var(--text-main)]">
                        <Markdown>{problem.verify}</Markdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hints */}
                <HintAccordion key={problem.id} hints={problem.hints} />
              </div>
            </div>
          </div>

          {/* ── Resizer handle (Desktop only) ─────────────────── */}
          <div
            onPointerDown={handlePointerDown}
            onDoubleClick={handleResetRatio}
            onClick={splitRatio === 0 ? handleRevert : undefined}
            className={clsx(
              "hidden lg:flex items-center justify-center relative cursor-col-resize shrink-0 z-20 group",
              splitRatio === 0 ? "w-3 hover:w-4 bg-[var(--surface-base)]" : "w-2",
              isDragging
                ? "bg-[var(--accent-primary)]/40 transition-none"
                : "transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-[var(--accent-primary)]/20"
            )}
            title={
              splitRatio === 0
                ? "Click or drag right to restore specification"
                : "Drag to resize panes (Drag far left to collapse, double-click to reset)"
            }
          >
            {splitRatio === 0 ? (
              <ChevronRight className="w-3 h-3 text-[var(--accent-primary-soft)] group-hover:scale-125 transition-transform" />
            ) : (
              <>
                {/* Thin divider line */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-[var(--surface-subtle)] group-hover:bg-[var(--accent-primary)] transition-colors" />

                {/* Tactile Grab Handle */}
                <div
                  className={clsx(
                    "relative z-10 flex flex-col gap-1 items-center justify-center py-2 px-0.5 rounded-full transition-all duration-150",
                    isDragging
                      ? "bg-[var(--accent-primary)] scale-110 shadow-sm"
                      : "bg-[var(--surface-elevated)] group-hover:bg-[var(--accent-primary)] shadow-xs"
                  )}
                >
                  <div className="w-0.5 h-1 rounded-full bg-[var(--text-tertiary)] group-hover:bg-white transition-colors" />
                  <div className="w-0.5 h-1 rounded-full bg-[var(--text-tertiary)] group-hover:bg-white transition-colors" />
                  <div className="w-0.5 h-1 rounded-full bg-[var(--text-tertiary)] group-hover:bg-white transition-colors" />
                </div>
              </>
            )}
          </div>

          {/* ── Right: Terminal ──────────────────────────────── */}
          <div
            className={clsx(
              "flex flex-col h-full min-h-0 overflow-hidden",
              mobileTab === "spec" ? "hidden lg:flex" : "flex",
              isDragging
                ? "transition-none select-none pointer-events-none"
                : "transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
            )}
            style={{
              width: isDesktop ? `${100 - splitRatio}%` : "100%",
            }}
          >
            <Terminal
              key={problem.id}
              ref={terminalRef}
              embedded={true}
              title={`${problem.id} Practice Environment`}
              initialSetup={problem.setup}
              onVerify={handleCheckAnswer}
              isSolved={isSolved}
            />
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showConfirmation && (
        <SuccessConfirmation
          problem={problem}
          nextProblem={nextProblem}
          checks={lastChecks}
          earnedPoints={problem.points}
          totalScore={totalEarned}
          onClose={() => setShowConfirmation(false)}
        />
      )}

      {/* Exit Without Finishing Confirmation Modal */}
      <ExitConfirmationModal
        isOpen={blocker.state === "blocked"}
        onConfirm={() => {
          if (blocker.state === "blocked") {
            blocker.proceed();
          }
        }}
        onCancel={() => {
          if (blocker.state === "blocked") {
            blocker.reset();
          }
        }}
        problemTitle={problem.title}
        problemId={problem.id}
      />
    </div>
  );
}
