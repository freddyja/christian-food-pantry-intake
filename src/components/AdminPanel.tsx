import Link from "next/link";
import { lockAdminAction, undoVisitAction } from "@/lib/actions";
import { BrandMark } from "@/components/AppShell";
import { btn, cn } from "@/components/ui";
import { formatPhone, householdSizeLabel, visitKindLabel } from "@/lib/format";
import type { Household, Visit } from "@/lib/schema";
import { formatShortDate, formatTime } from "@/lib/timezone";

type TodayVisit = Visit & { householdName: string; householdSize: number };

export function AdminPanel({
  monthLabel,
  summary,
  todays,
  householdList,
}: {
  monthLabel: string;
  summary: { householdsServed: number; visits: number; emergencyVisits: number };
  todays: TodayVisit[];
  householdList: Household[];
}) {
  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-forest">Admin</p>
          <BrandMark compact />
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className={btn.secondary}>
            Back to check-in
          </Link>
          <form action={lockAdminAction}>
            <button type="submit" className={btn.ghost}>
              Lock
            </button>
          </form>
        </div>
      </header>

      <section className="rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-serif text-2xl font-semibold">{monthLabel} summary</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Households served" value={summary.householdsServed} />
          <Stat label="Visits recorded" value={summary.visits} />
          <Stat label="Emergency visits" value={summary.emergencyVisits} />
        </dl>
      </section>

      <section className="mt-6 rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-serif text-2xl font-semibold">Today’s visits</h2>
        {todays.length === 0 ? (
          <p className="mt-3 text-lg text-muted">No visits recorded yet today.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {todays.map((visit) => (
              <li key={visit.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-lg font-semibold">{visit.householdName}</p>
                  <p className="text-base text-muted">
                    {formatTime(new Date(visit.visitedAt))} · {visitKindLabel(visit.isEmergency)}
                    {visit.isEmergency && visit.emergencyReason ? ` · ${visit.emergencyReason}` : ""}
                  </p>
                </div>
                <form action={undoVisitAction}>
                  <input type="hidden" name="visitId" value={visit.id} />
                  <button type="submit" className={cn(btn.ghost, "text-amber-deep")}>
                    Undo
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-serif text-2xl font-semibold">Edit household</h2>
        <p className="mt-1 text-lg text-muted">Update name, phone, size, notes, or archive a record.</p>
        <ul className="mt-4 divide-y divide-line">
          {householdList.map((household) => (
            <li key={household.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-lg font-semibold">
                  {household.primaryName}
                  {!household.active ? (
                    <span className="ml-2 text-base font-medium text-muted">(archived)</span>
                  ) : null}
                </p>
                <p className="text-base text-muted">
                  {[formatPhone(household.phone), householdSizeLabel(household.householdSize)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <Link href={`/households/${household.id}/edit`} className={btn.secondary}>
                Edit
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-paper px-4 py-3">
      <dt className="text-base text-muted">{label}</dt>
      <dd className="font-serif text-3xl font-semibold">{value}</dd>
    </div>
  );
}

export function HistoryList({
  name,
  householdId,
  entries,
}: {
  name: string;
  householdId: string;
  entries: Visit[];
}) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/households/${householdId}`} className="text-lg font-semibold text-forest">
          ← Card
        </Link>
      </div>
      <h1 className="font-serif text-3xl font-semibold">History · {name}</h1>
      {entries.length === 0 ? (
        <p className="mt-6 text-lg text-muted">No visits recorded yet for this household.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-3xl border border-line bg-white">
          {entries.map((visit) => (
            <li key={visit.id} className="px-5 py-4">
              <p className="text-lg">
                {formatShortDate(new Date(visit.visitedAt))} · {formatTime(new Date(visit.visitedAt))} ·{" "}
                {visit.isEmergency ? "Emergency" : "Regular"}
              </p>
              {visit.isEmergency && visit.emergencyReason ? (
                <p className="mt-1 text-base text-muted">Reason: {visit.emergencyReason}</p>
              ) : null}
              {visit.note ? <p className="mt-1 text-base text-muted">Note: {visit.note}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
