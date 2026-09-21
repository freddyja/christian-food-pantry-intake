import Link from "next/link";
import { BackLink } from "@/components/AppShell";
import { btn, cn } from "@/components/ui";
import { formatPhone, householdSizeLabel, visitKindLabel } from "@/lib/format";
import type { HouseholdStatus } from "@/lib/queries";
import { formatShortDate } from "@/lib/timezone";

export function HouseholdCardView({
  status,
  monthLabel,
}: {
  status: HouseholdStatus;
  monthLabel: string;
}) {
  const { household, eligible, thisMonthVisit, lastVisit } = status;

  return (
    <div>
      <BackLink href="/">Search</BackLink>

      <div className="mt-5 rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">{household.primaryName}</h1>
        <p className="mt-2 text-lg text-muted">
          {[formatPhone(household.phone), householdSizeLabel(household.householdSize)]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {household.address ? <p className="mt-1 text-lg text-muted">{household.address}</p> : null}
        {!household.active ? (
          <p className="mt-3 text-base text-muted">This household is archived and hidden from search.</p>
        ) : null}

        <div
          className={cn(
            "mt-6 rounded-2xl px-4 py-4",
            eligible ? "bg-leaf text-forest-dark" : "bg-amber-soft text-amber-deep",
          )}
        >
          {eligible ? (
            <>
              <p className="text-xl font-semibold">✓ Eligible this month</p>
              <p className="mt-1 text-lg">No visit recorded in {monthLabel}</p>
            </>
          ) : (
            <>
              <p className="text-xl font-semibold">Already received food this month</p>
              {thisMonthVisit ? (
                <p className="mt-1 text-lg">
                  Last visit: {formatShortDate(new Date(thisMonthVisit.visitedAt))} ·{" "}
                  {visitKindLabel(thisMonthVisit.isEmergency)}
                </p>
              ) : lastVisit ? (
                <p className="mt-1 text-lg">
                  Last visit: {formatShortDate(new Date(lastVisit.visitedAt))}
                </p>
              ) : null}
            </>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {eligible ? (
            <Link href={`/households/${household.id}/visit`} className={btn.primary}>
              Record visit
            </Link>
          ) : (
            <Link href={`/households/${household.id}/emergency`} className={btn.amber}>
              Record emergency visit
            </Link>
          )}
          <Link href={`/households/${household.id}/history`} className={btn.secondary}>
            History
          </Link>
        </div>

        {eligible ? null : (
          <p className="mt-4 text-base text-muted">Emergency path requires a short reason.</p>
        )}

        {household.notes ? (
          <p className="mt-6 text-lg">
            <span className="font-semibold">Notes:</span> {household.notes}
          </p>
        ) : null}
      </div>
    </div>
  );
}
