export type Difficulty = "Easy" | "Average" | "Difficult";

export interface Problem {
  id: string;
  topic: string;
  topicName: string;
  difficulty: Difficulty;
  points: number;
  task: string;
  setup: string;
  hints: string[];
  solution: string;
  verify: string;
  watchOut: string;
}
