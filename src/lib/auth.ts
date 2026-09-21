const PIN = "1234";
const KEY = "pantry_admin_until";
const TWELVE_HOURS = 12 * 60 * 60 * 1000;

export function isAdmin(): boolean {
  const until = Number(localStorage.getItem(KEY) ?? "0");
  return Number.isFinite(until) && until > Date.now();
}

export function unlockAdmin(pin: string): boolean {
  if (pin !== PIN) return false;
  localStorage.setItem(KEY, String(Date.now() + TWELVE_HOURS));
  return true;
}

export function lockAdmin(): void {
  localStorage.removeItem(KEY);
}
