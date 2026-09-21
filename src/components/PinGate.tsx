"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { unlockAdminAction } from "@/lib/actions";
import { BackLink } from "@/components/AppShell";
import { btn, cn } from "@/components/ui";

function Submit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={disabled || pending} className={btn.primary}>
      {pending ? "Checking…" : "Unlock admin"}
    </button>
  );
}

export function PinGate() {
  const [pin, setPin] = useState("");
  const [state, action] = useActionState(unlockAdminAction, null);

  function addDigit(digit: string) {
    setPin((current) => (current.length >= 8 ? current : current + digit));
  }

  return (
    <div>
      <BackLink href="/">Check-in</BackLink>
      <h1 className="mt-4 font-serif text-3xl font-semibold">Admin</h1>
      <p className="mt-2 text-lg text-muted">Enter the staff PIN to continue. Demo PIN: 1234</p>

      <form action={action} className="mt-6 max-w-sm">
        <input type="hidden" name="pin" value={pin} />
        <div
          aria-hidden
          className="mb-4 flex min-h-14 items-center justify-center gap-3 rounded-2xl border-2 border-line bg-white"
        >
          {Array.from({ length: Math.max(4, pin.length) }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-3 w-3 rounded-full",
                index < pin.length ? "bg-forest" : "bg-line",
              )}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((key) => {
            if (!key) return <span key="blank" />;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === "⌫") setPin((current) => current.slice(0, -1));
                  else addDigit(key);
                }}
                className="min-h-16 rounded-2xl border-2 border-line bg-white text-2xl font-semibold hover:bg-paper"
              >
                {key}
              </button>
            );
          })}
        </div>
        {state?.error ? <p className="mt-4 text-lg text-amber-deep">{state.error}</p> : null}
        <div className="mt-5">
          <Submit disabled={pin.length < 4} />
        </div>
      </form>
    </div>
  );
}
