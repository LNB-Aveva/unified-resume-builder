"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/auth";

interface Props {
  defaultValues: {
    fullName: string;
    targetRole: string;
    industry: string;
    yearsExperience: string;
  };
}

export default function AccountForm({ defaultValues }: Props) {
  const [state, action, pending] = useActionState(updateProfile, undefined);

  return (
    <>
      {state?.message && (
        <div
          className={`mb-4 rounded-lg border p-3 text-sm ${
            state.success
              ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
          }`}
        >
          {state.message}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            maxLength={200}
            defaultValue={defaultValues.fullName}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-2 focus:outline-indigo-600 transition"
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
            maxLength={200}
            defaultValue={defaultValues.targetRole}
            placeholder="e.g. Senior Frontend Engineer"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-2 focus:outline-indigo-600 transition"
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
            maxLength={200}
            defaultValue={defaultValues.industry}
            placeholder="e.g. Tech, Finance, Healthcare"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-2 focus:outline-indigo-600 transition"
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
            defaultValue={defaultValues.yearsExperience}
            placeholder="e.g. 5"
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-2 focus:outline-indigo-600 transition"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-white font-medium hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </>
  );
}
