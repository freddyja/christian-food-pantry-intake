import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BackLink, LoadingLine } from "@/components/AppShell";
import { btn, fieldClass, Label } from "@/components/ui";
import { getHousehold, recordEmergencyVisit, recordVisit } from "@/lib/api";
import { householdSizeLabel } from "@/lib/format";
import { formatLongDate, formatMonthYear } from "@/lib/timezone";
import type { Household } from "@/lib/types";

export function RecordVisitForm() {
  const { id: householdId } = useParams();
  const navigate = useNavigate();
  const [household, setHousehold] = useState<Household | null | undefined>(undefined);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!householdId) return;
    getHousehold(householdId).then(setHousehold);
  }, [householdId]);

  if (household === undefined) return <LoadingLine />;
  if (!household || !householdId) {
    return (
      <div>
        <BackLink href="/">Search</BackLink>
        <p className="mt-6 text-lg text-muted">That household was not found on this device.</p>
      </div>
    );
  }

  const id = householdId;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await recordVisit(id, note);
      navigate("/?recorded=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record the visit.");
      setSaving(false);
    }
  }

  return (
    <div>
      <BackLink href={`/households/${householdId}`}>Card</BackLink>
      <h1 className="mt-4 font-serif text-3xl font-semibold">Record visit</h1>
      <p className="mt-2 text-lg text-muted">
        {household.primaryName} · {householdSizeLabel(household.householdSize)}
      </p>
      <p className="text-lg text-muted">Today · {formatLongDate(new Date())}</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div>
          <Label htmlFor="note">Optional note</Label>
          <textarea
            id="note"
            name="note"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className={fieldClass}
          />
        </div>
        {error ? <p className="text-lg text-amber-deep">{error}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link to={`/households/${householdId}`} className={btn.secondary}>
            Cancel
          </Link>
          <button type="submit" disabled={saving} className={btn.primary}>
            {saving ? "Saving…" : "Confirm visit"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function EmergencyVisitForm() {
  const { id: householdId } = useParams();
  const navigate = useNavigate();
  const [household, setHousehold] = useState<Household | null | undefined>(undefined);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!householdId) return;
    getHousehold(householdId).then(setHousehold);
  }, [householdId]);

  if (household === undefined) return <LoadingLine />;
  if (!household || !householdId) {
    return (
      <div>
        <BackLink href="/">Search</BackLink>
        <p className="mt-6 text-lg text-muted">That household was not found on this device.</p>
      </div>
    );
  }

  const id = householdId;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await recordEmergencyVisit(id, reason);
      navigate("/?recorded=emergency");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record the visit.");
      setSaving(false);
    }
  }

  return (
    <div>
      <BackLink href={`/households/${householdId}`}>Card</BackLink>
      <h1 className="mt-4 font-serif text-3xl font-semibold">Record emergency visit</h1>
      <p className="mt-3 text-lg">
        {household.primaryName} already received food in {formatMonthYear()}.
      </p>
      <p className="mt-1 text-lg text-muted">
        Use this only when leadership approves an exception.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div>
          <Label htmlFor="reason">Reason (required)</Label>
          <textarea
            id="reason"
            name="reason"
            required
            minLength={3}
            rows={4}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. Lost food to spoilage / medical need…"
            className={fieldClass}
          />
        </div>
        {error ? <p className="text-lg text-amber-deep">{error}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link to={`/households/${householdId}`} className={btn.secondary}>
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || reason.trim().length < 3}
            className={btn.amber}
          >
            {saving ? "Saving…" : "Confirm emergency visit"}
          </button>
        </div>
      </form>
    </div>
  );
}
