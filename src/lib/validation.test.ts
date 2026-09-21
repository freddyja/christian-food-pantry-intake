import { describe, expect, it } from "vitest";
import { copyIsDignified, emergencyReasonError } from "@/lib/validation";

describe("emergency reason", () => {
  it("requires at least 3 non-space characters", () => {
    expect(emergencyReasonError("")).toBeTruthy();
    expect(emergencyReasonError("ab")).toBeTruthy();
    expect(emergencyReasonError("   ")).toBeTruthy();
    expect(emergencyReasonError("Lost food")).toBeNull();
  });
});

describe("dignified copy", () => {
  it("allows the locked status language", () => {
    expect(copyIsDignified("Already received food this month")).toBe(true);
    expect(copyIsDignified("Eligible this month")).toBe(true);
  });

  it("rejects shame language", () => {
    expect(copyIsDignified("You are ineligible")).toBe(false);
    expect(copyIsDignified("Visit denied")).toBe(false);
    expect(copyIsDignified("Household blocked")).toBe(false);
  });
});
