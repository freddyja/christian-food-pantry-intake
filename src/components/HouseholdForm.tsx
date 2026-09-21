import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BackLink, LoadingLine } from "@/components/AppShell";
import { btn, fieldClass, Label } from "@/components/ui";
import { createHousehold, getHousehold, updateHousehold } from "@/lib/api";
import type { Household } from "@/lib/types";

const sizes = Array.from({ length: 12 }, (_, i) => i + 1);

export function HouseholdForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [household, setHousehold] = useState<Household | null | undefined>(isEdit ? undefined : null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getHousehold(id).then(setHousehold);
  }, [id]);

  if (isEdit && household === undefined) return <LoadingLine />;
  if (isEdit && !household) {
    return (
      <div>
        <BackLink href="/">Search</BackLink>
        <p className="mt-6 text-lg text-muted">That household was not found on this device.</p>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const primaryName = String(form.get("primaryName") ?? "");
    const phone = String(form.get("phone") ?? "");
    const address = String(form.get("address") ?? "");
    const householdSize = Number(form.get("householdSize"));
    const notes = String(form.get("notes") ?? "");
    const active = form.get("active") === "on";

    setSaving(true);
    setError(null);
    try {
      if (isEdit && id) {
        await updateHousehold({
          id,
          primaryName,
          phone,
          address,
          householdSize,
          notes,
          active,
        });
        navigate(`/households/${id}`);
      } else {
        const createdId = await createHousehold({
          primaryName,
          phone,
          address,
          householdSize,
          notes,
        });
        navigate(`/households/${createdId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please check the form.");
      setSaving(false);
    }
  }

  return (
    <div>
      <BackLink href={isEdit && id ? `/households/${id}` : "/"}>
        {isEdit ? "Card" : "Search"}
      </BackLink>
      <h1 className="mt-4 font-serif text-3xl font-semibold">
        {isEdit ? "Edit household" : "New household"}
      </h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-5" autoComplete="off">
        <div>
          <Label htmlFor="primaryName">Primary name *</Label>
          <input
            id="primaryName"
            name="primaryName"
            required
            minLength={2}
            defaultValue={household?.primaryName ?? ""}
            className={fieldClass}
            placeholder="Last, First"
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

        {error ? <p className="text-lg text-amber-deep">{error}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link to={isEdit && id ? `/households/${id}` : "/"} className={btn.secondary}>
            Cancel
          </Link>
          <button type="submit" disabled={saving} className={btn.primary}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Save household"}
          </button>
        </div>
      </form>
    </div>
  );
}
