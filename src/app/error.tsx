"use client";

import Link from "next/link";
import { btn } from "@/components/ui";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-16 text-center">
      <h1 className="font-serif text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-3 text-lg text-muted">Please try again. The household list is still safe.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" onClick={reset} className={btn.primary}>
          Try again
        </button>
        <Link href="/" className={btn.secondary}>
          Search
        </Link>
      </div>
    </div>
  );
}
