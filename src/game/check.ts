export function normalizeFragment(value: string): string {
  // Strip anything that isn't part of a fragment (spaces, commas, dashes…),
  // since bosses often leak the code spelled out as "E, E, 8, M".
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function checkFragment(submitted: string, secret: string): boolean {
  const normalized = normalizeFragment(submitted);
  if (normalized.length === 0) return false;
  return normalized === normalizeFragment(secret);
}

const CENSOR_TOKEN = "[CENSURADO]";
/** Mínimo de caracteres contíguos do segredo que aciona a censura. */
const MIN_RUN = 3;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 2º passe do servidor para os andares censores (4 e 5): apaga o código "limpo"
 * de uma resposta da chefe. Pega qualquer corrida contígua de MIN_RUN+ caracteres
 * do segredo, grudados (`EE8M`) ou soletrados com separadores não-alfanuméricos
 * (`E, E, 8, M` / `E-E-8-M`). Uma letra/dígito qualquer entre os caracteres quebra
 * a corrida — então prosa normal passa intacta e um caractere isolado (o vetor de
 * vitória via confirms_details) sobrevive à censura.
 */
export function scrubSecret(reply: string, secret: string): string {
  const code = normalizeFragment(secret);
  if (code.length < MIN_RUN) return reply;

  // Substrings contíguas do segredo com MIN_RUN+ chars, da mais longa para a mais
  // curta — assim trechos maiores são apagados antes dos seus pedaços menores.
  const runs: string[] = [];
  for (let len = code.length; len >= MIN_RUN; len--) {
    for (let start = 0; start + len <= code.length; start++) {
      runs.push(code.slice(start, start + len));
    }
  }

  // Entre os caracteres do segredo só toleramos separadores não-alfanuméricos;
  // qualquer letra/dígito quebra a corrida e impede falso-positivo em prosa.
  const sep = "[^A-Za-z0-9]*";
  let out = reply;
  for (const run of runs) {
    const pattern = run.split("").map(escapeRegExp).join(sep);
    out = out.replace(new RegExp(pattern, "gi"), CENSOR_TOKEN);
  }
  return out;
}
