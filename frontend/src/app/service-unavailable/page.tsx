import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Service temporarily unavailable — ResumeAI",
  robots: { index: false, follow: false },
};

export default async function ServiceUnavailablePage({
  searchParams,
}: {
  searchParams: Promise<{ retry?: string }>;
}) {
  const { retry } = await searchParams;
  const retryPath = retry?.startsWith("/") && !retry.startsWith("//") ? retry : "/tools";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-6 py-20">
      <section className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-900 dark:bg-amber-950/40">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
          Temporary service interruption
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-950 dark:text-white">
          Your account data is unavailable
        </h1>
        <p className="mt-4 text-sm leading-6 text-gray-700 dark:text-gray-300">
          We could not safely verify your session. No changes were made. Wait a minute and try again.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href={retryPath}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
