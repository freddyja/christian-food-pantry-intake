import { notFound, redirect } from "next/navigation";
import { EmergencyVisitForm } from "@/components/VisitForms";
import { getHouseholdStatus } from "@/lib/queries";
import { formatMonthYear } from "@/lib/timezone";

export default async function EmergencyVisitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const status = await getHouseholdStatus(id);
  if (!status) notFound();
  if (status.eligible) {
    redirect(`/households/${id}/visit`);
  }

  return (
    <EmergencyVisitForm
      householdId={status.household.id}
      name={status.household.primaryName}
      monthLabel={formatMonthYear().split(" ")[0] ?? formatMonthYear()}
    />
  );
}
