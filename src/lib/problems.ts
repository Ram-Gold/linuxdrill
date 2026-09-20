import raw from "../data/problems.json";
import type { Problem } from "./types";

export const problems = raw as unknown as Problem[];
export const topics = Array.from(new Set(problems.map((p) => p.topicName)));
