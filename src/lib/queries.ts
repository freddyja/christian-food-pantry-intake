import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  eligibleThisMonth,
  latestActiveVisit,
  latestVisitThisMonth,
} from "@/lib/eligibility";
import { nameMatches, phoneMatches } from "@/lib/format";
import { households, visits, type Household, type Visit } from "@/lib/schema";
import {
  getYearMonth,
  isSameCalendarDay,
  isSameCalendarMonth,
} from "@/lib/timezone";

export type HouseholdStatus = {
  household: Household;
  eligible: boolean;
  thisMonthVisit: Visit | null;
  lastVisit: Visit | null;
};

export async function listActiveHouseholds(): Promise<Household[]> {
  const db = await getDb();
  return db
    .select()
    .from(households)
    .where(eq(households.active, true))
    .orderBy(households.primaryName);
}

export async function getHousehold(id: string): Promise<Household | null> {
  const db = await getDb();
  const rows = await db.select().from(households).where(eq(households.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function listVisitsForHousehold(householdId: string): Promise<Visit[]> {
  const db = await getDb();
  return db
    .select()
    .from(visits)
    .where(and(eq(visits.householdId, householdId), isNull(visits.undoneAt)))
    .orderBy(desc(visits.visitedAt));
}

export async function getHouseholdStatus(id: string): Promise<HouseholdStatus | null> {
  const household = await getHousehold(id);
  if (!household) return null;
  const householdVisits = await listVisitsForHousehold(id);
  return {
    household,
    eligible: eligibleThisMonth(householdVisits),
    thisMonthVisit: latestVisitThisMonth(householdVisits) as Visit | null,
    lastVisit: latestActiveVisit(householdVisits) as Visit | null,
  };
}

export async function searchHouseholds(query: string): Promise<HouseholdStatus[]> {
  const q = query.trim();
  if (!q) return [];
  const all = await listActiveHouseholds();
  const matched = all.filter(
    (household) => nameMatches(household.primaryName, q) || phoneMatches(household.phone, q),
  );
  const results: HouseholdStatus[] = [];
  for (const household of matched.slice(0, 20)) {
    const householdVisits = await listVisitsForHousehold(household.id);
    results.push({
      household,
      eligible: eligibleThisMonth(householdVisits),
      thisMonthVisit: latestVisitThisMonth(householdVisits) as Visit | null,
      lastVisit: latestActiveVisit(householdVisits) as Visit | null,
    });
  }
  return results;
}

export async function todaysVisits(now = new Date()): Promise<
  Array<Visit & { householdName: string; householdSize: number }>
> {
  const db = await getDb();
  const rows = await db
    .select({
      visit: visits,
      householdName: households.primaryName,
      householdSize: households.householdSize,
    })
    .from(visits)
    .innerJoin(households, eq(visits.householdId, households.id))
    .where(isNull(visits.undoneAt))
    .orderBy(desc(visits.visitedAt));

  return rows
    .filter((row) => isSameCalendarDay(new Date(row.visit.visitedAt), now))
    .map((row) => ({
      ...row.visit,
      householdName: row.householdName,
      householdSize: row.householdSize,
    }));
}

export async function monthSummary(now = new Date()): Promise<{
  year: number;
  month: number;
  householdsServed: number;
  visits: number;
  emergencyVisits: number;
}> {
  const db = await getDb();
  const { year, month } = getYearMonth(now);
  const rows = await db
    .select()
    .from(visits)
    .where(isNull(visits.undoneAt));
  const inMonth = rows.filter((visit) =>
    isSameCalendarMonth(new Date(visit.visitedAt), now),
  );
  const householdIds = new Set(inMonth.map((visit) => visit.householdId));
  return {
    year,
    month,
    householdsServed: householdIds.size,
    visits: inMonth.length,
    emergencyVisits: inMonth.filter((visit) => visit.isEmergency).length,
  };
}

export async function listHouseholdsForAdmin(): Promise<Household[]> {
  const db = await getDb();
  return db.select().from(households).orderBy(households.primaryName);
}
