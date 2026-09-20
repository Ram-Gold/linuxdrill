import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { problems } from "../lib/problems";
import { useProgress } from "../lib/useProgress";
import Markdown from "../components/Markdown";

export default function ProblemPage() {
  const { id } = useParams();
  const problem = problems.find((p) => p.id === id);
  const { solved, toggle } = useProgress();
  const [shown, setShown] = useState(0); // how many hints are revealed
  const [showSolution, setShowSolution] = useState(false);
  const [showVerify, setShowVerify] = useState(false);

  if (!problem) {
    return (
      <p>
        Problem not found. <Link to="/" className="underline">Back to list</Link>
      </p>
    );
  }

  const isSolved = solved.includes(problem.id);

  return (
    <div className="space-y-6">
      <Link to="/" className="text-sm text-slate-400 hover:underline">← All problems</Link>

      <header>
        <h1 className="text-2xl font-bold">{problem.id}</h1>
        <p className="text-slate-400">
          {problem.topicName} · {problem.difficulty} · {problem.points} pts
        </p>
      </header>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Task</h2>
        <Markdown>{problem.task}</Markdown>
      </section>

      {problem.setup && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Setup</h2>
          <Markdown>{problem.setup}</Markdown>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-lg font-semibold">Hints</h2>
        {problem.hints.slice(0, shown).map((h, i) => (
          <div key={i} className="mb-2 rounded bg-slate-900 p-3">
            <span className="text-xs uppercase text-slate-400">Hint {i + 1}</span>
            <Markdown>{h}</Markdown>
          </div>
        ))}
        {shown < problem.hints.length && (
          <button
            className="rounded bg-amber-600 px-3 py-1"
            onClick={() => setShown(shown + 1)}
          >
            Reveal hint {shown + 1} of {problem.hints.length}
          </button>
        )}
      </section>

      <section className="space-x-3">
        <button className="rounded bg-slate-700 px-3 py-1" onClick={() => setShowVerify(!showVerify)}>
          {showVerify ? "Hide" : "Show"} how to verify
        </button>
        <button className="rounded bg-slate-700 px-3 py-1" onClick={() => setShowSolution(!showSolution)}>
          {showSolution ? "Hide" : "Show"} solution
        </button>
        <button
          className={`rounded px-3 py-1 ${isSolved ? "bg-green-700" : "bg-blue-700"}`}
          onClick={() => toggle(problem.id)}
        >
          {isSolved ? "Solved ✓" : "Mark as solved"}
        </button>
      </section>

      {showVerify && <Markdown>{problem.verify}</Markdown>}

      {showSolution && (
        <>
          <Markdown>{problem.solution}</Markdown>
          {problem.watchOut && (
            <div className="rounded border border-amber-600 p-3">
              <strong>Watch out:</strong>
              <Markdown>{problem.watchOut}</Markdown>
            </div>
          )}
        </>
      )}
    </div>
  );
}
