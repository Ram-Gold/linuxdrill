import raw from "../data/problems.json";
import meta from "../data/problemMeta.json";
import type { Category, Problem } from "./types";

const metaMap = meta as Record<string, { title?: string; description?: string }>;

export const problems: Problem[] = (raw as unknown as Problem[]).map((p) => {
  const m = metaMap[p.id] || {};
  return {
    ...p,
    category: p.topic as Category,
    title: m.title || `${p.id} - ${p.topicName}`,
    description: m.description || p.task.split("\n")[0].slice(0, 120),
  };
});

export const topics = Array.from(new Set(problems.map((p) => p.topicName)));
