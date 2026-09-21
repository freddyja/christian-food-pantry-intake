import type { ReactNode } from "react";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const btn = {
  primary: cn(
    "inline-flex items-center justify-center gap-2 min-h-14 px-6 rounded-2xl",
    "bg-forest text-white text-lg font-semibold shadow-sm",
    "hover:bg-forest-dark transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest",
    "disabled:opacity-50 disabled:pointer-events-none",
  ),
  secondary: cn(
    "inline-flex items-center justify-center gap-2 min-h-14 px-6 rounded-2xl",
    "border-2 border-line bg-white text-ink text-lg font-semibold",
    "hover:bg-paper transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest",
    "disabled:opacity-50 disabled:pointer-events-none",
  ),
  amber: cn(
    "inline-flex items-center justify-center gap-2 min-h-14 px-6 rounded-2xl",
    "bg-amber-deep text-white text-lg font-semibold shadow-sm",
    "hover:bg-[#6d4a1f] transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-deep",
    "disabled:opacity-50 disabled:pointer-events-none",
  ),
  ghost: cn(
    "inline-flex items-center justify-center gap-2 min-h-11 px-3 rounded-xl",
    "text-forest text-lg font-semibold hover:bg-leaf transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest",
  ),
};

export const fieldClass = cn(
  "w-full min-h-14 rounded-2xl border-2 border-line bg-white px-4 py-3 text-lg text-ink",
  "placeholder:text-muted/70",
  "focus:border-forest focus:outline-none focus:ring-4 focus:ring-leaf",
);

export function Label({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-lg font-semibold text-ink">
      {children}
    </label>
  );
}
