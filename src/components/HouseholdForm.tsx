"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createHouseholdAction, updateHouseholdAction } from "@/lib/actions";
import { BackLink } from "@/components/AppShell";
import { btn, fieldClass, Label } from "@/components/ui";
import type { Household } from "@/lib/schema";

function Submit({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={btn.primary}>
      {pending ? "Saving…" : children}
    </button>
  );
}

const sizes = Array.from({ length: 12 }, (_, i) => i + 1);

export function HouseholdForm({ household }: { household?: Household }) {
  const isEdit = Boolean(household);
  const action = isEdit ? updateHouseholdAction : createHouseholdAction;
  const [state, formAction] = useActionState(action, null);

  return (
    <div>
      <BackLink href={isEdit ? `/households/${household!.id}` : "/"}>
        {isEdit ? "Card" : "Search"}
      </BackLink>
      <h1 className="mt-4 font-serif text-3xl font-semibold">
        {isEdit ? "Edit household" : "New household"}
      </h1>

      <form action={formAction} className="mt-6 space-y-5">
        {isEdit ? <input type="hidden" name="id" value={household!.id} /> : null}

        <div>
          <Label htmlFor="primaryName">Primary name *</Label>
          <input
            id="primaryName"
            name="primaryName"
            required
            minLength={2}
            defaultValue={household?.primaryName ?? ""}
            className={fieldClass}
            placeholder="Garcia, Maria"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={household?.phone ?? ""}
              className={fieldClass}
              placeholder="(352) 555-0142"
            />
          </div>
          <div>
            <Label htmlFor="householdSize">Household size *</Label>
            <select
              id="householdSize"
              name="householdSize"
              required
              defaultValue={household?.householdSize ?? 1}
              className={fieldClass}
            >
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="address">Address (optional)</Label>
          <input
            id="address"
            name="address"
            defaultValue={household?.address ?? ""}
            className={fieldClass}
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={household?.notes ?? ""}
            className={fieldClass}
          />
        </div>

        {isEdit ? (
          <label className="flex min-h-14 items-center gap-3 text-lg">
            <input
              type="checkbox"
              name="active"
              defaultChecked={household?.active ?? true}
              className="h-6 w-6 rounded border-line text-forest"
            />
            Active — include in search
          </label>
        ) : null}

        {state?.error ? <p className="text-lg text-amber-deep">{state.error}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link href={isEdit ? `/households/${household!.id}` : "/"} className={btn.secondary}>
            Cancel
          </Link>
          <Submit>{isEdit ? "Save changes" : "Save household"}</Submit>
        </div>
      </form>
    </div>
  );
}
