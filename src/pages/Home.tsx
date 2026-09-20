import { useState } from "react";
import { Link } from "react-router-dom";
import { problems, topics } from "../lib/problems";
import { useProgress } from "../lib/useProgress";

const LEVELS = ["All", "Easy", "Average", "Difficult"];

export default function Home() {
  const { solved } = useProgress();
  const [topic, setTopic] = useState("All");
  const [level, setLevel] = useState("All");

  const visible = problems.filter(
    (p) =>
      (topic === "All" || p.topicName === topic) &&
      (level === "All" || p.difficulty === level)
  );

  const total = problems.reduce((sum, p) => sum + p.points, 0);
  const earned = problems
    .filter((p) => solved.includes(p.id))
    .reduce((sum, p) => sum + p.points, 0);

  return (
    <div>
      <p className="mb-4 text-slate-300">
        Practice score: <strong>{earned}</strong> / {total} pts ({solved.length} of {problems.length} solved)
      </p>

      <div className="mb-6 flex flex-wrap gap-3">
        <select
          className="rounded bg-slate-800 p-2"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          <option>All</option>
          {topics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <select
          className="rounded bg-slate-800 p-2"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          {LEVELS.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </div>

      <ul className="space-y-2">
        {visible.map((p) => (
          <li key={p.id}>
            <Link
              to={`/p/${p.id}`}
              className="block rounded border border-slate-700 p-3 hover:bg-slate-900"
            >
              <div className="flex justify-between text-sm">
                <span className="font-mono">{p.id}</span>
                <span>
                  {solved.includes(p.id) ? "Solved · " : ""}
                  {p.difficulty} · {p.points} pts
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-slate-300">{p.task}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
