import Link from "next/link";
import { cn } from "@/components/ui";

export function AppShell({
  children,
  wide,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-full">
      <div className={cn("mx-auto w-full px-4 py-5 sm:px-6 sm:py-8", wide ? "max-w-4xl" : "max-w-3xl")}>
        {children}
      </div>
    </div>
  );
}

export function BrandMark({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="grid h-11 w-11 place-items-center rounded-2xl bg-forest text-white shadow-sm"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 14c2.5-1 4.5-4.5 8-4.5S17.5 13 20 14" strokeLinecap="round" />
          <path d="M5 17.5h14c0 2.2-3.1 3.5-7 3.5s-7-1.3-7-3.5Z" />
          <path d="M12 5.5c.8 1.6.8 3.2 0 4.8" strokeLinecap="round" />
        </svg>
      </span>
      <div className="min-w-0">
        <p className={cn("font-serif font-semibold leading-snug tracking-tight text-ink", compact ? "text-xl" : "text-2xl")}>
          Shady Hills Mission Chapel
        </p>
        <p className={cn("text-muted", compact ? "mt-0.5 text-base" : "mt-1 text-lg")}>
          Pantry Check-in
        </p>
      </div>
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center gap-1 text-lg font-semibold text-forest">
      <span aria-hidden>←</span> {children}
    </Link>
  );
}

export function SuccessBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="status"
      className="mb-5 rounded-2xl border border-forest/20 bg-leaf px-4 py-3 text-lg text-forest-dark"
    >
      {children}
    </div>
  );
}
