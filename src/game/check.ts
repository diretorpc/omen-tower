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
