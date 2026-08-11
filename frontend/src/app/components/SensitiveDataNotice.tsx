import Link from "next/link";

export default function SensitiveDataNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="note"
      className={`rounded-xl border border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100 ${
        compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
      }`}
    >
      <strong>Minimize personal data.</strong> Remove Social Security or government ID numbers,
      financial details, medical or disability information, and anything not needed for the
      requested resume task. AI features send submitted text to the processors described in our{" "}
      <Link href="/privacy" className="font-medium underline underline-offset-2">
        Privacy Policy
      </Link>.
    </div>
  );
}
