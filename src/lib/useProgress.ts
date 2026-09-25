import { useEffect, useState } from "react";

const KEY = "linuxdrill:solved";

export function useProgress() {
  const [solved, setSolved] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(solved));
  }, [solved]);

  const toggle = (id: string) =>
    setSolved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const markSolved = (id: string) =>
    setSolved((s) => (s.includes(id) ? s : [...s, id]));

  const unmarkSolved = (id: string) =>
    setSolved((s) => s.filter((x) => x !== id));

  const isSolved = (id: string) => solved.includes(id);

  return { solved, toggle, markSolved, unmarkSolved, isSolved };
}
