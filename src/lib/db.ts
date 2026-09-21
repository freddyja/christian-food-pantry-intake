import Dexie, { type Table } from "dexie";
import { SEED_HOUSEHOLDS, buildSeedVisits } from "@/lib/seed";
import type { Household, Visit } from "@/lib/types";

class PantryDatabase extends Dexie {
  households!: Table<Household, string>;
  visits!: Table<Visit, string>;

  constructor() {
    super("shady-hills-pantry");
    this.version(1).stores({
      households: "id, primaryName, active",
      visits: "id, householdId, visitedAt",
    });
  }
}

export const db = new PantryDatabase();

export async function ensureSeeded(): Promise<void> {
  const count = await db.households.count();
  if (count > 0) return;

  const now = new Date();
  const createdAt = now.toISOString();
  await db.transaction("rw", db.households, db.visits, async () => {
    await db.households.bulkAdd(
      SEED_HOUSEHOLDS.map((household) => ({
        id: household.id,
        primaryName: household.primaryName,
        phone: household.phone,
        address: household.address,
        householdSize: household.householdSize,
        notes: household.notes,
        createdAt,
        updatedAt: createdAt,
        active: household.active,
      })),
    );
    await db.visits.bulkAdd(
      buildSeedVisits(now).map((visit) => ({
        id: visit.id,
        householdId: visit.householdId,
        visitedAt: visit.visitedAt.toISOString(),
        served: true,
        isEmergency: visit.isEmergency,
        emergencyReason: visit.emergencyReason,
        note: visit.note,
        recordedBy: "Seed",
        undoneAt: null,
      })),
    );
  });
}
