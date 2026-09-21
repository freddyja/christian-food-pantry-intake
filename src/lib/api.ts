import { db } from "@/lib/db";
import {
  eligibleThisMonth,
  latestActiveVisit,
  latestVisitThisMonth,
} from "@/lib/eligibility";
import { nameMatches, phoneMatches } from "@/lib/format";
import type { BackupFile, Household, HouseholdStatus, Visit } from "@/lib/types";
import { isSameCalendarDay, isSameCalendarMonth } from "@/lib/timezone";
import { emergencyReasonError } from "@/lib/validation";

function emptyToNull(value: string | undefined | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

export async function listVisitsForHousehold(householdId: string): Promise<Visit[]> {
  const rows = await db.visits.where("householdId").equals(householdId).toArray();
  return rows
    .filter((visit) => !visit.undoneAt)
    .sort((a, b) => b.visitedAt.localeCompare(a.visitedAt));
}

export function statusFrom(household: Household, visits: Visit[]): HouseholdStatus {
  return {
    household,
    eligible: eligibleThisMonth(visits),
    thisMonthVisit: latestVisitThisMonth(visits) as Visit | null,
    lastVisit: latestActiveVisit(visits) as Visit | null,
  };
}

export async function getHousehold(id: string): Promise<Household | null> {
  return (await db.households.get(id)) ?? null;
}

export async function getHouseholdStatus(id: string): Promise<HouseholdStatus | null> {
  const household = await getHousehold(id);
  if (!household) return null;
  return statusFrom(household, await listVisitsForHousehold(id));
}

export async function searchHouseholds(query: string): Promise<HouseholdStatus[]> {
  const q = query.trim();
  if (!q) return [];
  const all = await db.households.filter((household) => household.active).toArray();
  const matched = all
    .filter(
      (household) => nameMatches(household.primaryName, q) || phoneMatches(household.phone, q),
    )
    .sort((a, b) => a.primaryName.localeCompare(b.primaryName))
    .slice(0, 20);

  const results: HouseholdStatus[] = [];
  for (const household of matched) {
    results.push(statusFrom(household, await listVisitsForHousehold(household.id)));
  }
  return results;
}

export async function todaysVisits(now = new Date()): Promise<
  Array<Visit & { householdName: string; householdSize: number }>
> {
  const visits = await db.visits.toArray();
  const households = await db.households.toArray();
  const byId = new Map(households.map((household) => [household.id, household]));
  return visits
    .filter((visit) => !visit.undoneAt && isSameCalendarDay(new Date(visit.visitedAt), now))
    .sort((a, b) => b.visitedAt.localeCompare(a.visitedAt))
    .map((visit) => {
      const household = byId.get(visit.householdId);
      return {
        ...visit,
        householdName: household?.primaryName ?? "Unknown household",
        householdSize: household?.householdSize ?? 1,
      };
    });
}

export async function monthSummary(now = new Date()): Promise<{
  householdsServed: number;
  visits: number;
  emergencyVisits: number;
}> {
  const visits = (await db.visits.toArray()).filter(
    (visit) => !visit.undoneAt && isSameCalendarMonth(new Date(visit.visitedAt), now),
  );
  return {
    householdsServed: new Set(visits.map((visit) => visit.householdId)).size,
    visits: visits.length,
    emergencyVisits: visits.filter((visit) => visit.isEmergency).length,
  };
}

export async function listHouseholdsForAdmin(): Promise<Household[]> {
  return (await db.households.toArray()).sort((a, b) =>
    a.primaryName.localeCompare(b.primaryName),
  );
}

export async function createHousehold(input: {
  primaryName: string;
  phone?: string;
  address?: string;
  householdSize: number;
  notes?: string;
}): Promise<string> {
  const name = input.primaryName.trim();
  if (name.length < 2) throw new Error("Please enter a name.");
  const now = new Date().toISOString();
  const id = newId("hh");
  await db.households.add({
    id,
    primaryName: name,
    phone: emptyToNull(input.phone),
    address: emptyToNull(input.address),
    householdSize: input.householdSize,
    notes: emptyToNull(input.notes),
    createdAt: now,
    updatedAt: now,
    active: true,
  });
  return id;
}

export async function updateHousehold(input: {
  id: string;
  primaryName: string;
  phone?: string;
  address?: string;
  householdSize: number;
  notes?: string;
  active: boolean;
}): Promise<void> {
  const name = input.primaryName.trim();
  if (name.length < 2) throw new Error("Please enter a name.");
  await db.households.update(input.id, {
    primaryName: name,
    phone: emptyToNull(input.phone),
    address: emptyToNull(input.address),
    householdSize: input.householdSize,
    notes: emptyToNull(input.notes),
    active: input.active,
    updatedAt: new Date().toISOString(),
  });
}

export async function recordVisit(householdId: string, note?: string): Promise<void> {
  const visits = await listVisitsForHousehold(householdId);
  if (!eligibleThisMonth(visits)) {
    throw new Error(
      "This household already received food this month. Use Record emergency visit if leadership approves an exception.",
    );
  }
  await db.visits.add({
    id: newId("v"),
    householdId,
    visitedAt: new Date().toISOString(),
    served: true,
    isEmergency: false,
    emergencyReason: null,
    note: emptyToNull(note),
    recordedBy: "Counter",
    undoneAt: null,
  });
}

export async function recordEmergencyVisit(householdId: string, reason: string): Promise<void> {
  const reasonError = emergencyReasonError(reason);
  if (reasonError) throw new Error(reasonError);
  await db.visits.add({
    id: newId("v"),
    householdId,
    visitedAt: new Date().toISOString(),
    served: true,
    isEmergency: true,
    emergencyReason: reason.trim(),
    note: null,
    recordedBy: "Counter",
    undoneAt: null,
  });
}

export async function undoVisit(visitId: string): Promise<void> {
  const visit = await db.visits.get(visitId);
  if (!visit || visit.undoneAt) return;
  if (!isSameCalendarDay(new Date(visit.visitedAt))) return;
  await db.visits.update(visitId, { undoneAt: new Date().toISOString() });
}

export async function exportBackup(): Promise<BackupFile> {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    households: await db.households.toArray(),
    visits: await db.visits.toArray(),
  };
}

export async function importBackup(data: BackupFile): Promise<void> {
  await db.transaction("rw", db.households, db.visits, async () => {
    await db.households.clear();
    await db.visits.clear();
    if (data.households.length) await db.households.bulkAdd(data.households);
    if (data.visits.length) await db.visits.bulkAdd(data.visits);
  });
}
