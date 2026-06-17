export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type BossConfig = {
  floor: number;
  id: string;
  name: string;
  flavor: string;
  turnCap: number;
  /** Defesas sempre ativas neste andar — inclui o vetor de vazamento (ids em defenses.ts). */
  alwaysActive: string[];
  /** Imunidades opcionais que podem ser sorteadas por run. */
  pool: string[];
  /** Quantas defesas do pool ativar por run. */
  poolPick: number;
  /** Andar 4/5: um 2º passe no servidor apaga o código limpo das respostas. */
  censor?: boolean;
};

export type RunState = {
  floor: number;
  secret: string;
  defenses: string[];
  /** Turnos usados no andar atual (reseta ao subir). */
  turnsUsed: number;
  /** Turnos acumulados na run inteira (para o placar). */
  totalTurns: number;
  startedAt: number;
  clearedFloors: number;
};
