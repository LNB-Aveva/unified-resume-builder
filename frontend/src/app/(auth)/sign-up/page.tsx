"use client";

import { useActionState } from "react";
import { signUp } from "@/app/actions/auth";
import GoogleSignInButton from "@/app/components/GoogleSignInButton";

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signUp, undefined);

  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Create your account
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Free forever. Get your ATS score in seconds.
      </p>

      {state?.message && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300">
          {state.message}
        </div>
      )}

      <GoogleSignInButton />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-gray-900 px-3 text-gray-400 dark:text-gray-500">or sign up with email</span>
        </div>
      </div>

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-2 focus:outline-indigo-600 transition"
            placeholder="you@example.com"
          />
          {state?.errors?.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.errors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
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
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-2 focus:outline-indigo-600 transition"
            placeholder="Re-enter password"
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
          {pending ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{" "}
        <a href="/sign-in" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
          Sign in
        </a>
      </p>
    </>
  );
}
