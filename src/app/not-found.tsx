import Link from "next/link";
import { btn } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="font-serif text-3xl font-semibold">Household not found</h1>
      <p className="mt-3 text-lg text-muted">Try another search, or add a new household.</p>
      <Link href="/" className={`${btn.primary} mt-6`}>
        Back to search
      </Link>
    </div>
  );
}
