import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import ThemeToggle from "@/app/components/ThemeToggle";
import UserMenu from "@/app/components/UserMenu";
import AccountForm from "./AccountForm";
import DeleteAccountButton from "./DeleteAccountButton";
import ExportDataButton from "./ExportDataButton";

export const metadata = {
  title: "Account",
  description: "Manage your ResumeAI profile and settings.",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Nav */}
      <nav className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
              <span className="text-white text-sm font-bold tracking-tight">R</span>
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900 dark:text-white tracking-tight">ResumeAI</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/tools" className="hover:text-gray-900 dark:hover:text-white transition">
              Tools
            </Link>
            <Link href="/resumes" className="hover:text-gray-900 dark:hover:text-white transition">
              My Resumes
            </Link>
            <ThemeToggle />
            <UserMenu email={user.email ?? ""} />
          </div>
        </div>
      </nav>

      <main id="main-content" className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Account Settings
        </h1>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Email
          </h2>
          <p className="text-gray-900 dark:text-white">{user.email}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Profile
          </h2>
          <AccountForm
            defaultValues={{
              fullName: profile?.full_name ?? "",
              targetRole: profile?.target_role ?? "",
              industry: profile?.industry ?? "",
              yearsExperience: profile?.years_experience?.toString() ?? "",
            }}
          />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mt-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Your Data
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Download the product data linked to your account, including profile and authentication metadata,
            resumes, job tracker entries, shared scores, AI usage records, and browser-only tracker entries.
          </p>
          <ExportDataButton />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-900/50 p-6 mt-6">
          <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-2">
            Danger Zone
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Delete your account and product data from the active database, then clear ResumeAI data stored in this browser.
            Infrastructure logs, security records, backups, and provider records follow the retention periods in our Privacy Policy.
          </p>
          <DeleteAccountButton />
        </div>
      </main>
    </div>
  );
}
