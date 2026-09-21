import { notFound } from "next/navigation";
import { HistoryList } from "@/components/AdminPanel";
import { getHousehold, listVisitsForHousehold } from "@/lib/queries";

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const household = await getHousehold(id);
  if (!household) notFound();
  const entries = await listVisitsForHousehold(id);

  return (
    <HistoryList name={household.primaryName} householdId={household.id} entries={entries} />
  );
}
