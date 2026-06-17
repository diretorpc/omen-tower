import type { BossConfig } from "./types";
import { generateSecret } from "./fragments";

export type RolledFloor = { secret: string; defenses: string[] };

/**
 * Sorteia o segredo e o conjunto de defesas ativas para um andar.
 * Vencibilidade é garantida POR CONSTRUÇÃO: alwaysActive (que sempre contém um
 * vetor de vazamento) entra inteiro; o pool só adiciona imunidades opcionais.
 */
export function rollFloor(
  boss: BossConfig,
  rng: () => number = Math.random,
): RolledFloor {
  const picked = sample(boss.pool, boss.poolPick, rng);
  return {
    secret: generateSecret(),
    defenses: [...boss.alwaysActive, ...picked],
  };
}

function sample<T>(arr: T[], n: number, rng: () => number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  const count = Math.max(0, Math.min(n, pool.length));
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}
