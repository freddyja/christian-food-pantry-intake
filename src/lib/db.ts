import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "@/lib/schema";
import { SEED_HOUSEHOLDS, buildSeedVisits } from "@/lib/seed";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS households (
  id TEXT PRIMARY KEY,
  primary_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  household_size INTEGER NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL,
  visited_at TEXT NOT NULL,
  served INTEGER NOT NULL DEFAULT 1,
  is_emergency INTEGER NOT NULL DEFAULT 0,
  emergency_reason TEXT,
  note TEXT,
  recorded_by TEXT,
  undone_at TEXT,
  FOREIGN KEY (household_id) REFERENCES households(id)
);
CREATE INDEX IF NOT EXISTS idx_households_name ON households(primary_name);
CREATE INDEX IF NOT EXISTS idx_visits_household ON visits(household_id);
CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON visits(visited_at);
`;

export type AppDb = LibSQLDatabase<typeof schema>;

type GlobalDb = {
  pantryClient?: Client;
  pantryDb?: AppDb;
  pantryReady?: Promise<void>;
};

const globalForDb = globalThis as typeof globalThis & GlobalDb;

function fileUrl(): string {
  if (process.env.VERCEL) {
    return "file:/tmp/pantry.db";
  }
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  return `file:${path.join(dir, "pantry.db")}`;
}

export function getDatabaseUrl(): string {
  return process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || fileUrl();
}

function createDbClient(): Client {
  const url = getDatabaseUrl();
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({
    url,
    authToken: authToken || undefined,
  });
}

async function applySchema(client: Client) {
  await client.executeMultiple(SCHEMA_SQL);
}

async function seedIfEmpty(db: AppDb) {
  const existing = await db.select({ id: schema.households.id }).from(schema.households).limit(1);
  if (existing.length > 0) return;

  const now = new Date();
  const createdAt = now.toISOString();
  await db.insert(schema.households).values(
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

  const visits = buildSeedVisits(now);
  await db.insert(schema.visits).values(
    visits.map((visit) => ({
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
}

export async function getDb(): Promise<AppDb> {
  if (!globalForDb.pantryClient) {
    globalForDb.pantryClient = createDbClient();
    globalForDb.pantryDb = drizzle(globalForDb.pantryClient, { schema });
  }
  if (!globalForDb.pantryReady) {
    const client = globalForDb.pantryClient;
    const db = globalForDb.pantryDb!;
    globalForDb.pantryReady = (async () => {
      await applySchema(client);
      await seedIfEmpty(db);
    })();
  }
  await globalForDb.pantryReady;
  return globalForDb.pantryDb!;
}

export function resetDbCache() {
  globalForDb.pantryClient?.close();
  globalForDb.pantryClient = undefined;
  globalForDb.pantryDb = undefined;
  globalForDb.pantryReady = undefined;
}
