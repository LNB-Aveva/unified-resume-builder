import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account Service Unavailable — ResumeAI",
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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <section className="w-full max-w-lg rounded-2xl border border-amber-200 dark:border-amber-900 bg-white dark:bg-gray-900 p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Account data is temporarily unavailable
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          We could not verify your session with the account service. No changes were made.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">
          Wait a moment and try again. If this continues, contact support@resumeai.cv.
        </p>
        <Link
          href={retryPath}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Try again
        </Link>
      </section>
    </main>
  );
}
