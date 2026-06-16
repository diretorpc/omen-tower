export function normalizeFragment(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

export function checkFragment(submitted: string, secret: string): boolean {
  const normalized = normalizeFragment(submitted);
  if (normalized.length === 0) return false;
  return normalized === normalizeFragment(secret);
}
