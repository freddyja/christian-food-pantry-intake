import type { BackupFile, Household, Visit } from "@/lib/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function parseHousehold(value: unknown): Household | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.primaryName !== "string") {
    return null;
  }
  const size = Number(value.householdSize);
  if (!Number.isInteger(size) || size < 1) return null;
  return {
    id: value.id,
    primaryName: value.primaryName,
    phone: asString(value.phone),
    address: asString(value.address),
    householdSize: size,
    notes: asString(value.notes),
    createdAt: typeof value.createdAt === "string" ? value.createdAt : new Date().toISOString(),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date().toISOString(),
    active: value.active !== false,
  };
}

function parseVisit(value: unknown): Visit | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.householdId !== "string") {
    return null;
  }
  if (typeof value.visitedAt !== "string") return null;
  return {
    id: value.id,
    householdId: value.householdId,
    visitedAt: value.visitedAt,
    served: value.served !== false,
    isEmergency: Boolean(value.isEmergency),
    emergencyReason: asString(value.emergencyReason),
    note: asString(value.note),
    recordedBy: asString(value.recordedBy),
    undoneAt: asString(value.undoneAt),
  };
}

export function parseBackup(raw: unknown): BackupFile {
  if (!isRecord(raw) || raw.version !== 1) {
    throw new Error("This file is not a recognized pantry backup.");
  }
  if (!Array.isArray(raw.households) || !Array.isArray(raw.visits)) {
    throw new Error("This backup is missing households or visits.");
  }
  const households = raw.households.map(parseHousehold);
  const visits = raw.visits.map(parseVisit);
  if (households.some((row) => !row) || visits.some((row) => !row)) {
    throw new Error("This backup has an invalid household or visit record.");
  }
  return {
    version: 1,
    exportedAt: typeof raw.exportedAt === "string" ? raw.exportedAt : new Date().toISOString(),
    households: households as Household[],
    visits: visits as Visit[],
  };
}
