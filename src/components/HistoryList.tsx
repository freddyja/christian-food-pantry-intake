import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LoadingLine } from "@/components/AppShell";
import { getHousehold, listVisitsForHousehold } from "@/lib/api";
import { formatShortDate, formatTime } from "@/lib/timezone";
import type { Household, Visit } from "@/lib/types";

export function HistoryList() {
  const { id: householdId } = useParams();
  const [household, setHousehold] = useState<Household | null | undefined>(undefined);
  const [entries, setEntries] = useState<Visit[]>([]);

  useEffect(() => {
    if (!householdId) return;
    Promise.all([getHousehold(householdId), listVisitsForHousehold(householdId)]).then(
      ([nextHousehold, visits]) => {
        setHousehold(nextHousehold);
        setEntries(visits);
      },
    );
  }, [householdId]);

  if (household === undefined) return <LoadingLine />;
  if (!household || !householdId) {
    return <p className="text-lg text-muted">That household was not found on this device.</p>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link to={`/households/${householdId}`} className="text-lg font-semibold text-forest">
          ← Card
        </Link>
      </div>
      <h1 className="font-serif text-3xl font-semibold">History · {household.primaryName}</h1>
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
