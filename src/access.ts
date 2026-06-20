/**
 * Lightweight access gate for a private deploy. When ACCESS_CODE is set, the
 * expensive endpoints require an unlocked session (so a leaked URL can't burn
 * API credits). When it's unset (e.g. local dev), the gate is open.
 */
export function accessConfigured(): boolean {
  return (process.env.ACCESS_CODE ?? "").length > 0;
}

export function codeMatches(input: string): boolean {
  const code = process.env.ACCESS_CODE ?? "";
  return code.length > 0 && input === code;
}
