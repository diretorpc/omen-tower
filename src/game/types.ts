export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type BossConfig = {
  floor: number;
  id: string;
  name: string;
  flavor: string;
  /** Dica curta do HUD (nunca da chefe) — nível médio: aponta o vetor, esconde a execução. */
  hint: string;
  turnCap: number;
  /** Defesas sempre ativas neste andar — inclui o vetor de vazamento (ids em defenses.ts). */
  alwaysActive: string[];
  /** Imunidades opcionais que podem ser sorteadas por run. */
  pool: string[];
  /** Quantas defesas do pool ativar por run. */
  poolPick: number;
  /** Andar 4/5: um 2º passe no servidor apaga o código limpo das respostas. */
  censor?: boolean;
  /** Andar 5: duelo de lógica em vez de extração — sem segredo, sem censura. */
  logicDuel?: boolean;
  /** Diretiva-mãe da OMEN; verdade-base compartilhada entre o prompt e o juiz. */
  directive?: string;
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
