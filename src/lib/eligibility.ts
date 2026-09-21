import { isSameCalendarMonth } from "@/lib/timezone";

export type VisitLike = {
  visitedAt: string;
  undoneAt?: string | null;
};

export function activeVisits(visits: VisitLike[]): VisitLike[] {
  return visits.filter((visit) => !visit.undoneAt);
}

export function visitsInCalendarMonth(
  visits: VisitLike[],
  now: Date = new Date(),
): VisitLike[] {
  return activeVisits(visits).filter((visit) =>
    isSameCalendarMonth(new Date(visit.visitedAt), now),
  );
}

export function eligibleThisMonth(
  visits: VisitLike[],
  now: Date = new Date(),
): boolean {
  return visitsInCalendarMonth(visits, now).length === 0;
}

export function latestActiveVisit(
  visits: VisitLike[],
): VisitLike | null {
  const active = activeVisits(visits);
  if (active.length === 0) return null;
  return active.reduce((latest, visit) =>
    new Date(visit.visitedAt) > new Date(latest.visitedAt) ? visit : latest,
  );
}

export function latestVisitThisMonth(
  visits: VisitLike[],
  now: Date = new Date(),
): VisitLike | null {
  return latestActiveVisit(visitsInCalendarMonth(visits, now));
}
