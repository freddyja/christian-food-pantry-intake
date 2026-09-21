import { SearchHome } from "@/components/SearchHome";
import { formatLongDate, formatMonthYear } from "@/lib/timezone";
import { monthSummary, todaysVisits } from "@/lib/queries";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ recorded?: string }>;
}) {
  const params = await searchParams;
  const [recents, summary] = await Promise.all([todaysVisits(), monthSummary()]);

  return (
    <SearchHome
      recents={recents.map((visit) => ({
        id: visit.id,
        householdId: visit.householdId,
        householdName: visit.householdName,
        visitedAt: visit.visitedAt,
      }))}
      monthLabel={formatMonthYear()}
      householdsServed={summary.householdsServed}
      headerDate={formatLongDate(new Date())}
      recorded={params.recorded}
    />
  );
}
