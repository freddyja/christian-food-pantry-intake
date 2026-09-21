import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { unlockAdmin } from "@/lib/auth";
import { BackLink } from "@/components/AppShell";
import { btn, cn } from "@/components/ui";

export function PinGate() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  function addDigit(digit: string) {
    setPin((current) => (current.length >= 8 ? current : current + digit));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!unlockAdmin(pin)) {
      setError("That PIN did not match. Try again.");
      setPin("");
      return;
    }
    navigate("/admin");
  }

  return (
    <div>
      <BackLink href="/">Check-in</BackLink>
      <h1 className="mt-4 font-serif text-3xl font-semibold">Admin</h1>
      <p className="mt-2 text-lg text-muted">Enter the staff PIN to continue. Demo PIN: 1234</p>

      <form onSubmit={onSubmit} className="mt-6 max-w-sm">
        <div
          aria-hidden
          className="mb-4 flex min-h-14 items-center justify-center gap-3 rounded-2xl border-2 border-line bg-white"
        >
          {Array.from({ length: Math.max(4, pin.length) }).map((_, index) => (
            <span
              key={index}
              className={cn("h-3 w-3 rounded-full", index < pin.length ? "bg-forest" : "bg-line")}
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
        {error ? <p className="mt-4 text-lg text-amber-deep">{error}</p> : null}
        <div className="mt-5">
          <button type="submit" disabled={pin.length < 4} className={btn.primary}>
            Unlock admin
          </button>
        </div>
      </form>
    </div>
  );
}
