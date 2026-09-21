"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { pinIsValid, setAdminSession, clearAdminSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { eligibleThisMonth } from "@/lib/eligibility";
import { households, visits } from "@/lib/schema";
import { listVisitsForHousehold } from "@/lib/queries";
import { isSameCalendarDay } from "@/lib/timezone";
import { emergencyReasonError } from "@/lib/validation";

const householdSchema = z.object({
  primaryName: z.string().trim().min(2, "Please enter a name."),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  householdSize: z.coerce.number().int().min(1).max(20),
  notes: z.string().trim().optional(),
  active: z.boolean().optional(),
});

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function createHouseholdAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const parsed = householdSchema.safeParse({
    primaryName: formData.get("primaryName"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    householdSize: formData.get("householdSize"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const db = await getDb();
  const now = new Date().toISOString();
  const id = `hh_${crypto.randomUUID().slice(0, 8)}`;
  await db.insert(households).values({
    id,
    primaryName: parsed.data.primaryName,
    phone: emptyToNull(parsed.data.phone),
    address: emptyToNull(parsed.data.address),
    householdSize: parsed.data.householdSize,
    notes: emptyToNull(parsed.data.notes),
    createdAt: now,
    updatedAt: now,
    active: true,
  });
  revalidatePath("/");
  redirect(`/households/${id}`);
}

export async function updateHouseholdAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing household." };
  const parsed = householdSchema.safeParse({
    primaryName: formData.get("primaryName"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    householdSize: formData.get("householdSize"),
    notes: formData.get("notes") || undefined,
    active: formData.get("active") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const db = await getDb();
  await db
    .update(households)
    .set({
      primaryName: parsed.data.primaryName,
      phone: emptyToNull(parsed.data.phone),
      address: emptyToNull(parsed.data.address),
      householdSize: parsed.data.householdSize,
      notes: emptyToNull(parsed.data.notes),
      active: parsed.data.active ?? true,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(households.id, id));
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/households/${id}`);
  redirect(`/households/${id}`);
}

export async function recordVisitAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const householdId = String(formData.get("householdId") ?? "");
  const note = emptyToNull(String(formData.get("note") ?? ""));
  if (!householdId) return { error: "Missing household." };

  const existing = await listVisitsForHousehold(householdId);
  if (!eligibleThisMonth(existing)) {
    return {
      error:
        "This household already received food this month. Use Record emergency visit if leadership approves an exception.",
    };
  }

  const db = await getDb();
  await db.insert(visits).values({
    id: `v_${crypto.randomUUID().slice(0, 10)}`,
    householdId,
    visitedAt: new Date().toISOString(),
    served: true,
    isEmergency: false,
    emergencyReason: null,
    note,
    recordedBy: "Counter",
    undoneAt: null,
  });
  revalidatePath("/");
  revalidatePath(`/households/${householdId}`);
  redirect("/?recorded=1");
}

export async function recordEmergencyVisitAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const householdId = String(formData.get("householdId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const note = emptyToNull(String(formData.get("note") ?? ""));
  if (!householdId) return { error: "Missing household." };
  const reasonError = emergencyReasonError(reason);
  if (reasonError) return { error: reasonError };

  const db = await getDb();
  await db.insert(visits).values({
    id: `v_${crypto.randomUUID().slice(0, 10)}`,
    householdId,
    visitedAt: new Date().toISOString(),
    served: true,
    isEmergency: true,
    emergencyReason: reason,
    note,
    recordedBy: "Counter",
    undoneAt: null,
  });
  revalidatePath("/");
  revalidatePath(`/households/${householdId}`);
  redirect("/?recorded=emergency");
}

export async function undoVisitAction(formData: FormData): Promise<void> {
  const visitId = String(formData.get("visitId") ?? "");
  if (!visitId) return;
  const db = await getDb();
  const rows = await db.select().from(visits).where(eq(visits.id, visitId)).limit(1);
  const visit = rows[0];
  if (!visit || visit.undoneAt) return;
  if (!isSameCalendarDay(new Date(visit.visitedAt))) return;

  await db
    .update(visits)
    .set({ undoneAt: new Date().toISOString() })
    .where(and(eq(visits.id, visitId), isNull(visits.undoneAt)));
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/households/${visit.householdId}`);
}

export async function unlockAdminAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const pin = String(formData.get("pin") ?? "");
  if (!pinIsValid(pin)) {
    return { error: "That PIN did not match. Try again." };
  }
  await setAdminSession();
  redirect("/admin");
}

export async function lockAdminAction(): Promise<void> {
  await clearAdminSession();
  redirect("/");
}

export async function searchHouseholdsAction(query: string) {
  const { searchHouseholds } = await import("@/lib/queries");
  return searchHouseholds(query);
}
