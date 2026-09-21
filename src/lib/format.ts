export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatPhone(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = digitsOnly(value);
  const normalized =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (normalized.length === 10) {
    return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
  }
  return value.trim() || null;
}

export function householdSizeLabel(size: number): string {
  return size === 1 ? "Household of 1" : `Household of ${size}`;
}

export function visitKindLabel(isEmergency: boolean): string {
  return isEmergency ? "Emergency visit" : "Regular visit";
}

export function normalizeSearch(query: string): string {
  return query.trim().toLowerCase();
}

export function nameMatches(primaryName: string, query: string): boolean {
  const q = normalizeSearch(query).replace(/[.,]/g, " ").replace(/\s+/g, " ").trim();
  if (!q) return false;
  const name = primaryName.toLowerCase().replace(/[.,]/g, " ").replace(/\s+/g, " ").trim();
  if (name.includes(q)) return true;
  const queryTokens = q.split(" ").filter(Boolean);
  const nameTokens = name.split(" ").filter(Boolean);
  if (queryTokens.every((token) => nameTokens.some((part) => part.startsWith(token)))) {
    return true;
  }
  return nameTokens.some((part) => part.startsWith(q));
}

export function phoneMatches(phone: string | null | undefined, query: string): boolean {
  const qDigits = digitsOnly(query);
  if (qDigits.length < 3) return false;
  const stored = digitsOnly(phone ?? "");
  return stored.includes(qDigits);
}
