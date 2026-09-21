import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { eligibleThisMonth } from "@/lib/eligibility";
import { listVisitsForHousehold, searchHouseholds } from "@/lib/queries";
import { resetDbCache } from "@/lib/db";

function useTempDb() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pantry-"));
  const file = path.join(dir, "test.db");
  process.env.DATABASE_URL = `file:${file}`;
  resetDbCache();
  return dir;
}

describe("database seed and search", () => {
  afterEach(() => {
    resetDbCache();
    delete process.env.DATABASE_URL;
  });

  it("seeds households and finds Garcia by name and phone", async () => {
    useTempDb();
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
