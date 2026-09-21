import { redirect } from "next/navigation";
import { PinGate } from "@/components/PinGate";
import { isAdmin } from "@/lib/auth";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return <PinGate />;
}
