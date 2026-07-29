import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import AnalyzerDemo from "@/app/components/AnalyzerDemo";
import GapAnalysis from "@/app/components/GapAnalysis";
import ComplianceChecker from "@/app/components/ComplianceChecker";
import SummaryGenerator from "@/app/components/SummaryGenerator";
import BulletRewriter from "@/app/components/BulletRewriter";
import CoverLetterGenerator from "@/app/components/CoverLetterGenerator";
import ResumeExporter from "@/app/components/ResumeExporter";
import JobTracker from "@/app/components/JobTracker";
import ThemeToggle from "@/app/components/ThemeToggle";
import UserMenu from "@/app/components/UserMenu";
import InfoTooltip from "@/app/components/InfoTooltip";
import ToolsSidebar from "@/app/components/ToolsSidebar";

export const metadata = {
  title: "Tools",
  description: "Access all 9 free ATS resume tools.",
};

export default async function ToolsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Nav */}
      <nav className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
              <span className="text-white text-sm font-bold tracking-tight">R</span>
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900 dark:text-white tracking-tight">ResumeAI</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/account" className="hover:text-gray-900 dark:hover:text-white transition">
              Account
            </Link>
            <ThemeToggle />
            <UserMenu email={user?.email ?? ""} />
          </div>
        </div>
      </nav>

      {/* Content with sidebar */}
      <div className="mx-auto max-w-7xl px-4 py-12 flex gap-8">
        <ToolsSidebar />

        <main className="flex-1 max-w-5xl space-y-16">
          <div className="text-center mb-8">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Your ATS Toolkit
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              All 9 tools ready to use. Follow the steps or jump to any section.
            </p>
          </div>

          <section id="keyword-extractor" className="scroll-mt-24">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">1</span>
              Extract ATS Keywords
              <InfoTooltip tip="Paste a job description to extract all keywords that ATS systems scan for." />
            </h2>
            <AnalyzerDemo />
          </section>

          <section id="gap-analysis" className="scroll-mt-24">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">2</span>
              Gap Analysis
              <InfoTooltip tip="Compare your resume against the extracted keywords to find gaps." />
            </h2>
            <GapAnalysis />
          </section>

          <section id="compliance-checker" className="scroll-mt-24">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">3</span>
              ATS Compliance Checker
              <InfoTooltip tip="Run 15 formatting checks to ensure your resume passes ATS parsers." />
            </h2>
            <ComplianceChecker />
          </section>

          <section id="summary-generator" className="scroll-mt-24">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">4</span>
              AI Summary Generator
              <InfoTooltip tip="Generate a professional summary tailored to the job you're targeting." />
            </h2>
            <SummaryGenerator />
          </section>

          <section id="cover-letter" className="scroll-mt-24">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">5</span>
              AI Cover Letter
              <InfoTooltip tip="Generate a tailored cover letter based on your resume and the job posting." />
            </h2>
            <CoverLetterGenerator />
          </section>

          <section id="bullet-rewriter" className="scroll-mt-24">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">6</span>
              AI Bullet Rewriter
              <InfoTooltip tip="Transform weak bullet points into strong, quantified achievement statements." />
            </h2>
            <BulletRewriter />
          </section>

          <section id="pdf-export" className="scroll-mt-24">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">7</span>
              PDF Resume Export
              <InfoTooltip tip="Export your resume as an ATS-safe PDF using one of 3 templates." />
            </h2>
            <ResumeExporter />
          </section>

          <section id="job-tracker" className="scroll-mt-24">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">8</span>
              Job Application Tracker
              <InfoTooltip tip="Track all your job applications in one place — save jobs, update status, stay organized." />
            </h2>
            <JobTracker />
          </section>
        </main>
      </div>
    </div>
  );
}
