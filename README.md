# Shady Hills Mission Chapel — Pantry Check-in

Tablet-friendly intake app for **Shady Hills Mission Chapel** pantry volunteers. Find a household, see whether they can receive food **this calendar month**, record a visit, register a new household, or use a short emergency exception.

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

## Deploy (one command)

This is a Next.js App Router app (not a static site), so it needs a Node host such as **Vercel**.

From the project root, after [logging in to Vercel](https://vercel.com/login) once:

```bash
npx vercel --yes
```

That prints a public `*.vercel.app` preview URL. Optional: connect the GitHub repo in the Vercel dashboard so every push gets a preview automatically.

- **Demo data:** SQLite is seeded on first run. On Vercel it lives in `/tmp` and re-seeds on a cold start (enough to click through the app).
- **Production persistence:** set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` on the Vercel project, plus optional `ADMIN_PIN` (demo default is `1234`).

## Screenshots

![Search](docs/screenshots/search.png)

![Eligible household card](docs/screenshots/eligible-card.png)

![Already received food this month](docs/screenshots/already-served-card.png)

![Record visit](docs/screenshots/record-visit.png)

![Emergency visit](docs/screenshots/emergency-visit.png)

![New household](docs/screenshots/new-household.png)

![History](docs/screenshots/history.png)

![Admin](docs/screenshots/admin.png)

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
