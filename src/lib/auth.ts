import { cookies } from "next/headers";

const COOKIE = "pantry_admin";
const DEFAULT_PIN = "1234";

export function getAdminPin(): string {
  return process.env.ADMIN_PIN || DEFAULT_PIN;
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get(COOKIE)?.value === "1";
}

export async function setAdminSession() {
  const store = await cookies();
  store.set(COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export function pinIsValid(pin: string): boolean {
  const expected = getAdminPin();
  if (pin.length !== expected.length) return false;
  const left = Buffer.from(pin);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a[i] ^ b[i];
  }
  return mismatch === 0;
}
