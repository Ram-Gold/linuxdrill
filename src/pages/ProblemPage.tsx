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
  Terminal as TerminalIcon,
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
import CategoryIcon from "../components/CategoryIcon";

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
      <div className="py-20 text-center font-mono border border-[var(--border-subtle)] rounded-2xl bg-[var(--surface-base)] p-8 max-w-lg mx-auto shadow-[var(--card-shadow)]">
        <p className="text-[var(--text-muted)] mb-4 text-xs font-mono">Scenario '{id}' not found in registry.</p>
        <Link
          to="/"
          className="text-xs text-[var(--accent-cyan)] hover:brightness-110 font-mono inline-flex items-center gap-1.5 border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3.5 py-1.5 rounded-xl apple-press"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Catalog</span>
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
    <div className="flex flex-col space-y-3 font-sans select-none">
      {/* ── macOS Pro Workstation Toolbar ─────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3 select-none">
        {/* Left: Back button + Context Title */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] px-3 py-1.5 rounded-xl transition-colors apple-press"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="font-medium">Catalog</span>
          </Link>
          <div className="h-4 w-px bg-[var(--border-subtle)] hidden sm:block" />
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono font-semibold text-[var(--accent-cyan)] bg-[var(--surface-subtle)] px-2 py-0.5 rounded-lg border border-[var(--border-subtle)] text-[11px]">
              {problem.id}
            </span>
            <span className="text-[var(--text-main)] font-semibold truncate max-w-xs text-sm tracking-tight">
              {problem.title}
            </span>
            <span className="text-[var(--text-muted)] hidden md:flex items-center gap-1.5 text-[11px] font-mono bg-[var(--surface-subtle)] px-2 py-0.5 rounded-lg border border-[var(--border-subtle)]">
              <CategoryIcon category={problem.topic} className="w-3 h-3 text-[var(--accent-cyan)]" />
              <span>{problem.topicName}</span>
            </span>
          </div>
        </div>

        {/* Right: Actions, Navigation, Check Answer */}
        <div className="flex items-center gap-2 flex-wrap">
          {isSolved ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold text-[var(--accent-green)] border border-[var(--accent-green)]/20 rounded-xl bg-[var(--accent-green-bg)]">
              <Check className="w-3 h-3 stroke-[2.5]" />
              +{problem.points} pts
            </span>
          ) : (
            <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-subtle)] px-2.5 py-1 rounded-xl border border-[var(--border-subtle)]">
              {problem.difficulty} · {problem.points} pts
            </span>
          )}

          {/* Prev / Next Buttons */}
          <div className="flex items-center gap-1 bg-[var(--surface-subtle)] p-0.5 rounded-xl border border-[var(--border-subtle)]">
            {prevProblem ? (
              <Link
                to={`/p/${prevProblem.id}`}
                className="text-xs px-2.5 py-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)] transition-colors inline-flex items-center gap-1 apple-press"
                title="Previous Challenge"
              >
                <ArrowLeft className="w-3 h-3" />
                <span className="hidden sm:inline">Prev</span>
              </Link>
            ) : (
              <span className="text-xs px-2.5 py-1 text-[var(--text-tertiary)] inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                <span className="hidden sm:inline">Prev</span>
              </span>
            )}
            {nextProblem ? (
              <Link
                to={`/p/${nextProblem.id}`}
                className="text-xs px-2.5 py-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)] transition-colors inline-flex items-center gap-1 apple-press"
                title="Next Challenge"
              >
                <span className="hidden sm:inline">Next</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <span className="text-xs px-2.5 py-1 text-[var(--text-tertiary)] inline-flex items-center gap-1">
                <span className="hidden sm:inline">Next</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            )}
          </div>

          {/* Toggle Spec Inspector (Xcode Pro split toggle) */}
          <button
            onClick={() => setSpecCollapsed(!specCollapsed)}
            className="hidden lg:flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] px-2.5 py-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer apple-press"
            title={specCollapsed ? "Show Specification Pane" : "Focus Terminal Only"}
          >
            {specCollapsed ? <Columns2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{specCollapsed ? "Split View" : "Focus"}</span>
          </button>

          {/* Check Answer Button (⌘↵) */}
          <button
            id="check-answer-btn"
            onClick={() => handleCheckAnswer()}
            className="rounded-xl bg-[var(--accent-green)] hover:brightness-110 px-3.5 py-1.5 text-xs font-mono font-semibold text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer apple-press"
            title="Check answer (Ctrl+Enter / ⌘+Enter)"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Check Answer</span>
          </button>

          {/* Mark / Unmark Solved */}
          <button
            id="mark-solved-btn"
            onClick={handleToggleSolved}
            className={clsx(
              "rounded-xl px-2.5 py-1.5 text-xs font-mono transition-colors border cursor-pointer apple-press",
              isSolved
                ? "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--accent-red)] bg-[var(--surface-subtle)]"
                : "border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-active)]"
            )}
          >
            {isSolved ? "Unmark" : "Mark Solved"}
          </button>
        </div>
      </div>

      {/* ── Mobile tab switcher (macOS Segmented Control) ─────────────── */}
      <div className="flex lg:hidden items-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-1 text-xs select-none font-mono">
        {(["spec", "term"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={clsx(
              "flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer apple-press",
              mobileTab === tab ? "bg-[var(--surface-elevated)] text-[var(--text-main)] font-semibold border border-[var(--border-strong)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            )}
          >
            {tab === "spec" ? <FileText className="w-3.5 h-3.5" /> : <TerminalIcon className="w-3.5 h-3.5" />}
            <span>{tab === "spec" ? "Specification" : "Terminal"}</span>
          </button>
        ))}
      </div>

      {/* ── Split workstation window ──────────────────────────────────── */}
      <div className="h-[calc(100vh-140px)] min-h-[640px] max-h-[960px] border border-[var(--border-subtle)] rounded-2xl bg-[var(--surface-base)] overflow-hidden flex flex-col shadow-[var(--card-shadow)] transition-colors duration-150">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">

          {/* ── Left Spec pane (Xcode Pro Inspector) ────────────────────── */}
          {!specCollapsed && (
            <div
              className={clsx(
                "lg:col-span-5 flex flex-col h-full border-r border-[var(--border-subtle)] bg-[var(--bg-canvas)] min-h-0",
                mobileTab === "term" ? "hidden lg:flex" : "flex"
              )}
            >
              {/* Pane toolbar */}
              <div className="h-10 border-b border-[var(--border-subtle)] bg-[var(--surface-base)] px-3.5 flex items-center justify-between shrink-0 select-none">
                <span className="text-[11px] font-mono text-[var(--text-muted)] tracking-wider uppercase font-semibold">
                  Specification
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className={clsx(
                      "px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all cursor-pointer apple-press",
                      showSolution
                        ? "border-[var(--accent-green)]/40 text-[var(--accent-green)] bg-[var(--accent-green-bg)] font-semibold"
                        : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)]"
                    )}
                  >
                    Solution
                  </button>
                  <button
                    onClick={() => setShowVerify(!showVerify)}
                    className={clsx(
                      "px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all cursor-pointer apple-press",
                      showVerify
                        ? "border-[var(--accent-cyan)]/40 text-[var(--accent-cyan)] bg-[var(--accent-cyan-bg)] font-semibold"
                        : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)]"
                    )}
                  >
                    Verify Guide
                  </button>
                </div>
              </div>

              {/* Pane body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-[var(--text-main)] select-text bg-[var(--bg-canvas)]">
                {/* Title block */}
                <div className="pb-3 border-b border-[var(--border-subtle)]">
                  <h2 className="text-base font-semibold text-[var(--text-main)] tracking-tight mb-1">{problem.title}</h2>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed font-sans">{problem.description}</p>
                </div>

                {/* Objective Card */}
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-4 space-y-2.5 shadow-[var(--card-shadow)]">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider uppercase font-semibold text-[var(--accent-cyan)]">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Task Objective</span>
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-main)] font-sans leading-relaxed">
                    <Markdown>{problem.task}</Markdown>
                  </div>
                </div>

                {/* Environment / Setup Card */}
                {problem.setup && (
                  <div className="rounded-xl border border-[var(--accent-amber)]/35 bg-[var(--surface-base)] p-4 space-y-2.5 shadow-[var(--card-shadow)]">
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 text-[var(--accent-amber)]">
                      <span className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider uppercase font-semibold">
                        <Play className="w-3.5 h-3.5" />
                        <span>Environment Setup</span>
                      </span>
                      <button
                        onClick={() => terminalRef.current?.runSetup()}
                        className="text-[11px] font-mono text-[var(--accent-amber)] hover:brightness-110 border border-[var(--accent-amber)]/30 rounded-lg px-2.5 py-0.5 bg-[var(--accent-amber-bg)] transition-colors cursor-pointer apple-press"
                      >
                        Run Setup
                      </button>
                    </div>
                    <div className="text-xs text-[var(--text-main)] font-sans leading-relaxed">
                      <Markdown>{problem.setup}</Markdown>
                    </div>
                  </div>
                )}

                {/* Verification result animated card */}
                <AnimatePresence>
                  {(isSolved || verificationFeedback) && (
                    <motion.div
                      key="verification"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ type: "spring", damping: 26, stiffness: 320 }}
                      className={clsx(
                        "rounded-xl border p-4 space-y-2.5 shadow-[var(--card-shadow)]",
                        verifyPass
                          ? "border-[var(--accent-green)]/40 bg-[var(--surface-base)]"
                          : "border-[var(--accent-amber)]/40 bg-[var(--surface-base)]"
                      )}
                    >
                      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                        <span
                          className={clsx(
                            "flex items-center gap-1.5 text-[11px] font-mono tracking-wider uppercase font-semibold",
                            verifyPass ? "text-[var(--accent-green)]" : "text-[var(--accent-amber)]"
                          )}
                        >
                          {verifyPass ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          <span>{verifyPass ? "Verification Passed" : "Incomplete Checklist"}</span>
                        </span>
                        {verifyPass && (
                          <span className="text-[11px] font-mono text-[var(--accent-green)] font-semibold">+{problem.points} pts</span>
                        )}
                      </div>

                      <ul className="space-y-1.5 font-mono">
                        {lastChecks.length > 0 ? (
                          lastChecks.map((chk, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs">
                              <span className={clsx("shrink-0 font-bold", chk.passed ? "text-[var(--accent-green)]" : "text-[var(--accent-amber)]")}>
                                {chk.passed ? "[✓]" : "[✗]"}
                              </span>
                              <span className={chk.passed ? "text-[var(--text-main)]" : "text-[var(--text-muted)]"}>
                                {chk.name}
                              </span>
                            </li>
                          ))
                        ) : isSolved ? (
                          <li className="flex items-start gap-2 text-xs">
                            <span className="shrink-0 font-bold text-[var(--accent-green)]">[✓]</span>
                            <span className="text-[var(--text-main)]">All objectives verified successfully.</span>
                          </li>
                        ) : null}
                      </ul>

                      {verificationFeedback?.hint && (
                        <div className="flex items-start gap-1.5 text-xs font-mono text-[var(--accent-amber)] border-t border-[var(--border-subtle)] pt-2 mt-1">
                          <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--accent-amber)]" />
                          <span>{verificationFeedback.hint}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Reference Solution Card */}
                <AnimatePresence>
                  {showSolution && (
                    <motion.div
                      key="solution"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ type: "spring", damping: 26, stiffness: 320 }}
                      className="rounded-xl border border-[var(--accent-green)]/35 bg-[var(--surface-base)] p-4 space-y-2.5 shadow-[var(--card-shadow)]"
                    >
                      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 text-[var(--accent-green)]">
                        <span className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider uppercase font-semibold">
                          <FileCode className="w-3.5 h-3.5" />
                          <span>Reference Solution</span>
                        </span>
                        <button
                          onClick={() => {
                            const clean = problem.solution.replace(/```[a-z]*\n?/g, "").replace(/```/g, "").trim();
                            navigator.clipboard.writeText(clean);
                          }}
                          className="text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--accent-green)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-lg bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] transition-colors cursor-pointer apple-press"
                        >
                          copy
                        </button>
                      </div>
                      <div className="text-xs text-[var(--text-main)] font-sans">
                        <Markdown>{problem.solution}</Markdown>
                      </div>
                      {problem.watchOut && (
                        <div className="border-t border-[var(--border-subtle)] pt-2 text-xs text-[var(--accent-amber)] font-sans">
                          <span className="font-mono text-[10px] text-[var(--accent-amber)] uppercase tracking-wider block mb-1 font-semibold">
                            Watch out
                          </span>
                          <Markdown>{problem.watchOut}</Markdown>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Verify Guide Card */}
                <AnimatePresence>
                  {showVerify && (
                    <motion.div
                      key="verify"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ type: "spring", damping: 26, stiffness: 320 }}
                      className="rounded-xl border border-[var(--accent-cyan)]/35 bg-[var(--surface-base)] p-4 space-y-2.5 shadow-[var(--card-shadow)]"
                    >
                      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 text-[var(--accent-cyan)]">
                        <span className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider uppercase font-semibold">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>How It's Verified</span>
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-main)] font-sans">
                        <Markdown>{problem.verify}</Markdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hints Accordion */}
                <HintAccordion hints={problem.hints} />
              </div>
            </div>
          )}

          {/* ── Right Terminal pane ─────────────────────────────────────── */}
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

      {/* Success Modal Sheet */}
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
