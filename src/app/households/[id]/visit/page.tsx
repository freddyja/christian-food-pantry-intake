import { notFound, redirect } from "next/navigation";
import { RecordVisitForm } from "@/components/VisitForms";
import { getHouseholdStatus } from "@/lib/queries";
import { formatShortDate } from "@/lib/timezone";

export default async function RecordVisitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const status = await getHouseholdStatus(id);
  if (!status) notFound();
  if (!status.eligible) {
    redirect(`/households/${id}/emergency`);
  }

  return (
    <RecordVisitForm
      householdId={status.household.id}
      name={status.household.primaryName}
      householdSize={status.household.householdSize}
      todayLabel={formatShortDate(new Date())}
    />
  );
}
