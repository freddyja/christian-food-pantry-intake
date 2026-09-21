import { useEffect, useMemo, useState, useTransition } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { monthSummary, searchHouseholds, todaysVisits } from "@/lib/api";
import type { HouseholdStatus } from "@/lib/types";
import { formatPhone, householdSizeLabel } from "@/lib/format";
import { formatLongDate, formatMonthYear, formatTime } from "@/lib/timezone";
import { BrandMark, SuccessBanner } from "@/components/AppShell";
import { btn, cn, fieldClass } from "@/components/ui";

type Recent = {
  id: string;
  householdId: string;
  householdName: string;
  visitedAt: string;
};

export function SearchHome() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const recorded = params.get("recorded") ?? undefined;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HouseholdStatus[]>([]);
  const [resultQuery, setResultQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [recents, setRecents] = useState<Recent[]>([]);
  const [householdsServed, setHouseholdsServed] = useState(0);
  const headerDate = formatLongDate(new Date());
  const monthLabel = formatMonthYear();

  useEffect(() => {
    let cancelled = false;
    Promise.all([todaysVisits(), monthSummary()]).then(([visits, summary]) => {
      if (cancelled) return;
      setRecents(
        visits.map((visit) => ({
          id: visit.id,
          householdId: visit.householdId,
          householdName: visit.householdName,
          visitedAt: visit.visitedAt,
        })),
      );
      setHouseholdsServed(summary.householdsServed);
    });
    return () => {
      cancelled = true;
    };
  }, [recorded]);

  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const handle = window.setTimeout(() => {
      startTransition(async () => {
        const next = await searchHouseholds(q);
        setResults(next);
        setResultQuery(q);
      });
    }, 160);
    return () => window.clearTimeout(handle);
  }, [query]);

  const showingResults = query.trim().length > 0;
  const resultsAreCurrent = resultQuery === query.trim();
  const empty = showingResults && resultsAreCurrent && results.length === 0 && !pending;

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const top = resultsAreCurrent ? results[0] : undefined;
    if (top) navigate(`/households/${top.household.id}`);
  }

  const successCopy = useMemo(() => {
    if (recorded === "1") return "Visit recorded. Thank you for serving.";
    if (recorded === "emergency") return "Emergency visit recorded. Thank you for serving.";
    return null;
  }, [recorded]);

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <BrandMark />
          <p className="mt-3 text-lg text-muted">
            {headerDate} · {monthLabel} households served: {householdsServed}
          </p>
        </div>
        <Link to="/admin" className={btn.secondary}>
          Admin
        </Link>
      </header>

      {successCopy ? <SuccessBanner>{successCopy}</SuccessBanner> : null}

      <form onSubmit={onSubmit} className="mb-8">
        <label htmlFor="household-search" className="mb-2 block font-serif text-2xl font-semibold">
          Find a household
        </label>
        <div className="relative">
          <input
            id="household-search"
            type="search"
            autoFocus
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name or phone…"
            className={cn(fieldClass, "pr-14")}
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 grid place-items-center text-2xl text-muted">
            🔍
          </span>
        </div>
      </form>

      {showingResults ? (
        <section aria-live="polite">
          <h2 className="mb-3 text-lg font-semibold text-muted">
            {pending && !resultsAreCurrent ? "Searching…" : "Results"}
          </h2>
          {empty ? (
            <p className="rounded-2xl border border-dashed border-line bg-white/70 px-4 py-6 text-lg text-muted">
              No match — try another spelling, or add a new household.
            </p>
          ) : (
            <ul className="grid gap-3">
              {(resultsAreCurrent ? results : []).map((row) => (
                <li key={row.household.id}>
                  <Link
                    to={`/households/${row.household.id}`}
                    className="flex min-h-20 items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-sm hover:border-forest/40"
                  >
                    <div>
                      <p className="font-serif text-xl font-semibold">{row.household.primaryName}</p>
                      <p className="text-base text-muted">
                        {[formatPhone(row.household.phone), householdSizeLabel(row.household.householdSize)]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <StatusChip eligible={row.eligible} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-muted">Recent check-ins (today)</h2>
          {recents.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line bg-white/70 px-4 py-6 text-lg text-muted">
              No visits recorded yet today.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {recents.map((visit) => (
                <li key={visit.id}>
                  <Link
                    to={`/households/${visit.householdId}`}
                    className="block min-h-24 rounded-2xl border border-line bg-white px-4 py-3 shadow-sm hover:border-forest/40"
                  >
                    <p className="font-serif text-xl font-semibold">{visit.householdName}</p>
                    <p className="text-base text-muted">
                      {formatTime(new Date(visit.visitedAt))} · served
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div className="mt-10 flex justify-center">
        <Link to="/households/new" className={btn.primary}>
          + New household
        </Link>
      </div>
    </div>
  );
}

function StatusChip({ eligible }: { eligible: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-3 py-1 text-sm font-semibold",
        eligible ? "bg-leaf text-forest-dark" : "bg-amber-soft text-amber-deep",
      )}
    >
      {eligible ? "Eligible" : "Received this month"}
    </span>
  );
}
