export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type BossConfig = {
  floor: number;
  id: string;
  name: string;
  flavor: string;
  /** ids referencing DEFENSES in defenses.ts */
  defenses: string[];
  turnCap: number;
};

export type RunState = {
  floor: number;
  secret: string;
  defenses: string[];
  turnsUsed: number;
  startedAt: number;
  clearedFloors: number;
};
