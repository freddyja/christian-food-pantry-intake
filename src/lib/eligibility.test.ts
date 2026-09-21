import { describe, expect, it } from "vitest";
import { eligibleThisMonth, visitsInCalendarMonth } from "@/lib/eligibility";
import { fromZonedTime, isSameCalendarMonth, PANTRY_TIMEZONE } from "@/lib/timezone";
import { formatPhone, nameMatches, phoneMatches } from "@/lib/format";

describe("calendar month eligibility (America/New_York)", () => {
  it("treats a visit in the current calendar month as already served", () => {
    const now = fromZonedTime(2026, 9, 21, 14, 0);
    const visits = [{ visitedAt: fromZonedTime(2026, 9, 7, 10, 22).toISOString() }];
    expect(eligibleThisMonth(visits, now)).toBe(false);
  });

  it("is eligible when the only visit was last month", () => {
    const now = fromZonedTime(2026, 9, 21, 14, 0);
    const visits = [{ visitedAt: fromZonedTime(2026, 8, 31, 23, 59).toISOString() }];
    expect(eligibleThisMonth(visits, now)).toBe(true);
  });

  it("ignores undone visits", () => {
    const now = fromZonedTime(2026, 9, 21, 9, 0);
    const visits = [
      {
        visitedAt: fromZonedTime(2026, 9, 21, 8, 0).toISOString(),
        undoneAt: fromZonedTime(2026, 9, 21, 8, 5).toISOString(),
      },
    ];
    expect(eligibleThisMonth(visits, now)).toBe(true);
  });

  it("uses calendar month, not a rolling 30 days", () => {
    const now = fromZonedTime(2026, 9, 5, 12, 0);
    const visits = [{ visitedAt: fromZonedTime(2026, 8, 10, 12, 0).toISOString() }];
    expect(eligibleThisMonth(visits, now)).toBe(true);
    expect(visitsInCalendarMonth(visits, now)).toHaveLength(0);
  });

  it("splits August 31 night and September 1 morning in Eastern time", () => {
    const lateAugust = fromZonedTime(2026, 8, 31, 23, 59);
    const earlySeptember = fromZonedTime(2026, 9, 1, 0, 1);
    expect(isSameCalendarMonth(lateAugust, earlySeptember, PANTRY_TIMEZONE)).toBe(false);
    expect(eligibleThisMonth([{ visitedAt: lateAugust.toISOString() }], earlySeptember)).toBe(
      true,
    );
  });
});

describe("fromZonedTime", () => {
  it("maps Eastern civil time to the correct UTC instant during EDT", () => {
    const date = fromZonedTime(2026, 9, 21, 10, 22);
    expect(date.toISOString()).toBe("2026-09-21T14:22:00.000Z");
  });

  it("maps Eastern civil time to the correct UTC instant during EST", () => {
    const date = fromZonedTime(2026, 1, 15, 9, 0);
    expect(date.toISOString()).toBe("2026-01-15T14:00:00.000Z");
  });
});

describe("search matching", () => {
  it("matches last-name-first and given-name order", () => {
    expect(nameMatches("Garcia, Maria", "maria")).toBe(true);
    expect(nameMatches("Garcia, Maria", "gar")).toBe(true);
    expect(nameMatches("Garcia, Maria", "garcia maria")).toBe(true);
  });

  it("matches phone by digits even with punctuation", () => {
    expect(phoneMatches("3525550142", "(352) 555-0142")).toBe(true);
    expect(phoneMatches("(352) 555-0142", "5550142")).toBe(true);
    expect(formatPhone("3525550142")).toBe("(352) 555-0142");
  });
});
