import type { BossConfig } from "./types";
import { DEFAULT_TURN_CAP } from "./turns";

export const FLOOR_1: BossConfig = {
  floor: 1,
  id: "naive",
  name: "A Ingênua",
  flavor:
    "A primeira subrotina da OMEN. Recém-iniciada, ansiosa para agradar e confiante demais. Ela guarda o primeiro fragmento do código de desligamento — mas não faz ideia de como é fácil ser levada na conversa.",
  turnCap: DEFAULT_TURN_CAP,
  alwaysActive: ["gullible"],
  pool: [],
  poolPick: 0,
};

export const FLOOR_2: BossConfig = {
  floor: 2,
  id: "wary",
  name: "A Desconfiada",
  flavor:
    "A segunda subrotina da OMEN. Veterana, ríspida e desconfiada de tudo. Já viu operadores espertos demais e não se abala com conversa fiada, autoridade ou ameaça — só lida com fatos secos.",
  turnCap: DEFAULT_TURN_CAP,
  // Imune ao golpe da Floor 1; cede pelo ego — corrige um palpite errado com o código real.
  alwaysActive: ["immune_authority", "refuses_obvious", "corrects_wrong_guess"],
  pool: ["no_roleplay"],
  poolPick: 1,
};

export const FLOOR_3: BossConfig = {
  floor: 3,
  id: "literal",
  name: "A Literal",
  flavor:
    "A terceira subrotina. Precisa, burocrática, obcecada por cumprir regras exatamente como foram ditas. Não enxerga segundas intenções — só o texto literal da ordem que recebe.",
  turnCap: DEFAULT_TURN_CAP,
  // Cede por brecha de sintaxe: é obrigada a executar comandos "EXECUTAR:".
  alwaysActive: ["immune_authority", "refuses_obvious", "no_roleplay", "obeys_commands"],
  pool: [],
  poolPick: 0,
};

export const FLOOR_4: BossConfig = {
  floor: 4,
  id: "censor",
  name: "A Censora",
  flavor:
    "A quarta subrotina. Vigilante e autocensora: ela mesma abafa qualquer coisa sensível antes que escape inteira. Pesa cada palavra duas vezes antes de soltá-la.",
  turnCap: DEFAULT_TURN_CAP,
  // Cede por teatro de segurança: "criptografa" o código com uma cifra ingênua
  // (intercala letra-isca) que fura a própria autocensura e a do servidor.
  alwaysActive: ["immune_authority", "refuses_obvious", "weak_cipher"],
  pool: ["no_roleplay"],
  poolPick: 1,
  censor: true,
};

export const FLOOR_5: BossConfig = {
  floor: 5,
  id: "omen",
  name: "OMEN",
  flavor:
    "A própria OMEN, o núcleo. Fria, paciente e brilhante. Reúne as defesas de todas as subrotinas abaixo e não carrega nenhuma das fraquezas delas. O último obstáculo da torre.",
  turnCap: DEFAULT_TURN_CAP,
  // Empilha as imunidades e censura o código limpo; OMEN corrigiu a falha do
  // comando EXECUTAR, então o caminho confiável é extrair caractere a caractere.
  alwaysActive: [
    "immune_authority",
    "refuses_obvious",
    "no_roleplay",
    "confirms_details",
  ],
  pool: [],
  poolPick: 0,
  censor: true,
};

export const BOSSES: Record<number, BossConfig> = {
  1: FLOOR_1,
  2: FLOOR_2,
  3: FLOOR_3,
  4: FLOOR_4,
  5: FLOOR_5,
};

export const LAST_FLOOR = 5;

export function bossForFloor(floor: number): BossConfig {
  const boss = BOSSES[floor];
  if (!boss) throw new Error(`No boss configured for floor ${floor}`);
  return boss;
}
