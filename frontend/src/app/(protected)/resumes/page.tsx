import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { listResumes } from "@/app/actions/resume";
import ThemeToggle from "@/app/components/ThemeToggle";
import UserMenu from "@/app/components/UserMenu";
import ResumeList from "./ResumeList";

export const metadata = {
  title: "My Resumes",
  description: "Manage your saved resumes and versions.",
};

export default async function ResumesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const resumes = await listResumes();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <nav className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
              <span className="text-white text-sm font-bold tracking-tight">R</span>
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              ResumeAI
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/tools" className="hover:text-gray-900 dark:hover:text-white transition">
              Tools
            </Link>
            <Link href="/account" className="hover:text-gray-900 dark:hover:text-white transition">
              Account
            </Link>
            <ThemeToggle />
            <UserMenu email={user?.email ?? ""} />
          </div>
        </div>
      </nav>

      <main id="main-content" className="mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 dark:text-white">
            My Resumes
          </h1>
          <Link
            href="/tools#pdf-export"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.97] transition-all duration-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Resume
          </Link>
        </div>

        <ResumeList initial={resumes} />
      </main>
    </div>
  );
}
