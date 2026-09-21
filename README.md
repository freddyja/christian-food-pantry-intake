# Pantry Check-in

Tablet-friendly intake app for Christian food pantry volunteers. Find a household, see whether they can receive food **this calendar month**, record a visit, register a new household, or use a short emergency exception.

Language stays warm and dignified. The app says **“Already received food this month,”** never denied, blocked, or ineligible.

## Policy

- **One visit per household per calendar month** (calendar month, not a rolling 30 days).
- Timezone for “this month,” “today,” and timestamps: **America/New_York**.
- **Emergency override** is allowed when leadership approves an exception. A reason of at least 3 characters is required. The visit is still recorded as served, with `is_emergency=true`.
- Eligibility is household-level, not person-level.

## Demo walkthrough

Sample data is seeded automatically (12 households). Some already received food this month; others are eligible.

1. Open the home **Search** screen. Try `Garcia` or `3525550142`.
2. Open **Garcia, Maria** — banner should read **Already received food this month**. Use **Record emergency visit** and enter a reason (Confirm stays disabled until 3+ characters).
3. Search **Williams** or **Okafor** — **Eligible this month**. **Record visit** is one confirm (optional note), then “Visit recorded. Thank you for serving.”
4. **+ New household** saves and lands on that household’s card so you can record today’s visit immediately.
5. **History** on a card shows prior months, including emergency reasons.
6. **Admin** (PIN **`1234`**) — month summary, today’s visits with **Undo**, and household edit.

## Run locally

Requires **Node.js 22+**.

```bash
npm install
cp .env.example .env.local   # optional; ADMIN_PIN defaults to 1234
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). SQLite is created at `data/pantry.db` and seeded on first run.

```bash
npm run build
npm start
```

## Deploy (Vercel)

The app is a standard Next.js App Router project.

- **Local / first preview:** uses a SQLite file. On Vercel this lives in `/tmp` and is re-seeded on a cold start, which is enough for a demo.
- **Production persistence:** create a [Turso](https://turso.tech) (libSQL) database and set:

  - `TURSO_DATABASE_URL` — e.g. `libsql://your-db.turso.io`
  - `TURSO_AUTH_TOKEN`
  - `ADMIN_PIN` — optional; defaults to `1234` for demo

Then deploy with the Vercel GitHub integration or `npx vercel`.

## Screens

| Screen | Route |
| --- | --- |
| Search (home) | `/` |
| Household card | `/households/[id]` |
| Record visit | `/households/[id]/visit` |
| Emergency visit | `/households/[id]/emergency` |
| New household | `/households/new` |
| History | `/households/[id]/history` |
| Admin | `/admin` (PIN gate at `/admin/login`) |

## Data model

**Household** — id, primary name, phone, address, household size, notes, timestamps, active.

**Visit** — household, visited_at, served, is_emergency, emergency_reason, optional note, recorded_by, undone_at.

A household is eligible when there is no non-undone visit in the current calendar month (America/New_York).

## Non-goals (v1)

No client self-check-in, inventory, ID scanning, SMS, or multi-site support.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + Drizzle ORM + libSQL/SQLite.
