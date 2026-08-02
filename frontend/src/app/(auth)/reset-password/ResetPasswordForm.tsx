"use client";

import { useActionState } from "react";
import { resetPassword } from "@/app/actions/auth";

export default function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPassword, undefined);

  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Set a new password
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Choose a strong password for your account.
      </p>

      {state?.message && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300">
          {state.message}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-2 focus:outline-indigo-600 transition"
            placeholder="At least 8 characters"
          />
          {state?.errors?.password && (
            <ul className="mt-1 text-sm text-red-600 dark:text-red-400 space-y-0.5">
              {state.errors.password.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-2 focus:outline-indigo-600 transition"
            placeholder="Re-enter new password"
          />
          {state?.errors?.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.errors.confirmPassword[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-white font-medium hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "Updating..." : "Update Password"}
        </button>
      </form>
    </>
  );
}
