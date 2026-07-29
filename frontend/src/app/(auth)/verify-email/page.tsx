import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
        <svg className="h-7 w-7 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      </div>

      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Check your email
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        We sent you a confirmation link. Click it to activate your account and start using all 9 ATS tools.
      </p>

      <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-600 dark:text-gray-300">
        <p className="mb-2">Didn&apos;t receive an email?</p>
        <ul className="text-left space-y-1 text-gray-500 dark:text-gray-400">
          <li>Check your spam or junk folder</li>
          <li>Make sure you entered the correct email</li>
          <li>Wait a few minutes and try again</li>
        </ul>
      </div>

      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/sign-up" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
          Try with a different email
        </Link>
      </p>
    </div>
  );
}
