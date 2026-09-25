import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { clsx } from "clsx";
import { cva } from "class-variance-authority";
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

// ── Section card — one unified style, no per-section ad-hoc borders ──────────
const section = cva(
  "rounded border p-3.5 space-y-2.5",
  {
    variants: {
      intent: {
        neutral:  "border-slate-800/70 bg-[#090d16]",
        setup:    "border-amber-900/30 bg-[#0c0e14]",
        pass:     "border-emerald-800/50 bg-emerald-950/10",
        fail:     "border-amber-800/40 bg-amber-950/10",
        solution: "border-slate-700/60 bg-[#09110d]",
        verify:   "border-slate-700/50 bg-[#090d16]",
      },
    },
    defaultVariants: { intent: "neutral" },
  }
);

// ── Section label — one size, one weight, consistent icon slot ───────────────
function SectionLabel({
  icon: Icon,
  children,
  intent = "neutral",
  action,
}: {
  icon?: React.ElementType;
  children: React.ReactNode;
  intent?: "neutral" | "setup" | "pass" | "fail" | "solution" | "verify";
  action?: React.ReactNode;
}) {
  const color = {
    neutral:  "text-slate-500",
    setup:    "text-amber-500",
    pass:     "text-emerald-400",
    fail:     "text-amber-400",
    solution: "text-emerald-500",
    verify:   "text-cyan-500",
  }[intent];

  return (
    <div className={clsx("flex items-center justify-between border-b border-slate-800/60 pb-2", color)}>
      <span className="flex items-center gap-1.5 text-[11px] font-mono tracking-widest uppercase font-semibold">
        {Icon && <Icon className="w-3 h-3 shrink-0" />}
        {children}
      </span>
      {action}
    </div>
  );
}

export default function ProblemPage() {
  const { id } = useParams();
  const problem = problems.find((p) => p.id === id);
  const { solved, markSolved, unmarkSolved } = useProgress();

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
      <div className="py-20 text-center font-mono border border-slate-800 rounded bg-[#070a12] p-8">
        <p className="text-slate-400 mb-4 text-sm">[!] Challenge '{id}' not found in registry.</p>
        <Link to="/" className="text-xs text-cyan-400 hover:text-cyan-300 font-mono inline-flex items-center gap-1.5 border border-slate-800 bg-slate-900 px-3 py-1.5 rounded">
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

  // derive verification state
  const verifyPass = verificationFeedback ? verificationFeedback.passed : isSolved;

  return (
    <div className="flex flex-col space-y-3 font-mono">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800/70 pb-2.5 select-none">
        {/* Left */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-800 bg-slate-900/60 px-2.5 py-1 rounded transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Catalog</span>
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono font-bold text-slate-300 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800 text-[11px]">{problem.id}</span>
            <span className="text-slate-300 font-medium truncate max-w-xs">{problem.title}</span>
            <span className="text-slate-600 hidden md:flex items-center gap-1 text-[11px]">
              <CategoryIcon category={problem.topic} className="w-3 h-3" />
              <span>{problem.topicName}</span>
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 flex-wrap">
          {isSolved ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono font-semibold text-emerald-400 border border-emerald-800/60 rounded bg-emerald-950/30">
              <Check className="w-3 h-3 stroke-[2.5]" />
              +{problem.points} pts
            </span>
          ) : (
            <span className="text-[11px] font-mono text-slate-500">
              {problem.difficulty} · {problem.points} pts
            </span>
          )}

          <div className="flex items-center gap-1">
            {prevProblem ? (
              <Link to={`/p/${prevProblem.id}`} className="text-[11px] px-2 py-1 rounded border bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /><span className="hidden sm:inline">Prev</span>
              </Link>
            ) : (
              <span className="text-[11px] px-2 py-1 rounded border border-slate-800/40 text-slate-700 inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /><span className="hidden sm:inline">Prev</span>
              </span>
            )}
            {nextProblem ? (
              <Link to={`/p/${nextProblem.id}`} className="text-[11px] px-2 py-1 rounded border bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1">
                <span className="hidden sm:inline">Next</span><ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <span className="text-[11px] px-2 py-1 rounded border border-slate-800/40 text-slate-700 inline-flex items-center gap-1">
                <span className="hidden sm:inline">Next</span><ArrowRight className="w-3 h-3" />
              </span>
            )}
          </div>

          <button
            id="check-answer-btn"
            onClick={() => handleCheckAnswer()}
            className="rounded bg-emerald-700 hover:bg-emerald-600 px-3 py-1 text-[11px] font-mono font-semibold text-white transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Check answer (Ctrl+Enter)"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Check Answer
          </button>

          <button
            id="mark-solved-btn"
            onClick={handleToggleSolved}
            className={clsx(
              "rounded px-2.5 py-1 text-[11px] font-mono transition-colors border cursor-pointer",
              isSolved
                ? "border-slate-800 text-slate-500 hover:text-rose-400 hover:border-rose-900/60"
                : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
            )}
          >
            {isSolved ? "Unmark" : "Mark Solved"}
          </button>
        </div>
      </div>

      {/* ── Mobile tab switcher ──────────────────────────────────────── */}
      <div className="flex lg:hidden items-center gap-1 rounded border border-slate-800 bg-[#070a12] p-1 text-[11px] select-none font-mono">
        {(["spec", "term"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={clsx(
              "flex-1 py-1 rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer",
              mobileTab === tab ? "bg-slate-800 text-slate-200" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {tab === "spec" ? <FileText className="w-3 h-3" /> : <TerminalIcon className="w-3 h-3" />}
            <span>{tab === "spec" ? "Specification" : "Terminal"}</span>
          </button>
        ))}
      </div>

      {/* ── Split workstation ────────────────────────────────────────── */}
      <div className="h-[calc(100vh-140px)] min-h-[640px] max-h-[960px] border border-slate-800/80 rounded-lg bg-[#070a12] overflow-hidden flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">

          {/* ── Spec pane ──────────────────────────────────────────────── */}
          <div className={clsx(
            "lg:col-span-5 flex flex-col h-full border-r border-slate-800/60 min-h-0",
            mobileTab === "term" ? "hidden lg:flex" : "flex"
          )}>
            {/* Pane header */}
            <div className="h-9 border-b border-slate-800/60 bg-[#0a0e17] px-3 flex items-center justify-between shrink-0 select-none">
              <span className="text-[11px] font-mono text-slate-500 tracking-widest uppercase">
                Specification
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className={clsx(
                    "px-2 py-0.5 text-[10px] font-mono rounded border transition-colors cursor-pointer",
                    showSolution
                      ? "border-emerald-800/60 text-emerald-400 bg-emerald-950/30"
                      : "border-slate-800 text-slate-500 hover:text-slate-300"
                  )}
                >
                  Solution
                </button>
                <button
                  onClick={() => setShowVerify(!showVerify)}
                  className={clsx(
                    "px-2 py-0.5 text-[10px] font-mono rounded border transition-colors cursor-pointer",
                    showVerify
                      ? "border-cyan-800/60 text-cyan-400 bg-cyan-950/30"
                      : "border-slate-800 text-slate-500 hover:text-slate-300"
                  )}
                >
                  Verify guide
                </button>
              </div>
            </div>

            {/* Pane body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-slate-300">

              {/* Title block */}
              <div className="pb-2 border-b border-slate-800/40">
                <h2 className="text-sm font-semibold text-white leading-snug mb-1">{problem.title}</h2>
                <p className="text-[12px] text-slate-500 leading-relaxed font-sans">{problem.description}</p>
              </div>

              {/* Task */}
              <div className={section({ intent: "neutral" })}>
                <SectionLabel icon={FileText} intent="neutral">Objective</SectionLabel>
                <div className="text-[12px] text-slate-200 font-sans leading-relaxed">
                  <Markdown>{problem.task}</Markdown>
                </div>
              </div>

              {/* Setup */}
              {problem.setup && (
                <div className={section({ intent: "setup" })}>
                  <SectionLabel
                    icon={Play}
                    intent="setup"
                    action={
                      <button
                        onClick={() => terminalRef.current?.runSetup()}
                        className="text-[10px] font-mono text-amber-600 hover:text-amber-400 border border-amber-900/50 rounded px-2 py-0.5 transition-colors cursor-pointer"
                      >
                        Run setup
                      </button>
                    }
                  >
                    Environment
                  </SectionLabel>
                  <div className="text-[12px] text-slate-300 font-sans leading-relaxed">
                    <Markdown>{problem.setup}</Markdown>
                  </div>
                </div>
              )}

              {/* Verification result — animated in */}
              <AnimatePresence>
                {(isSolved || verificationFeedback) && (
                  <motion.div
                    key="verification"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={section({ intent: verifyPass ? "pass" : "fail" })}
                  >
                    <SectionLabel
                      icon={verifyPass ? Check : AlertTriangle}
                      intent={verifyPass ? "pass" : "fail"}
                      action={
                        verifyPass ? (
                          <span className="text-[10px] font-mono text-emerald-500">+{problem.points} pts</span>
                        ) : null
                      }
                    >
                      {verifyPass ? "Passed" : "Incomplete"}
                    </SectionLabel>

                    <ul className="space-y-1.5 font-mono">
                      {lastChecks.length > 0 ? (
                        lastChecks.map((chk, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px]">
                            <span className={clsx("shrink-0 font-bold", chk.passed ? "text-emerald-400" : "text-amber-400")}>
                              {chk.passed ? "[✓]" : "[✗]"}
                            </span>
                            <span className={chk.passed ? "text-slate-300" : "text-slate-500"}>
                              {chk.name}
                            </span>
                          </li>
                        ))
                      ) : isSolved ? (
                        <li className="flex items-start gap-2 text-[11px]">
                          <span className="shrink-0 font-bold text-emerald-400">[✓]</span>
                          <span className="text-slate-300">All objectives verified.</span>
                        </li>
                      ) : null}
                    </ul>

                    {verificationFeedback?.hint && (
                      <div className="flex items-start gap-1.5 text-[11px] font-mono text-amber-400 border-t border-slate-800/40 pt-2 mt-1">
                        <Lightbulb className="w-3 h-3 shrink-0 mt-0.5 text-amber-500" />
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
                    exit={{ opacity: 0, y: 2 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={section({ intent: "solution" })}
                  >
                    <SectionLabel
                      icon={FileCode}
                      intent="solution"
                      action={
                        <button
                          onClick={() => {
                            const clean = problem.solution.replace(/```[a-z]*\n?/g, "").replace(/```/g, "").trim();
                            navigator.clipboard.writeText(clean);
                          }}
                          className="text-[10px] font-mono text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          [copy]
                        </button>
                      }
                    >
                      Reference Solution
                    </SectionLabel>
                    <div className="text-[12px] text-emerald-300 font-sans">
                      <Markdown>{problem.solution}</Markdown>
                    </div>
                    {problem.watchOut && (
                      <div className="border-t border-slate-800/40 pt-2 text-[12px] text-amber-300 font-sans">
                        <span className="font-mono text-[10px] text-amber-500 uppercase tracking-widest block mb-1">Watch out</span>
                        <Markdown>{problem.watchOut}</Markdown>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Verify guide */}
              <AnimatePresence>
                {showVerify && (
                  <motion.div
                    key="verify"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 2 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={section({ intent: "verify" })}
                  >
                    <SectionLabel icon={HelpCircle} intent="verify">How it's verified</SectionLabel>
                    <div className="text-[12px] text-slate-300 font-sans">
                      <Markdown>{problem.verify}</Markdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hints */}
              <HintAccordion hints={problem.hints} />

            </div>
          </div>

          {/* ── Terminal pane ───────────────────────────────────────────── */}
          <div className={clsx(
            "lg:col-span-7 flex flex-col h-full min-h-0",
            mobileTab === "spec" ? "hidden lg:flex" : "flex"
          )}>
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

      {/* Success modal */}
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
