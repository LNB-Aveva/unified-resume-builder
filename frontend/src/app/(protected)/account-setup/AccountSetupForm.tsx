"use client";

import { useActionState } from "react";
import Link from "next/link";
import { setupAccount } from "@/app/actions/auth";

export default function AccountSetupForm() {
  const [state, action, pending] = useActionState(setupAccount, undefined);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-lg font-bold tracking-tight">R</span>
            </div>
            <span className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              ResumeAI
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Set up your profile
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Tell us a bit about yourself so we can tailor the tools to your job search.
          </p>

          {state?.message && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300">
              {state.message}
            </div>
          )}

          <form action={action} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-2 focus:outline-indigo-600 transition"
                placeholder="Your full name"
              />
              {state?.errors?.fullName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.errors.fullName[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="targetRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Role
              </label>
              <input
                id="targetRole"
                name="targetRole"
                type="text"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-2 focus:outline-indigo-600 transition"
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Industry
              </label>
              <input
                id="industry"
                name="industry"
                type="text"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-2 focus:outline-indigo-600 transition"
                placeholder="e.g. Tech, Finance, Healthcare"
              />
            </div>

            <div>
              <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Years of Experience
              </label>
              <input
                id="yearsExperience"
                name="yearsExperience"
                type="number"
                min="0"
                max="50"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-2 focus:outline-indigo-600 transition"
                placeholder="e.g. 5"
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <div>
                <div className="flex items-start gap-3">
                  <input
                    id="termsAccepted"
                    name="termsAccepted"
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-800"
                  />
                  <label htmlFor="termsAccepted" className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</Link>
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>
                </div>
                {state?.errors?.termsAccepted && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 pl-7">{state.errors.termsAccepted[0]}</p>
                )}
              </div>

              <div>
                <div className="flex items-start gap-3">
                  <input
                    id="newsletterOptIn"
                    name="newsletterOptIn"
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-800"
                  />
                  <label htmlFor="newsletterOptIn" className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Subscribe to ResumeAI updates &mdash; resume tips, ATS guides, and new features
                    <span className="text-gray-500 dark:text-gray-400 ml-1">(optional)</span>
                  </label>
                </div>
                {state?.errors?.newsletterOptIn && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 pl-7">{state.errors.newsletterOptIn[0]}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-white font-medium hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? "Setting up..." : "Continue to Tools"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            <Link href="/tools" className="hover:text-gray-600 dark:hover:text-gray-300 transition">
              Skip for now &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
