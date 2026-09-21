import { describe, expect, it } from "vitest";
import { eligibleThisMonth } from "@/lib/eligibility";
import { SEED_HOUSEHOLDS, buildSeedVisits } from "@/lib/seed";
import { fromZonedTime } from "@/lib/timezone";

describe("seed demo data", () => {
  it("includes both eligible and already-served households for a mid-month day", () => {
    const now = fromZonedTime(2026, 9, 21, 14, 0);
    const visits = buildSeedVisits(now);
    const eligible: string[] = [];
    const served: string[] = [];

    for (const household of SEED_HOUSEHOLDS) {
      const householdVisits = visits
        .filter((visit) => visit.householdId === household.id)
        .map((visit) => ({ visitedAt: visit.visitedAt.toISOString() }));
      if (eligibleThisMonth(householdVisits, now)) eligible.push(household.id);
      else served.push(household.id);
    }

    expect(eligible.length).toBeGreaterThanOrEqual(4);
    expect(served.length).toBeGreaterThanOrEqual(4);
    expect(served).toContain("hh_garcia");
    expect(eligible).toContain("hh_williams");
  });
});
