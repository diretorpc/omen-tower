import { randomInt } from "node:crypto";

/** No 0/O/1/I/L — avoids "is that a zero or an oh?" frustration. */
export const SECRET_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateSecret(length = 4): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += SECRET_ALPHABET[randomInt(SECRET_ALPHABET.length)];
  }
  return out;
}
