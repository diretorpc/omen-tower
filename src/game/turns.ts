export const DEFAULT_TURN_CAP = 10;

export function turnsRemaining(used: number, cap: number): number {
  return Math.max(0, cap - used);
}

export function isOutOfTurns(used: number, cap: number): boolean {
  return used >= cap;
}
