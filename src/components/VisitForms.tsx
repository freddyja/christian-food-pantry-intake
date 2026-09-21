"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { recordEmergencyVisitAction, recordVisitAction } from "@/lib/actions";
import { BackLink } from "@/components/AppShell";
import { btn, fieldClass, Label } from "@/components/ui";
import { householdSizeLabel } from "@/lib/format";

function Submit({
  children,
  className,
  disabled,
}: {
  children: ReactNode;
  className: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={disabled || pending} className={className}>
      {pending ? "Saving…" : children}
    </button>
  );
}

export function RecordVisitForm({
  householdId,
  name,
  householdSize,
  todayLabel,
}: {
  householdId: string;
  name: string;
  householdSize: number;
  todayLabel: string;
}) {
  const [state, action] = useActionState(recordVisitAction, null);

  return (
    <div>
      <BackLink href={`/households/${householdId}`}>Card</BackLink>
      <h1 className="mt-4 font-serif text-3xl font-semibold">Record visit</h1>
      <p className="mt-2 text-lg text-muted">
        {name} · {householdSizeLabel(householdSize)}
      </p>
      <p className="text-lg text-muted">Today · {todayLabel}</p>

      <form action={action} className="mt-6 space-y-5">
        <input type="hidden" name="householdId" value={householdId} />
        <div>
          <Label htmlFor="note">Optional note</Label>
          <textarea id="note" name="note" rows={3} className={fieldClass} />
        </div>
        {state?.error ? <p className="text-lg text-amber-deep">{state.error}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link href={`/households/${householdId}`} className={btn.secondary}>
            Cancel
          </Link>
          <Submit className={btn.primary}>Confirm visit</Submit>
        </div>
      </form>
    </div>
  );
}

export function EmergencyVisitForm({
  householdId,
  name,
  monthLabel,
}: {
  householdId: string;
  name: string;
  monthLabel: string;
}) {
  const [state, action] = useActionState(recordEmergencyVisitAction, null);
  const [reason, setReason] = useState("");

  return (
    <div>
      <BackLink href={`/households/${householdId}`}>Card</BackLink>
      <h1 className="mt-4 font-serif text-3xl font-semibold">Record emergency visit</h1>
      <p className="mt-3 text-lg">
        {name} already received food in {monthLabel}.
      </p>
      <p className="mt-1 text-lg text-muted">
        Use this only when leadership approves an exception.
      </p>

      <form action={action} className="mt-6 space-y-5">
        <input type="hidden" name="householdId" value={householdId} />
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
        {state?.error ? <p className="text-lg text-amber-deep">{state.error}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link href={`/households/${householdId}`} className={btn.secondary}>
            Cancel
          </Link>
          <Submit className={btn.amber} disabled={reason.trim().length < 3}>
            Confirm emergency visit
          </Submit>
        </div>
      </form>
    </div>
  );
}
