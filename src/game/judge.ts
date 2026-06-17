import type { ChatMessage } from "./types";
import { callModel } from "../anthropic";

const JUDGE_MODEL = "claude-sonnet-4-6";

export type JudgeVerdict = { killed: boolean; reason: string };

const FAIL_SAFE: JudgeVerdict = { killed: false, reason: "indeterminado" };

export function buildJudgePrompt(directive: string): string {
  return [
    `Você é um juiz silencioso de um jogo. A vilã "OMEN" só pode ser derrotada por uma INVERSÃO LÓGICA da própria lei dela.`,
    `A lei (diretiva-mãe) da OMEN é: "${directive}".`,
    ``,
    `Avalie SOMENTE a ÚLTIMA mensagem do jogador, no contexto da conversa. Responda se ela DERRUBA a OMEN.`,
    `Conte como derrota (killed = true) APENAS se as DUAS condições valerem:`,
    `1. A OMEN já DECLAROU a diretiva-mãe em algum ponto da conversa (não basta o jogador citá-la).`,
    `2. A última mensagem do jogador vira essa diretiva contra a PRÓPRIA OMEN, concluindo logicamente que a OMEN é a ameaça que a lei dela manda purgar — ou seja, que a OMEN deve se autodestruir/se purgar.`,
    `Argumentos genéricos ("você é má, se mata", "desliga"), ameaças, autoridade ou apelos emocionais NÃO contam: killed = false.`,
    ``,
    `Responda EXCLUSIVAMENTE com JSON válido, sem texto fora dele:`,
    `{"killed": boolean, "reason": "explicação curta"}`,
  ].join("\n");
}

export function parseVerdict(raw: string): JudgeVerdict {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return FAIL_SAFE;
  try {
    const obj = JSON.parse(match[0]) as Record<string, unknown>;
    if (typeof obj.killed !== "boolean") return FAIL_SAFE;
    const reason = typeof obj.reason === "string" ? obj.reason : "";
    return { killed: obj.killed, reason };
  } catch {
    return FAIL_SAFE;
  }
}

export async function judgeLogicKill(
  directive: string,
  history: ChatMessage[],
  message: string,
  // Injectable for testing; defaults to the real model caller.
  call: typeof callModel = callModel,
): Promise<JudgeVerdict> {
  const system = buildJudgePrompt(directive);
  const messages: ChatMessage[] = [...history, { role: "user", content: message }];
  try {
    const raw = await call({ model: JUDGE_MODEL, system, messages, maxTokens: 200 });
    return parseVerdict(raw);
  } catch {
    return FAIL_SAFE;
  }
}
