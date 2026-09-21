import { notFound, redirect } from "next/navigation";
import { HouseholdForm } from "@/components/HouseholdForm";
import { isAdmin } from "@/lib/auth";
import { getHousehold } from "@/lib/queries";

export default async function EditHouseholdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const household = await getHousehold(id);
  if (!household) notFound();
  return <HouseholdForm household={household} />;
}
