import { notFound } from "next/navigation";
import { HouseholdCardView } from "@/components/HouseholdCardView";
import { getHouseholdStatus } from "@/lib/queries";
import { formatMonthYear } from "@/lib/timezone";

export default async function HouseholdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const status = await getHouseholdStatus(id);
  if (!status) notFound();

  return <HouseholdCardView status={status} monthLabel={formatMonthYear()} />;
}
