import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  exportBackup,
  importBackup,
  listHouseholdsForAdmin,
  monthSummary,
  todaysVisits,
  undoVisit,
} from "@/lib/api";
import { parseBackup } from "@/lib/backup";
import { isAdmin, lockAdmin } from "@/lib/auth";
import { BrandMark, LoadingLine } from "@/components/AppShell";
import { btn, cn } from "@/components/ui";
import { formatPhone, householdSizeLabel, visitKindLabel } from "@/lib/format";
import type { Household, Visit } from "@/lib/types";
import { formatMonthYear, formatTime } from "@/lib/timezone";

type TodayVisit = Visit & { householdName: string; householdSize: number };

export function AdminPanel() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);
  const [summary, setSummary] = useState({ householdsServed: 0, visits: 0, emergencyVisits: 0 });
  const [todays, setTodays] = useState<TodayVisit[]>([]);
  const [householdList, setHouseholdList] = useState<Household[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const monthLabel = formatMonthYear();

  async function reload() {
    const [nextSummary, nextTodays, nextHouseholds] = await Promise.all([
      monthSummary(),
      todaysVisits(),
      listHouseholdsForAdmin(),
    ]);
    setSummary(nextSummary);
    setTodays(nextTodays);
    setHouseholdList(nextHouseholds);
    setReady(true);
  }

  useEffect(() => {
    if (!isAdmin()) return;
    reload();
  }, []);

  if (!isAdmin()) return <Navigate to="/admin/login" replace />;
  if (!ready) return <LoadingLine>Loading admin…</LoadingLine>;

  async function onUndo(visitId: string) {
    await undoVisit(visitId);
    await reload();
  }

  async function onExport() {
    const data = await exportBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pantry-backup-${data.exportedAt.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Backup downloaded. Keep this file somewhere safe.");
  }

  async function onImport(file: File) {
    setError(null);
    setMessage(null);
    try {
      const parsed = parseBackup(JSON.parse(await file.text()));
      const ok = window.confirm(
        `Replace all households and visits on this device with the backup from ${parsed.exportedAt.slice(0, 10)}? This cannot be undone.`,
      );
      if (!ok) return;
      await importBackup(parsed);
      await reload();
      setMessage("Backup restored on this device.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not import that file.");
    }
  }

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-forest">Admin</p>
          <BrandMark compact />
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/" className={btn.secondary}>
            Back to check-in
          </Link>
          <button
            type="button"
            className={btn.ghost}
            onClick={() => {
              lockAdmin();
              navigate("/");
            }}
          >
            Lock
          </button>
        </div>
      </header>

      {message ? (
        <p className="mb-4 rounded-2xl border border-forest/20 bg-leaf px-4 py-3 text-lg text-forest-dark">
          {message}
        </p>
      ) : null}
      {error ? <p className="mb-4 text-lg text-amber-deep">{error}</p> : null}

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
                <button
                  type="button"
                  className={cn(btn.ghost, "text-amber-deep")}
                  onClick={() => onUndo(visit.id)}
                >
                  Undo
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-serif text-2xl font-semibold">Backup on this device</h2>
        <p className="mt-1 text-lg text-muted">
          Households and visits live in this tablet’s IndexedDB. Export a JSON backup before replacing
          the device. Import replaces all local records.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className={btn.secondary} onClick={onExport}>
            Export JSON backup
          </button>
          <button type="button" className={btn.secondary} onClick={() => fileRef.current?.click()}>
            Import backup…
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) onImport(file);
            }}
          />
        </div>
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
              <Link to={`/households/${household.id}/edit`} className={btn.secondary}>
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
