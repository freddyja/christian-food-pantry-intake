import { describe, expect, it } from "vitest";
import { parseBackup } from "@/lib/backup";

describe("backup import", () => {
  it("accepts a version 1 export", () => {
    const parsed = parseBackup({
      version: 1,
      exportedAt: "2026-09-21T12:00:00.000Z",
      households: [
        {
          id: "hh_x",
          primaryName: "Test, A",
          phone: null,
          address: null,
          householdSize: 2,
          notes: null,
          createdAt: "2026-09-21T12:00:00.000Z",
          updatedAt: "2026-09-21T12:00:00.000Z",
          active: true,
        },
      ],
      visits: [],
    });
    expect(parsed.households).toHaveLength(1);
  });

  it("rejects the wrong shape", () => {
    expect(() => parseBackup({ version: 2 })).toThrow(/recognized/);
    expect(() => parseBackup({ version: 1, households: [{}], visits: [] })).toThrow(/invalid/);
  });
});
