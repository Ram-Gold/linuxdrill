import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { problems } from "../lib/problems";
import { useProgress } from "../lib/useProgress";
import Markdown from "../components/Markdown";
import Terminal from "../components/Terminal";

type ViewMode = "split" | "problem" | "terminal";

export default function ProblemPage() {
  const { id } = useParams();
  const problem = problems.find((p) => p.id === id);
  const { solved, toggle } = useProgress();
  const [shown, setShown] = useState(0); // how many hints are revealed
  const [showSolution, setShowSolution] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("split");

  if (!problem) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-slate-300">
          Problem not found.{" "}
          <Link to="/" className="text-cyan-400 hover:underline">
            Back to problem list
          </Link>
        </p>
      </div>
    );
  }

  const isSolved = solved.includes(problem.id);

  return (
    <div className="space-y-4">
      {/* Top Bar with Navigation & View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <Link to="/" className="text-sm font-medium text-slate-400 hover:text-white transition flex items-center gap-1">
          <span>←</span> Back to all problems
        </Link>

        {/* Layout Mode Selector */}
        <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900 p-1 text-xs font-medium">
          <button
            onClick={() => setViewMode("split")}
            className={`rounded px-2.5 py-1 transition ${
              viewMode === "split" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setViewMode("problem")}
            className={`rounded px-2.5 py-1 transition ${
              viewMode === "problem" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Problem Only
          </button>
          <button
            onClick={() => setViewMode("terminal")}
            className={`rounded px-2.5 py-1 transition ${
              viewMode === "terminal" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Terminal Only
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`grid gap-6 ${
          viewMode === "split"
            ? "grid-cols-1 lg:grid-cols-2 items-start"
            : "grid-cols-1"
        }`}
      >
        {/* Left Column: Problem Information */}
        {(viewMode === "split" || viewMode === "problem") && (
          <div className="space-y-6">
            <header className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xl font-bold text-white tracking-wide">{problem.id}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    problem.difficulty === "Easy"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : problem.difficulty === "Average"
                      ? "bg-amber-950 text-amber-300 border border-amber-800"
                      : "bg-rose-950 text-rose-300 border border-rose-800"
                  }`}
                >
                  {problem.difficulty} · {problem.points} pts
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400 font-medium">Topic: {problem.topicName}</p>
            </header>

            <section className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-4">
              <h2 className="mb-2 text-base font-semibold text-slate-200 uppercase tracking-wider text-xs">Task</h2>
              <Markdown>{problem.task}</Markdown>
            </section>

            {problem.setup && (
              <section className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-semibold text-slate-200 uppercase tracking-wider text-xs">Setup Required</h2>
                  <span className="text-[11px] text-cyan-400">Click 'Run Setup' in terminal to load</span>
                </div>
                <Markdown>{problem.setup}</Markdown>
              </section>
            )}

            <section className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-4">
              <h2 className="mb-2 text-base font-semibold text-slate-200 uppercase tracking-wider text-xs">Hints</h2>
              <div className="space-y-2">
                {problem.hints.slice(0, shown).map((h, i) => (
                  <div key={i} className="rounded-lg bg-slate-900/90 border border-slate-800 p-3">
                    <span className="text-xs font-semibold uppercase text-amber-400 block mb-1">
                      Hint {i + 1}
                    </span>
                    <Markdown>{h}</Markdown>
                  </div>
                ))}
              </div>
              {shown < problem.hints.length && (
                <button
                  className="mt-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 transition"
                  onClick={() => setShown(shown + 1)}
                >
                  Reveal Hint {shown + 1} of {problem.hints.length}
                </button>
              )}
            </section>

            <section className="flex flex-wrap gap-2.5 pt-2">
              <button
                className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition"
                onClick={() => setShowVerify(!showVerify)}
              >
                {showVerify ? "Hide" : "Show"} how to verify
              </button>
              <button
                className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition"
                onClick={() => setShowSolution(!showSolution)}
              >
                {showSolution ? "Hide" : "Show"} solution
              </button>
              <button
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                  isSolved
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
                onClick={() => toggle(problem.id)}
              >
                {isSolved ? "Solved ✓" : "Mark as solved"}
              </button>
            </section>

            {showVerify && (
              <section className="rounded-xl border border-cyan-900/50 bg-cyan-950/20 p-4">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                  Verification Commands
                </h3>
                <Markdown>{problem.verify}</Markdown>
              </section>
            )}

            {showSolution && (
              <section className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/80 p-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Reference Solution
                </h3>
                <Markdown>{problem.solution}</Markdown>
                {problem.watchOut && (
                  <div className="rounded-lg border border-amber-500/50 bg-amber-950/30 p-3 mt-3">
                    <strong className="text-amber-400 text-xs uppercase tracking-wider block mb-1">
                      ⚠️ Watch out:
                    </strong>
                    <Markdown>{problem.watchOut}</Markdown>
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {/* Right Column: Interactive Terminal */}
        {(viewMode === "split" || viewMode === "terminal") && (
          <div className={viewMode === "split" ? "sticky top-4" : ""}>
            <Terminal
              title={`${problem.id} Practice Environment`}
              initialSetup={problem.setup}
              defaultHeight={viewMode === "terminal" ? "650px" : "600px"}
            />
          </div>
        )}
      </div>
    </div>
  );
}
