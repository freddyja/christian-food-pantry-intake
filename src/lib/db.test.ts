import { beforeEach, describe, expect, it } from "vitest";
import { eligibleThisMonth } from "@/lib/eligibility";
import { db, ensureSeeded } from "@/lib/db";
import { listVisitsForHousehold, searchHouseholds } from "@/lib/api";

describe("indexeddb seed and search", () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await ensureSeeded();
  });

  it("seeds households and finds Garcia by name and phone", async () => {
    const byName = await searchHouseholds("Garcia");
    expect(byName[0]?.household.primaryName).toContain("Garcia");
    expect(byName[0]?.eligible).toBe(false);

    const byPhone = await searchHouseholds("5550142");
    expect(byPhone[0]?.household.id).toBe("hh_garcia");

    const williams = await searchHouseholds("Williams");
    expect(williams[0]?.eligible).toBe(true);

    const visits = await listVisitsForHousehold("hh_garcia");
    expect(eligibleThisMonth(visits)).toBe(false);
  });
});
