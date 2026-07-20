import AnalyzerDemo from "./components/AnalyzerDemo";
import GapAnalysis from "./components/GapAnalysis";
import ComplianceChecker from "./components/ComplianceChecker";
import SummaryGenerator from "./components/SummaryGenerator";
import BulletRewriter from "./components/BulletRewriter";
import JobTracker from "./components/JobTracker";
import ResumeExporter from "./components/ResumeExporter";
import CoverLetterGenerator from "./components/CoverLetterGenerator";
import ThemeToggle from "./components/ThemeToggle";
import InfoTooltip from "./components/InfoTooltip";
import AuthGate from "./components/AuthGate";

const faqItems = [
  {
    q: "What is ATS and why do 75% of resumes get rejected before a human reads them?",
    a: "ATS (Applicant Tracking System) is software that companies use to automatically filter resumes before a recruiter ever sees them. It scans for specific keywords from the job description, checks formatting compatibility, and scores candidates. If your resume doesn't include the right keywords or uses incompatible formatting (tables, columns, graphics), it gets filtered out automatically — no matter how qualified you are.",
  },
  {
    q: "How do I know if my resume is ATS-compatible?",
    a: "Use our free ATS Compliance Checker (Step 3 above). It runs 15 formatting checks covering file format, column layout, tables, images, special characters, font readability, section headings, and more. You'll get a scored report showing exactly which rules your resume violates and how to fix them.",
  },
  {
    q: "What keywords should I include in my resume?",
    a: "Paste the job description into our Keyword Extractor (Step 1). Our NLP engine identifies every skill, tool, qualification, and role-specific term that ATS systems are likely scanning for — hard skills, soft skills, certifications, and job title variants. Then use the Gap Analysis (Step 2) to see exactly which of those keywords are missing from your resume.",
  },
  {
    q: "Is ResumeAI really free? Are there any hidden fees or premium tiers?",
    a: "Yes, 100% free. All 9 tools — keyword extractor, gap analysis, ATS compliance checker, AI summary generator, AI cover letter generator, AI bullet rewriter, PDF export, job application tracker, and visual templates — are available with a free account, no credit card, and no usage limits. We keep costs at zero by using free-tier infrastructure and open-source AI models.",
  },
  {
    q: "Do I need to create an account or sign up?",
    a: "Yes, a free account is required to use the tools. Sign up takes 10 seconds with just an email and password. Your resume data is stored securely in your account and syncs across devices.",
  },
  {
    q: "What are the 15 ATS compliance rules you check?",
    a: "We check: single-column layout (no tables or columns), no images or graphics, standard section headings (Experience, Education, Skills), no headers/footers, no text boxes, no special characters in headings, consistent date formatting, standard bullet characters, no colour-coded text, readable font size (10pt+), contact information at the top, no hyperlink-only text, file type compatibility, page margin adequacy, and section order logic. Each rule comes with a pass/fail result and a fix suggestion.",
  },
  {
    q: "How accurate is the ATS match score?",
    a: "Our scoring engine matches the keyword logic used by common ATS platforms: it weights exact keyword matches (hard skills, tools, certifications) most heavily, followed by soft skills and job title alignment. The score is a directional guide — a score above 70% typically means strong keyword alignment. Real ATS systems vary by vendor, so treat the score as a minimum bar, not a guarantee.",
  },
  {
    q: "What PDF resume templates are available?",
    a: "Three ATS-safe single-column templates: Classic (indigo accent with horizontal rules — traditional and widely accepted), Modern (navy header band with teal section accents — clean and contemporary), and Minimal (zero colour, pure black-and-white — maximally conservative, best for strict ATS environments). All three are single-column with no graphics, tables, or special characters that could confuse parsers.",
  },
  {
    q: "Can I use ResumeAI for any industry or job type?",
    a: "Yes. The keyword extractor and gap analysis work for any job description — tech, finance, healthcare, marketing, engineering, sales, legal, and more. The AI models are general-purpose. The only limitation is that the skills database has broader coverage for tech and knowledge-work roles; if you're in a highly specialised trade, manually review the extracted keywords to ensure completeness.",
  },
  {
    q: "Is my resume data private and secure?",
    a: "Your data never leaves your browser unless you explicitly use an AI feature (Summary Generator, Cover Letter, or Bullet Rewriter). For those features, your text is sent to our FastAPI backend and forwarded to HuggingFace's inference API — it is not stored or logged. Job tracker data and resume content you enter into forms are stored only in your browser's localStorage and are never transmitted to our servers.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ResumeAI",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://unified-resume-builder.vercel.app",
  description:
    "Free ATS resume checker and keyword analyzer. Extract ATS keywords, score your resume, " +
    "run 15 compliance checks, generate AI cover letters, rewrite bullets, and export ATS-safe PDFs.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "ATS Keyword Extraction",
    "Resume Gap Analysis",
    "ATS Compliance Checker (15 rules)",
    "AI Professional Summary Generator",
    "AI Cover Letter Generator",
    "AI Bullet Rewriter",
    "PDF Resume Export (3 templates)",
    "Job Application Tracker",
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />

      {/* ── Navigation ── */}
      <nav className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
              <span className="text-white text-sm font-bold tracking-tight">R</span>
            </div>
            <span className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white tracking-tight">ResumeAI</span>
          </a>

          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <a href="#how-it-works" className="hover:text-gray-900 dark:hover:text-white transition">How it works</a>
            <a href="#tools" className="hover:text-gray-900 dark:hover:text-white transition">Tools</a>
            <a href="/blog" className="hover:text-gray-900 dark:hover:text-white transition">Blog</a>
            <a href="#compare" className="hover:text-gray-900 dark:hover:text-white transition">Compare</a>
            <a href="#faq" className="hover:text-gray-900 dark:hover:text-white transition">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href="/sign-in" className="hidden sm:inline-flex text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition font-medium">
              Sign In
            </a>
            <a
              href="/sign-up"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Get Started Free
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-indigo-100/50 dark:bg-indigo-950/30 blur-3xl" />
          <div className="absolute top-[100px] left-[-150px] w-[500px] h-[500px] rounded-full bg-violet-100/40 dark:bg-violet-950/20 blur-3xl animate-float" />
          <div className="absolute top-[50px] right-[-150px] w-[400px] h-[400px] rounded-full bg-blue-100/30 dark:bg-blue-950/15 blur-3xl animate-float-delayed" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                9 Free AI Tools &mdash; No Credit Card Required
              </div>

              <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                <span className="text-gray-900 dark:text-white">Beat ATS Filters.</span>
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">Land More Interviews.</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-xl leading-relaxed">
                75% of resumes are rejected before a human reads them. Our free ATS
                resume checker and 9 AI tools help you match keywords, fix formatting,
                and get seen by recruiters.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <a
                  href="/sign-up"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 dark:shadow-indigo-500/15 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  Create Free Account
                  <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-8 py-4 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
                >
                  See How It Works
                </a>
              </div>

              <div className="flex flex-wrap gap-8">
                {[
                  { n: "9", label: "AI-powered tools" },
                  { n: "15", label: "ATS format checks" },
                  { n: "3", label: "PDF templates" },
                  { n: "100%", label: "free forever" },
                ].map(({ n, label }) => (
                  <div key={label} className="group">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">{n}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ATS Score Preview */}
            <div className="relative hidden lg:block">
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl dark:shadow-gray-900/50 p-6 space-y-5 rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">ATS Analysis Result</span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="relative h-24 w-24 shrink-0">
                    <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-gray-700" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="264" strokeDashoffset="40" strokeLinecap="round" className="text-emerald-500" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">85%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Strong ATS Match</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">23 of 27 keywords found</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Matched Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Python", "React", "AWS", "Docker", "CI/CD", "PostgreSQL", "REST API", "Agile"].map((kw) => (
                      <span key={kw} className="rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">{kw}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Missing &mdash; Add These</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Kubernetes", "Terraform", "GraphQL", "TypeScript"].map((kw) => (
                      <span key={kw} className="rounded-full bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">{kw}</span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">ATS Compliance</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">15/15 passed</span>
                </div>
              </div>

              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-indigo-100 via-violet-50 to-blue-100 dark:from-indigo-950 dark:via-violet-950 dark:to-blue-950 opacity-60 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <section className="border-y border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {[
              {
                label: "Private & Secure",
                icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>,
              },
              {
                label: "AI-Powered Analysis",
                icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" /></svg>,
              },
              {
                label: "Results in Seconds",
                icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>,
              },
              {
                label: "No Usage Limits",
                icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg>,
              },
            ].map(({ label, icon }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="text-indigo-500 dark:text-indigo-400">{icon}</span>
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 sm:py-24 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
              Simple 4-Step Workflow
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Go from job description to optimized resume in minutes. Nine AI tools handle the heavy lifting.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Extract",
                desc: "Paste any job description. Our NLP engine instantly identifies every keyword that ATS filters scan for.",
                tools: "Keyword Extractor",
                gradient: "from-indigo-600 to-violet-600",
                shadow: "shadow-indigo-500/20",
              },
              {
                step: "2",
                title: "Analyze",
                desc: "Upload your resume. See your ATS match score, find missing keywords, and run 15 formatting checks.",
                tools: "Gap Analysis + Compliance Checker",
                gradient: "from-indigo-600 to-violet-600",
                shadow: "shadow-indigo-500/20",
              },
              {
                step: "3",
                title: "Optimize",
                desc: "AI rewrites your bullets, generates cover letters, and creates a professional summary tailored to the role.",
                tools: "Summary + Cover Letter + Rewriter",
                gradient: "from-indigo-600 to-violet-600",
                shadow: "shadow-indigo-500/20",
              },
              {
                step: "4",
                title: "Export & Apply",
                desc: "Download an ATS-safe PDF from 3 templates. Track every application from Saved through Offer.",
                tools: "PDF Export + Job Tracker",
                gradient: "from-emerald-500 to-emerald-600",
                shadow: "shadow-emerald-500/20",
              },
            ].map(({ step, title, desc, tools, gradient, shadow }) => (
              <div key={step} className="group">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg mb-6 shadow-lg ${shadow}`}>
                    {step}
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 flex-1">{desc}</p>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{tools}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why ResumeAI ── */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
              Why Job Seekers Choose ResumeAI
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to beat ATS filters &mdash; completely free, no strings attached.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "100% Free, Forever",
                desc: "No credit card required. No premium tier. No usage limits. All 9 tools are completely free — we keep costs at zero using open-source AI and free-tier infrastructure.",
                icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg>,
              },
              {
                title: "AI-Powered Precision",
                desc: "spaCy NLP extracts every ATS keyword. HuggingFace AI rewrites bullets, generates cover letters, and creates professional summaries — all tailored to your target role.",
                icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" /></svg>,
              },
              {
                title: "Built for ATS",
                desc: "Every tool is designed specifically to help you pass ATS filters. 15 compliance checks ensure your formatting, keywords, and structure meet what automated systems expect.",
                icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>,
              },
            ].map(({ title, desc, icon }) => (
              <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                  {icon}
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools Section Anchor ── */}
      <div id="tools" className="scroll-mt-20" />

      {/* ── Step 1: ATS Keyword Extractor ── */}
      <section id="demo" className="mx-auto max-w-3xl px-4 py-16 scroll-mt-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
            Step 1
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ATS Keyword Extractor &mdash; Try it free
            <InfoTooltip tip="Copy the entire job posting including title, requirements, and responsibilities. More text = better keyword extraction." />
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Paste any job description. Results appear in under 2 seconds.
          </p>
        </div>
        <AuthGate><AnalyzerDemo /></AuthGate>
      </section>

      {/* ── Step 2: Gap Analysis ── */}
      <section className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
              Step 2
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Resume Gap Analysis &mdash; Find Missing Keywords
              <InfoTooltip tip="Use the same job description from Step 1. Paste your full resume as plain text — copy from Word, Google Docs, or PDF." />
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl mx-auto">
              Paste both documents. We&apos;ll show you exactly which keywords
              your resume is missing &mdash; and what to add to pass ATS filters.
            </p>
          </div>
          <AuthGate><GapAnalysis /></AuthGate>
        </div>
      </section>

      {/* ── Step 3: Compliance Checker ── */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
            Step 3
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ATS Compliance Checker &mdash; 15 Format Rules
            <InfoTooltip tip="Checks formatting issues like tables, columns, images, and headers that break ATS parsers. Aim for 15/15 to maximize compatibility." />
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl mx-auto">
            Keywords don&apos;t matter if ATS can&apos;t parse the file. Run 15 formatting
            checks to catch issues before you apply.
          </p>
        </div>
        <AuthGate><ComplianceChecker /></AuthGate>
      </section>

      {/* ── Step 4: AI Summary Generator ── */}
      <section className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
              Step 4
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              AI Professional Summary Generator
              <InfoTooltip tip="Paste 3-5 achievement bullets from your resume. The AI turns them into a 40-60 word professional summary — ideal length for the top of your resume." />
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl mx-auto">
              Paste your experience bullets and the job description &mdash; AI rewrites them into a
              concise, ATS-friendly &quot;About Me&quot; paragraph in seconds.
            </p>
          </div>
          <AuthGate><SummaryGenerator /></AuthGate>
        </div>
      </section>

      {/* ── Step 5: Cover Letter Generator ── */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
            Step 5
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Free AI Cover Letter Generator
            <InfoTooltip tip="Formal tone uses 'Dear Hiring Team' style. Conversational starts with a hook. Keep job description under 900 chars — paste just the key requirements." />
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl mx-auto">
            Paste your key achievements and the job description &mdash; AI writes a personalised
            250&ndash;320 word cover letter. Choose formal or conversational tone.
          </p>
        </div>
        <AuthGate><CoverLetterGenerator /></AuthGate>
      </section>

      {/* ── Step 6: AI Bullet Rewriter ── */}
      <section className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
              Step 6
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              AI Bullet Rewriter &mdash; Add Missing Keywords
              <InfoTooltip tip="Copy the missing keywords from Step 2's gap analysis. Paste your weakest bullets — one per line, up to 5. AI rewrites each to weave in those keywords." />
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl mx-auto">
              Paste up to 5 bullets from your resume and the missing keywords from Step 2.
              AI rewrites each one to naturally include the keywords &mdash; without inventing facts.
            </p>
          </div>
          <AuthGate><BulletRewriter /></AuthGate>
        </div>
      </section>

      {/* ── Step 7: PDF Export ── */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
            Step 7
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Download ATS-Friendly Resume as PDF
            <InfoTooltip tip="All 3 templates are single-column with no graphics — maximally ATS-safe. Paste your AI summary from Step 4 and rewritten bullets from Step 6 for best results." />
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl mx-auto">
            Fill in your details &mdash; paste the AI summary from Step 4 and rewritten
            bullets from Step 6. Downloads as a clean, ATS-friendly PDF.
          </p>
        </div>
        <AuthGate><ResumeExporter /></AuthGate>
      </section>

      {/* ── Step 8: Job Application Tracker ── */}
      <section className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
              Step 8
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Job Application Tracker
              <InfoTooltip tip="Data is stored in your browser's localStorage — nothing is sent to any server. Clear browser data to reset. Works offline too." />
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl mx-auto">
              Save the jobs you&apos;re applying to, track their status, and add notes &mdash; all stored
              securely in your account.
            </p>
          </div>
          <AuthGate><JobTracker /></AuthGate>
        </div>
      </section>

      {/* ── Comparison Section ── */}
      <section id="compare" className="py-20 sm:py-24 scroll-mt-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-4">
              Save $24&ndash;49/month
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
              Everything Paid Tools Offer, for Free
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Other resume tools lock their best features behind a paywall. We don&apos;t.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Feature</th>
                    <th className="px-6 py-4 text-center">
                      <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">ResumeAI</div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Free</div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">Paid Tools</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">$24&ndash;49/mo</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {([
                    ["ATS Keyword Extraction", "included", "included"],
                    ["Resume Gap Analysis", "included", "premium"],
                    ["ATS Compliance (15 checks)", "included", "limited"],
                    ["AI Cover Letter Generator", "included", "premium"],
                    ["AI Bullet Rewriter", "included", "premium"],
                    ["AI Summary Generator", "included", "premium"],
                    ["PDF Export (3 templates)", "included", "premium"],
                    ["Job Application Tracker", "included", "included"],
                    ["Usage Limits", "none", "restricted"],
                  ] as [string, string, string][]).map(([feature, us, them], i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                      <td className="px-6 py-3.5 text-sm text-gray-700 dark:text-gray-200">{feature}</td>
                      <td className="px-6 py-3.5 text-center">
                        {us === "included" ? (
                          <svg className="mx-auto h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        ) : (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Unlimited</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        {them === "included" ? (
                          <svg className="mx-auto h-5 w-5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        ) : them === "restricted" ? (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">Restricted</span>
                        ) : (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">{them === "premium" ? "Premium" : "Limited"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center mt-10">
            <a
              href="/sign-up"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Get All Features Free
              <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-20 sm:py-24 scroll-mt-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Everything you need to know about ATS filters and how ResumeAI works.
            </p>
          </div>
          <dl className="divide-y divide-gray-200 dark:divide-gray-700 space-y-1">
            {faqItems.map(({ q, a }) => (
              <details key={q} className="group py-5 cursor-pointer list-none">
                <summary className="flex items-center justify-between gap-4 font-medium text-gray-900 dark:text-gray-100 text-sm select-none list-none marker:hidden hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors duration-150">
                  {q}
                  <span className="shrink-0 h-5 w-5 text-indigo-600 dark:text-indigo-400 transition-transform duration-200 group-open:rotate-45">
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-7">{a}</p>
              </details>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Ready to beat ATS filters?
          </h2>
          <p className="text-lg text-indigo-100 mb-10 max-w-xl mx-auto">
            Create your free account in 10 seconds. No credit card required.
            No trial that expires. Just 9 AI tools to help you land interviews.
          </p>
          <a
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-indigo-700 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Create Free Account
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <a href="/" className="flex items-center gap-2 mb-4 group">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                  <span className="text-white text-xs font-bold">R</span>
                </div>
                <span className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900 dark:text-white">ResumeAI</span>
              </a>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                Free ATS resume checker with 9 AI tools. Beat the filters, match keywords, and land more interviews.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#tools" className="hover:text-gray-900 dark:hover:text-white transition">ATS Tools</a></li>
                <li><a href="#how-it-works" className="hover:text-gray-900 dark:hover:text-white transition">How It Works</a></li>
                <li><a href="#compare" className="hover:text-gray-900 dark:hover:text-white transition">Free vs Paid</a></li>
                <li><a href="/sign-up" className="hover:text-gray-900 dark:hover:text-white transition">Get Started</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Resources</h4>
              <ul className="space-y-2.5 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="/blog" className="hover:text-gray-900 dark:hover:text-white transition">Blog</a></li>
                <li><a href="#faq" className="hover:text-gray-900 dark:hover:text-white transition">FAQ</a></li>
                <li>
                  <a href="https://github.com/LNB-Aveva/unified-resume-builder" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white transition">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Built With</h4>
              <ul className="space-y-2.5 text-sm text-gray-500 dark:text-gray-400">
                <li>Next.js + Tailwind CSS</li>
                <li>FastAPI + spaCy</li>
                <li>HuggingFace AI</li>
                <li>Supabase Auth</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              &copy; {new Date().getFullYear()} ResumeAI. Open source, 100% free.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Built with open-source AI &mdash; no data is stored or logged.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
