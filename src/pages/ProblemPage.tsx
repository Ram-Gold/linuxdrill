import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { clsx } from "clsx";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckSquare,
  FileCode,
  FileText,
  HelpCircle,
  Lightbulb,
  Play,
  Columns2,
  Maximize2,
} from "lucide-react";
import { problems } from "../lib/problems";
import { useProgress } from "../lib/useProgress";
import { fireGrandCelebration } from "../lib/confetti";
import { playSuccessChime } from "../lib/sound";
import { verifyProblem, type VerificationResult } from "../lib/verifyProblem";
import type { ShellContext } from "../lib/vfs/commands";
import Markdown from "../components/Markdown";
import Terminal, { type TerminalHandle } from "../components/Terminal";
import SuccessConfirmation from "../components/SuccessConfirmation";
import HintAccordion from "../components/HintAccordion";

export default function ProblemPage() {
  const { id } = useParams();
  const problem = problems.find((p) => p.id === id);
  const { solved, markSolved, unmarkSolved } = useProgress();

  const [showSolution, setShowSolution] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [specCollapsed, setSpecCollapsed] = useState(false);
  const [mobileTab, setMobileTab] = useState<"spec" | "term">("spec");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastChecks, setLastChecks] = useState<{ name: string; passed: boolean }[]>([]);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    passed: boolean;
    message: string;
    hint?: string;
  } | null>(null);
  const terminalRef = useRef<TerminalHandle>(null);

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

  const isSolved = solved.includes(problem.id);
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
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
        {/* Left: Back + title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-xs text-[var(--text-tertiary)]">{problem.id}</span>
            <span className="text-sm font-medium text-[var(--text-main)] truncate">{problem.title}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {isSolved && (
            <span className="text-xs text-[var(--accent-green)] flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>+{problem.points} pts</span>
            </span>
          )}

          {/* Prev / Next */}
          <div className="flex items-center gap-1">
            {prevProblem ? (
              <Link
                to={`/p/${prevProblem.id}`}
                className="text-xs px-2 py-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors mimo-press"
              >
                <ArrowLeft className="w-3 h-3" />
              </Link>
            ) : (
              <span className="text-xs px-2 py-1 text-[var(--text-tertiary)]">
                <ArrowLeft className="w-3 h-3" />
              </span>
            )}
            {nextProblem ? (
              <Link
                to={`/p/${nextProblem.id}`}
                className="text-xs px-2 py-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors mimo-press"
              >
                <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <span className="text-xs px-2 py-1 text-[var(--text-tertiary)]">
                <ArrowRight className="w-3 h-3" />
              </span>
            )}
          </div>

          {/* Split toggle */}
          <button
            onClick={() => setSpecCollapsed(!specCollapsed)}
            className="hidden lg:flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-strong)] transition-colors cursor-pointer mimo-press"
          >
            {specCollapsed ? <Columns2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Check Answer */}
          <button
            id="check-answer-btn"
            onClick={() => handleCheckAnswer()}
            className="btn-mimo-primary h-8 px-3 text-xs"
            title="Check your solution (Ctrl+Enter)"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Check Answer</span>
          </button>

          {/* Mark/Unmark */}
          <button
            id="mark-solved-btn"
            onClick={handleToggleSolved}
            className="btn-mimo-outline h-8 px-3 text-xs"
          >
            {isSolved ? "Unmark" : "Mark Solved"}
          </button>
        </div>
      </div>

      {/* ── Mobile tabs ───────────────────────────────────── */}
      <div className="flex lg:hidden items-center gap-1 rounded-xl border border-[var(--border-subtle)] p-1 text-xs bg-[var(--surface-base)]">
        {(["spec", "term"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={clsx(
              "flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer mimo-press text-xs font-medium",
              mobileTab === tab
                ? "bg-[var(--accent-primary)] text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            )}
          >
            {tab === "spec" ? "Specification" : "Terminal"}
          </button>
        ))}
      </div>

      {/* ── Split workstation ─────────────────────────────── */}
      <div className="h-[calc(100vh-140px)] min-h-[640px] max-h-[960px] border border-[var(--border-subtle)] rounded-2xl overflow-hidden flex flex-col transition-colors" style={{ backgroundColor: 'var(--surface-base)' }}>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">

          {/* ── Left: Spec pane ──────────────────────────────── */}
          {!specCollapsed && (
            <div
              className={clsx(
                "lg:col-span-5 flex flex-col h-full border-r border-[var(--border-subtle)] min-h-0",
                mobileTab === "term" ? "hidden lg:flex" : "flex"
              )}
              style={{ backgroundColor: 'var(--bg-canvas)' }}
            >
              {/* Pane toolbar */}
              <div className="h-10 border-b border-[var(--border-subtle)] px-4 flex items-center justify-between shrink-0" style={{ backgroundColor: 'var(--surface-base)' }}>
                <span className="text-xs text-[var(--text-muted)] font-medium">Specification</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className={clsx(
                      "px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer mimo-press",
                      showSolution
                        ? "border-[var(--accent-green)]/40 text-[var(--accent-green)] bg-[var(--accent-green-bg)] font-medium"
                        : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-strong)]"
                    )}
                  >
                    Solution
                  </button>
                  <button
                    onClick={() => setShowVerify(!showVerify)}
                    className={clsx(
                      "px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer mimo-press",
                      showVerify
                        ? "border-[var(--accent-primary)]/40 text-[var(--accent-primary-soft)] bg-[var(--accent-primary-bg)] font-medium"
                        : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-strong)]"
                    )}
                  >
                    Verify Guide
                  </button>
                </div>
              </div>

              {/* Pane body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text">
                {/* Title */}
                <div className="pb-3 border-b border-[var(--border-subtle)]">
                  <h2 className="text-base sm:text-[17px] font-medium text-[var(--text-main)] mb-1">{problem.title}</h2>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{problem.description}</p>
                </div>

                {/* Task */}
                <div className="rounded-lg border border-[var(--border-subtle)] p-4 space-y-2" style={{ backgroundColor: 'var(--surface-base)' }}>
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
                  <div className="rounded-lg border border-[var(--accent-amber)]/30 p-4 space-y-2" style={{ backgroundColor: 'var(--surface-base)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--accent-amber)] font-medium">
                        <Play className="w-3.5 h-3.5" />
                        <span>Setup</span>
                      </span>
                      <button
                        onClick={() => terminalRef.current?.runSetup()}
                        className="text-[11px] text-[var(--accent-amber)] border border-[var(--accent-amber)]/30 rounded-md px-2 py-0.5 hover:opacity-80 transition-colors cursor-pointer mimo-press"
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
                      className={clsx(
                        "rounded-lg border p-4 space-y-2",
                        verifyPass
                          ? "border-[var(--accent-green)]/30"
                          : "border-[var(--accent-amber)]/30"
                      )}
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
                        <div className="flex items-start gap-1.5 text-xs text-[var(--accent-amber)] border-t border-[var(--border-subtle)] pt-2 mt-1">
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
                      className="rounded-lg border border-[var(--accent-green)]/30 p-4 space-y-2"
                      style={{ backgroundColor: 'var(--surface-base)' }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-1.5 text-xs text-[var(--accent-green)] font-medium">
                          <FileCode className="w-3.5 h-3.5" />
                          <span>Solution</span>
                        </span>
                        <button
                          onClick={() => {
                            const clean = problem.solution.replace(/```[a-z]*\n?/g, "").replace(/```/g, "").trim();
                            navigator.clipboard.writeText(clean);
                          }}
                          className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-md transition-colors cursor-pointer mimo-press"
                        >
                          copy
                        </button>
                      </div>
                      <div className="text-sm text-[var(--text-main)]">
                        <Markdown>{problem.solution}</Markdown>
                      </div>
                      {problem.watchOut && (
                        <div className="border-t border-[var(--border-subtle)] pt-2 text-sm text-[var(--accent-amber)]">
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
                      className="rounded-lg border border-[var(--accent-primary)]/30 p-4 space-y-2"
                      style={{ backgroundColor: 'var(--surface-base)' }}
                    >
                      <div className="flex items-center gap-1.5 text-xs text-[var(--accent-primary)] font-medium mb-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>How It's Verified</span>
                      </div>
                      <div className="text-sm text-[var(--text-main)]">
                        <Markdown>{problem.verify}</Markdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hints */}
                <HintAccordion hints={problem.hints} />
              </div>
            </div>
          )}

          {/* ── Right: Terminal ──────────────────────────────── */}
          <div
            className={clsx(
              specCollapsed ? "lg:col-span-12" : "lg:col-span-7",
              "flex flex-col h-full min-h-0",
              mobileTab === "spec" ? "hidden lg:flex" : "flex"
            )}
          >
            <Terminal
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
    </div>
  );
}
