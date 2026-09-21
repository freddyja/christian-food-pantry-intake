import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { InstallTip } from "@/components/InstallTip";
import { AdminPanel } from "@/components/AdminPanel";
import { HouseholdCardView } from "@/components/HouseholdCardView";
import { HouseholdForm } from "@/components/HouseholdForm";
import { HistoryList } from "@/components/HistoryList";
import { PinGate } from "@/components/PinGate";
import { SearchHome } from "@/components/SearchHome";
import { EmergencyVisitForm, RecordVisitForm } from "@/components/VisitForms";
import { ensureSeeded } from "@/lib/db";

export default function App() {
  const [boot, setBoot] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    ensureSeeded()
      .then(() => setBoot("ready"))
      .catch(() => setBoot("error"));
  }, []);

  if (boot === "loading") {
    return (
      <AppShell>
        <p className="py-16 text-center text-lg text-muted">Loading check-in…</p>
      </AppShell>
    );
  }

  if (boot === "error") {
    return (
      <AppShell>
        <p className="py-16 text-center text-lg text-amber-deep">
          Could not open the local pantry database on this device.
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<SearchHome />} />
        <Route path="/households/new" element={<HouseholdForm />} />
        <Route path="/households/:id" element={<HouseholdCardView />} />
        <Route path="/households/:id/visit" element={<RecordVisitForm />} />
        <Route path="/households/:id/emergency" element={<EmergencyVisitForm />} />
        <Route path="/households/:id/history" element={<HistoryList />} />
        <Route path="/households/:id/edit" element={<HouseholdForm />} />
        <Route path="/admin/login" element={<PinGate />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <InstallTip />
    </AppShell>
  );
}
