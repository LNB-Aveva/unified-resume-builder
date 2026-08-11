"use client";

import { useActionState } from "react";
import { resendVerification } from "@/app/actions/auth";

export default function ResendVerificationForm({ email }: { email?: string }) {
  const [state, action, pending] = useActionState(resendVerification, undefined);

  const isSuccess = state?.message?.includes("sent!");

  return (
    <form action={action} className="space-y-2">
      {email && (
        <input type="hidden" name="email" value={email} />
      )}
      {!email && (
        <input
          name="email"
          type="email"
          required
          placeholder="your@email.com"
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-2 focus:outline-indigo-500"
        />
      )}
      {state?.message && (
        <p className={`text-xs ${isSuccess ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || isSuccess}
        className="w-full rounded-lg border border-indigo-200 bg-indigo-50 dark:bg-indigo-950/40 dark:border-indigo-800 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Sending..." : isSuccess ? "Email sent!" : "Resend confirmation email"}
      </button>
    </form>
  );
}
