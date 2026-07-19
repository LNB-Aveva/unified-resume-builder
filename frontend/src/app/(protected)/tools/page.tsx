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
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
              <span className="text-white text-sm font-bold tracking-tight">R</span>
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900 dark:text-white tracking-tight">ResumeAI</span>
          </a>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <a href="/account" className="hover:text-gray-900 dark:hover:text-white transition">
              Account
            </a>
            <ThemeToggle />
            <UserMenu email={user?.email ?? ""} />
          </div>
        </div>
      </nav>

      {/* Tools */}
      <main className="mx-auto max-w-5xl px-4 py-12 space-y-16">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Your ATS Toolkit
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            All 9 tools ready to use. Scroll through or jump to any section.
          </p>
        </div>

        <section id="keyword-extractor">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            Step 1: Extract ATS Keywords
            <InfoTooltip tip="Paste a job description to extract all keywords that ATS systems scan for." />
          </h2>
          <AnalyzerDemo />
        </section>

        <section id="gap-analysis">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            Step 2: Gap Analysis
            <InfoTooltip tip="Compare your resume against the extracted keywords to find gaps." />
          </h2>
          <GapAnalysis />
        </section>

        <section id="compliance-checker">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            Step 3: ATS Compliance Checker
            <InfoTooltip tip="Run 15 formatting checks to ensure your resume passes ATS parsers." />
          </h2>
          <ComplianceChecker />
        </section>

        <section id="summary-generator">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            Step 4: AI Summary Generator
            <InfoTooltip tip="Generate a professional summary tailored to the job you're targeting." />
          </h2>
          <SummaryGenerator />
        </section>

        <section id="cover-letter">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            Step 5: AI Cover Letter
            <InfoTooltip tip="Generate a tailored cover letter based on your resume and the job posting." />
          </h2>
          <CoverLetterGenerator />
        </section>

        <section id="bullet-rewriter">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            Step 6: AI Bullet Rewriter
            <InfoTooltip tip="Transform weak bullet points into strong, quantified achievement statements." />
          </h2>
          <BulletRewriter />
        </section>

        <section id="pdf-export">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            Step 7: PDF Resume Export
            <InfoTooltip tip="Export your resume as an ATS-safe PDF using one of 3 templates." />
          </h2>
          <ResumeExporter />
        </section>

        <section id="job-tracker">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            Step 8: Job Application Tracker
            <InfoTooltip tip="Track all your job applications in one place — save jobs, update status, stay organized." />
          </h2>
          <JobTracker />
        </section>
      </main>
    </div>
  );
}
