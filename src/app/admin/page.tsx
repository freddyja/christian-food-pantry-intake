import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/AdminPanel";
import { isAdmin } from "@/lib/auth";
import { listHouseholdsForAdmin, monthSummary, todaysVisits } from "@/lib/queries";
import { formatMonthYear } from "@/lib/timezone";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [summary, todays, householdList] = await Promise.all([
    monthSummary(),
    todaysVisits(),
    listHouseholdsForAdmin(),
  ]);

  return (
    <AdminPanel
      monthLabel={formatMonthYear()}
      summary={summary}
      todays={todays}
      householdList={householdList}
    />
  );
}
