import Link from "next/link";
import dynamic from "next/dynamic";
import ThemeToggle from "./components/ThemeToggle";
import MobileNav from "./components/MobileNav";
import ScrollReveal from "./components/ScrollReveal";
import StickyBottomCTA from "./components/StickyBottomCTA";
import TypewriterHeadline from "./components/TypewriterHeadline";
import AnimatedCounter from "./components/AnimatedCounter";
import HeroScoreCard from "./components/HeroScoreCard";
import { CookieSettingsButton } from "./components/CookieConsent";

const AnalyzerDemo = dynamic(() => import("./components/AnalyzerDemo"), {
  loading: () => <div className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-xl h-64" />,
});
const BulletPreviewWidget = dynamic(() => import("./components/BulletPreviewWidget"), {
  loading: () => <div className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-xl h-48" />,
});
const ShareableScoreWidget = dynamic(() => import("./components/ShareableScoreWidget"), {
  loading: () => <div className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-xl h-64" />,
});

const PREVIEW_SKILLS = ["Python", "React", "AWS", "Docker"];

const faqItems = [
  {
    q: "What is ATS and why do 75% of resumes get rejected before a human reads them?",
    a: "ATS (Applicant Tracking System) is software that companies use to automatically filter resumes before a recruiter ever sees them. It scans for specific keywords from the job description, checks formatting compatibility, and scores candidates. If your resume doesn't include the right keywords or uses incompatible formatting (tables, columns, graphics), it gets filtered out automatically — no matter how qualified you are.",
  },
  {
    q: "How do I know if my resume is ATS-compatible?",
    a: "Use our free ATS Compliance Checker (Tool 3). It runs 15 formatting checks covering file format, column layout, tables, images, special characters, font readability, section headings, and more. You'll get a scored report showing exactly which rules your resume violates and how to fix them.",
  },
  {
    q: "What keywords should I include in my resume?",
    a: "Paste the job description into our Keyword Extractor (Tool 1). Our NLP engine identifies every skill, tool, qualification, and role-specific term that ATS systems are likely scanning for — hard skills, soft skills, certifications, and job title variants. Then use the Gap Analysis (Tool 2) to see exactly which of those keywords are missing from your resume.",
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
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://resumeai.cv",
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

const tools = [
  {
    step: "1",
    title: "Find Every Keyword ATS Scans For",
    desc: "Paste any job description. Our NLP engine instantly identifies every hard skill, soft skill, certification, and job-specific term that ATS filters scan for.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
    color: "indigo",
    href: "/keyword-analyzer",
  },
  {
    step: "2",
    title: "See Exactly What Your Resume Is Missing",
    desc: "Upload your resume against any job description. See your ATS match score and a list of every missing keyword you need to add.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    color: "violet",
  },
  {
    step: "3",
    title: "Know If Your Resume Will Pass ATS",
    desc: "Run 15 formatting checks — tables, columns, images, headers, fonts, margins, and more. Fix every issue before ATS rejects your resume.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    color: "emerald",
  },
  {
    step: "4",
    title: "Get a Professional Summary in Seconds",
    desc: "Paste your experience bullets and the job description. AI writes a concise, ATS-friendly professional summary in seconds.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
      </svg>
    ),
    color: "indigo",
  },
  {
    step: "5",
    title: "Generate a Tailored Cover Letter",
    desc: "Generate a personalised 250-320 word cover letter tailored to the role. Choose formal or conversational tone.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
    color: "violet",
  },
  {
    step: "6",
    title: "Turn Weak Bullets Into Strong Ones",
    desc: "Paste weak bullets and missing keywords. AI rewrites each one to naturally weave in ATS keywords — without inventing facts.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
    ),
    color: "emerald",
  },
  {
    step: "7",
    title: "Download Your ATS-Safe Resume",
    desc: "Download your resume as an ATS-safe PDF. Three clean templates — Classic, Modern, and Minimal. No watermarks, no limits.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    color: "indigo",
  },
  {
    step: "8",
    title: "Track Every Application in One Place",
    desc: "Save every job you apply to, track status from Saved to Offer, add notes and links. Everything syncs to your account.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
      </svg>
    ),
    color: "violet",
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    border: "border-indigo-100 dark:border-indigo-800/50",
    text: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/50",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-100 dark:border-violet-800/50",
    text: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-100 dark:bg-violet-900/50",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-100 dark:border-emerald-800/50",
    text: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
  },
};

const testimonials = [
  {
    name: "Sarah M.",
    role: "Marketing Manager",
    text: "I went from a 42% ATS match score to 89% in under 10 minutes. Got three interview callbacks within a week of updating my resume.",
    source: "Product Hunt",
    date: "2 weeks ago",
  },
  {
    name: "James L.",
    role: "Software Engineer",
    text: "The keyword extractor found 12 skills I was missing from my resume. The AI bullet rewriter saved me hours of rewriting. Best free tool I've used.",
    source: "Reddit",
    date: "1 week ago",
  },
  {
    name: "Priya K.",
    role: "Data Analyst",
    text: "I was paying $29/month for a resume tool that does less than this. The compliance checker caught formatting issues I never knew existed.",
    source: "LinkedIn",
    date: "3 days ago",
  },
];

function SourceBadge({ source }: { source: string }) {
  const meta: Record<string, { color: string; label: string }> = {
    "Product Hunt": { color: "#DA552F", label: "P" },
    "Reddit":       { color: "#FF4500", label: "R" },
    "LinkedIn":     { color: "#0A66C2", label: "in" },
  };
  const m = meta[source];
  return (
    <div className="flex items-center gap-1.5">
      {m && (
        <span
          className="h-4 w-4 rounded-sm flex items-center justify-center text-[8px] font-bold text-white leading-none shrink-0"
          style={{ backgroundColor: m.color }}
        >
          {m.label}
        </span>
      )}
      <span className="text-xs font-medium text-gray-500 dark:text-gray-500">via {source}</span>
    </div>
  );
}

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
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
              <span className="text-white text-sm font-bold tracking-tight">R</span>
            </div>
            <span className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white tracking-tight">ResumeAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <a href="#how-it-works" className="hover:text-gray-900 dark:hover:text-white transition">How it works</a>
            <a href="#tools" className="hover:text-gray-900 dark:hover:text-white transition">Tools</a>
            <Link href="/blog" className="hover:text-gray-900 dark:hover:text-white transition">Blog</Link>
            <a href="#compare" className="hover:text-gray-900 dark:hover:text-white transition">Compare</a>
            <a href="#faq" className="hover:text-gray-900 dark:hover:text-white transition">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/sign-in" className="hidden sm:inline-flex text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition font-medium">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="hidden sm:inline-flex rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.97] transition-all duration-200"
            >
              Get Started Free
            </Link>
            <MobileNav />
          </div>
        </div>
      </nav>

      <StickyBottomCTA />

      <main id="main-content">
      {/* ── Hero ── */}
      <section id="hero" className="relative overflow-hidden">
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
                <TypewriterHeadline />
              </h1>

              <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-xl leading-relaxed">
                75% of resumes are rejected before a human reads them. Our free ATS
                resume checker and 9 AI tools help you match keywords, fix formatting,
                and get seen by recruiters.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a
                  href="/sign-up"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 dark:shadow-indigo-500/15 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.97] transition-all duration-200"
                >
                  Create Free Account
                  <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </a>
                <a
                  href="#demo"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-8 py-4 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
                >
                  Analyze My Resume Free
                  <svg className="h-4 w-4 text-indigo-500 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                  </svg>
                </a>
              </div>

              <div className="flex items-center gap-3 mb-10">
                <div className="flex -space-x-2">
                  {["S", "J", "P", "A", "M"].map((initial, i) => (
                    <div key={i} className={`h-8 w-8 rounded-full border-2 border-white dark:border-gray-950 flex items-center justify-center text-white text-xs font-bold ${
                      ["bg-indigo-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"][i]
                    }`}>
                      {initial}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">Loved by 500+ job seekers</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:flex sm:flex-wrap sm:gap-8">
                <div className="group">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                    <AnimatedCounter target={2400} suffix="+" locale />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">resumes optimized</div>
                </div>
                <div className="group">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                    <AnimatedCounter target={9} />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">AI-powered tools</div>
                </div>
                <div className="group">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                    <AnimatedCounter target={15} />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ATS format checks</div>
                </div>
                <div className="group">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                    <AnimatedCounter target={100} suffix="%" />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">free forever</div>
                </div>
              </div>
            </div>

            {/* ATS Score Preview */}
            <HeroScoreCard />
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
              {
                label: "Open-Source AI",
                icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" /></svg>,
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

      {/* ── Live Demo ── */}
      <section id="demo" className="py-20 sm:py-24 scroll-mt-20" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 700px" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Demo &mdash; No Account Needed
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
              Try the ATS Keyword Extractor Free
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Paste any job description below. Our NLP engine instantly pulls every keyword ATS systems scan for &mdash; hard skills, soft skills, certifications, and tools.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 sm:p-8">
            <AnalyzerDemo publicMode={true} />
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Want the full analysis? Gap scoring, compliance checks, AI rewrites, and PDF export are all free with an account.
            </p>
            <a
              href="/sign-up"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.97] transition-all duration-200"
            >
              Get Full ATS Analysis Free
              <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── Bullet Rewriter Preview ── */}
      <section className="py-20 sm:py-24 bg-gray-50/50 dark:bg-gray-900/30" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 600px" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-800 px-4 py-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
              Live Preview &mdash; No Signup Needed
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
              Watch AI Strengthen Your Bullet
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Paste a weak resume bullet. Our AI rewrites it with a stronger action verb and tighter phrasing &mdash; live, in seconds, before you sign up.
            </p>
          </div>

          <BulletPreviewWidget />
        </div>
      </section>

      {/* ── Shareable ATS Score ── */}
      <section className="py-20 sm:py-24" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 700px" }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              New &mdash; Share Your Score
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
              Get a Shareable ATS Score Link
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Paste your job description and resume. We score your keyword match and generate a permanent link you can share with mentors, recruiters, or career coaches &mdash; no sign-up required.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 sm:p-8">
            <ShareableScoreWidget />
          </div>

          <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-5">
            Your resume text is never stored &mdash; only the score and keyword lists are saved. Links expire after 30 days.
          </p>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <ScrollReveal>
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
                Trusted by Job Seekers Worldwide
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Real results from people who used ResumeAI to beat ATS filters and land interviews.
              </p>
            </div>

            {/* Before / After proof */}
            <div className="mb-12 mx-auto max-w-2xl">
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                  {/* Before */}
                  <div className="flex-1 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Before</p>
                    <div className="relative mx-auto h-24 w-24">
                      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-red-400 dark:stroke-red-500" strokeWidth="3" strokeDasharray="97.4" strokeDashoffset={97.4 * (1 - 0.42)} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-red-500 dark:text-red-400">42%</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">ATS Match Score</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="h-px w-8 bg-gradient-to-r from-red-300 to-emerald-300 dark:from-red-600 dark:to-emerald-600 hidden sm:block" />
                      <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm">
                        <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400 rotate-90 sm:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </div>
                      <div className="h-px w-8 bg-gradient-to-r from-emerald-300 to-emerald-300 dark:from-emerald-600 dark:to-emerald-600 hidden sm:block" />
                    </div>
                    <p className="text-[10px] text-center text-indigo-600 dark:text-indigo-400 font-semibold mt-1">&lt; 10 min</p>
                  </div>

                  {/* After */}
                  <div className="flex-1 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">After</p>
                    <div className="relative mx-auto h-24 w-24">
                      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-emerald-500 dark:stroke-emerald-400" strokeWidth="3" strokeDasharray="97.4" strokeDashoffset={97.4 * (1 - 0.89)} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-emerald-600 dark:text-emerald-400">89%</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">ATS Match Score</p>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-6">
                  Average improvement after using ResumeAI&apos;s keyword analysis and gap fixer
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map(({ name, role, text, source, date }) => (
                <div key={name} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-400">{date}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    &ldquo;{text}&rdquo;
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                        {name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
                      </div>
                    </div>
                    <SourceBadge source={source} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Who Uses ResumeAI ── */}
      <ScrollReveal>
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
                Built for Every Stage of Your Job Search
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Whether you&apos;re switching careers, landing your first role, or competing in a keyword-dense field &mdash; the same free tools work for you.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Link href="/resume-checker-for-career-changers" className="group block rounded-2xl border border-indigo-100 dark:border-indigo-800/50 bg-indigo-50/50 dark:bg-indigo-950/20 p-8 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all duration-200">
                <div className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-5 uppercase tracking-wider">
                  Switching Industries
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Make transferable skills visible to ATS
                </h3>
                <ul className="space-y-3 mb-6">
                  {[
                    "Gap analysis shows which new-field keywords are missing from your current resume",
                    "AI bullet rewriter translates your experience into the target industry’s language",
                    "Keyword extractor decodes exactly what ATS scans for in your new field",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      <svg className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:gap-2.5 transition-all duration-200">
                  Career changers guide
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                </span>
              </Link>

              <Link href="/ats-checker-for-new-grads" className="group block rounded-2xl border border-violet-100 dark:border-violet-800/50 bg-violet-50/50 dark:bg-violet-950/20 p-8 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-md transition-all duration-200">
                <div className="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/50 px-3 py-1 text-xs font-bold text-violet-700 dark:text-violet-300 mb-5 uppercase tracking-wider">
                  New Grads &amp; First Jobs
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Start with an ATS-ready resume from day one
                </h3>
                <ul className="space-y-3 mb-6">
                  {[
                    "Keyword extractor shows exactly what skills entry-level roles expect",
                    "ATS compliance checker ensures formatting passes automated filters before a recruiter sees it",
                    "AI summary generator writes a professional summary even without years of experience",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      <svg className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 dark:text-violet-400 group-hover:gap-2.5 transition-all duration-200">
                  New grads guide
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                </span>
              </Link>

              <Link href="/resume-checker-for-tech-jobs" className="group block rounded-2xl border border-emerald-100 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-8 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md transition-all duration-200">
                <div className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-5 uppercase tracking-wider">
                  Engineering &amp; Tech
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Tech job descriptions are keyword-dense &mdash; don&apos;t miss any
                </h3>
                <ul className="space-y-3 mb-6">
                  {[
                    "NLP engine extracts frameworks, cloud platforms, and certification variants from any JD",
                    "Gap analysis compares your stack against the role’s exact requirements",
                    "AI bullet rewriter weaves missing tools into your experience without inventing facts",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      <svg className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 group-hover:gap-2.5 transition-all duration-200">
                  Tech jobs guide
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                </span>
              </Link>
            </div>

            <div className="text-center mt-12">
              <Link
                href="/sign-up"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.97] transition-all duration-200"
              >
                Get Started Free &mdash; All 9 Tools
                <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── How It Works ── */}
      <ScrollReveal>
        <section id="how-it-works" className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-20 sm:py-24 scroll-mt-20">
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
              ].map(({ step, title, desc, tools: toolNames, gradient, shadow }) => (
                <div key={step} className="group">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg mb-6 shadow-lg ${shadow}`}>
                      {step}
                    </div>
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 flex-1">{desc}</p>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{toolNames}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Comparison Section ── */}
      <ScrollReveal>
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
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">$24&ndash;49/mo</div>
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
                    ] as [string, string, string][]).map(([feature, us, them]) => (
                      <tr key={feature} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
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
                            <svg className="mx-auto h-5 w-5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
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
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.97] transition-all duration-200"
              >
                Get All Features Free
                <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </a>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Tool Showcase ── */}
      <ScrollReveal>
        <section id="tools" className="py-20 sm:py-24 scroll-mt-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
                All 9 Tools Included Free
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
                Your Complete ATS Toolkit
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Everything you need to optimize your resume, generate cover letters, and track applications &mdash; powered by AI.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {tools.map(({ step, title, desc, icon, color, href }) => {
                const c = colorMap[color];
                return (
                  <a
                    key={step}
                    href={href ?? "/sign-up"}
                    className={`group relative rounded-2xl border ${c.border} ${c.bg} p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`h-10 w-10 rounded-xl ${c.iconBg} flex items-center justify-center ${c.text}`}>
                        {icon}
                      </div>
                      <span className={`text-xs font-bold ${c.text} uppercase tracking-wider`}>Step {step}</span>
                    </div>
                    <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                  </a>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <a
                href="/sign-up"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.97] transition-all duration-200"
              >
                Try All 9 Tools Free
                <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Before & After ── */}
      <ScrollReveal>
        <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
                See the Difference
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                A real resume transformation using ResumeAI&apos;s tools. From ignored by ATS to interview-ready.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Before */}
              <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-gray-800 p-8 relative">
                <div className="absolute -top-3 left-6">
                  <span className="rounded-full bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-1 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                    Before
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-6 mt-2">
                  <div className="relative h-16 w-16 shrink-0">
                    <svg className="h-16 w-16 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-gray-700" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="264" strokeDashoffset="152" strokeLinecap="round" className="text-red-400" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-red-500">42%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">Weak ATS Match</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">11 of 27 keywords found</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-start gap-2">
                    <svg className="h-4 w-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    <span>16 missing keywords from job description</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="h-4 w-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    <span>Tables and columns break ATS parsing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="h-4 w-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    <span>Generic bullets with no measurable impact</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="h-4 w-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    <span>No professional summary section</span>
                  </div>
                </div>
              </div>

              {/* After */}
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-gray-800 p-8 relative">
                <div className="absolute -top-3 left-6">
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-4 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    After
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-6 mt-2">
                  <div className="relative h-16 w-16 shrink-0">
                    <svg className="h-16 w-16 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-gray-700" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="264" strokeDashoffset="29" strokeLinecap="round" className="text-emerald-500" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-emerald-500">89%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Strong ATS Match</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">24 of 27 keywords found</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-start gap-2">
                    <svg className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    <span>24 keywords matched to job description</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    <span>15/15 ATS compliance checks passed</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    <span>AI-rewritten bullets with quantified results</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    <span>Tailored professional summary generated</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-10">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                This transformation took under 10 minutes using ResumeAI&apos;s free tools.
              </p>
              <a
                href="/sign-up"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                Optimize your resume now
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </a>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Template Gallery ── */}
      <ScrollReveal>
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
                ATS-Safe Templates
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
                Three Professional Templates
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Every template is single-column, zero-graphics, and verified to pass ATS parsers. No watermarks.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  name: "Classic",
                  desc: "Indigo accent with horizontal rules. Traditional, widely accepted across all industries.",
                },
                {
                  name: "Modern",
                  desc: "Navy header band with teal section accents. Clean, contemporary, and professional.",
                },
                {
                  name: "Minimal",
                  desc: "Pure black-and-white. Zero colour. Maximally conservative for strict ATS environments.",
                },
              ].map(({ name, desc }) => (
                <div key={name} className="group">
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    {/* Mini template preview — always light, mimics printed PDF */}
                    <div className="aspect-[8.5/11] p-3 bg-gray-100 dark:bg-gray-900 relative">
                      <div className="h-full rounded border border-gray-200 bg-white overflow-hidden flex flex-col">

                        {name === "Classic" && (
                          <>
                            <div className="px-2.5 pt-2.5 pb-1.5 shrink-0">
                              <p className="text-[8px] font-bold text-indigo-700 leading-none tracking-tight">ALEX JOHNSON</p>
                              <p className="text-[5.5px] text-gray-600 mt-0.5 leading-none">Senior Software Engineer</p>
                              <p className="text-[4.5px] text-gray-400 mt-0.5 leading-none">alex@email.com · (555) 123-4567 · New York, NY</p>
                              <div className="h-[1.5px] bg-indigo-600 mt-1.5 rounded" />
                            </div>
                            <div className="px-2.5 pb-2 flex-1 space-y-1.5">
                              <p className="text-[5.5px] font-bold text-indigo-600 uppercase tracking-widest">Experience</p>
                              <div>
                                <p className="text-[5px] font-semibold text-gray-800 leading-none">Senior Engineer · TechCorp</p>
                                <p className="text-[4px] text-gray-400 mt-0.5 mb-1 leading-none">2021 – Present</p>
                                <div className="space-y-[2px]">
                                  <div className="h-[2px] bg-gray-200 rounded w-full" />
                                  <div className="h-[2px] bg-gray-200 rounded w-5/6" />
                                  <div className="h-[2px] bg-gray-200 rounded w-4/5" />
                                </div>
                              </div>
                              <div className="h-[1.5px] bg-indigo-600 rounded opacity-30" />
                              <p className="text-[5.5px] font-bold text-indigo-600 uppercase tracking-widest">Education</p>
                              <div>
                                <p className="text-[5px] font-semibold text-gray-800 leading-none">B.S. Computer Science · MIT</p>
                                <p className="text-[4px] text-gray-400 mt-0.5 mb-1 leading-none">2017 – 2021</p>
                                <div className="space-y-[2px]">
                                  <div className="h-[2px] bg-gray-200 rounded w-3/4" />
                                  <div className="h-[2px] bg-gray-200 rounded w-2/3" />
                                </div>
                              </div>
                              <div className="h-[1.5px] bg-indigo-600 rounded opacity-30" />
                              <p className="text-[5.5px] font-bold text-indigo-600 uppercase tracking-widest">Skills</p>
                              <div className="flex flex-wrap gap-[2px]">
                                {PREVIEW_SKILLS.map((s) => (
                                  <span key={s} className="text-[3.5px] bg-indigo-50 text-indigo-700 px-[2px] py-px rounded">{s}</span>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {name === "Modern" && (
                          <>
                            <div className="bg-slate-800 px-2.5 py-2 shrink-0">
                              <p className="text-[8px] font-bold text-white leading-none tracking-tight">ALEX JOHNSON</p>
                              <p className="text-[5.5px] text-slate-300 mt-0.5 leading-none">Senior Software Engineer</p>
                              <p className="text-[4.5px] text-slate-400 mt-0.5 leading-none">alex@email.com · (555) 123-4567</p>
                            </div>
                            <div className="px-2.5 pt-1.5 pb-2 flex-1 space-y-1.5">
                              <div>
                                <p className="text-[5.5px] font-bold text-teal-700 uppercase tracking-widest">Experience</p>
                                <div className="h-[1.5px] bg-teal-600 rounded opacity-50 mb-1" />
                                <p className="text-[5px] font-semibold text-gray-800 leading-none">Senior Engineer · TechCorp</p>
                                <p className="text-[4px] text-gray-400 mt-0.5 mb-1 leading-none">2021 – Present</p>
                                <div className="space-y-[2px]">
                                  <div className="h-[2px] bg-gray-200 rounded w-full" />
                                  <div className="h-[2px] bg-gray-200 rounded w-5/6" />
                                  <div className="h-[2px] bg-gray-200 rounded w-4/5" />
                                </div>
                              </div>
                              <div>
                                <p className="text-[5.5px] font-bold text-teal-700 uppercase tracking-widest">Education</p>
                                <div className="h-[1.5px] bg-teal-600 rounded opacity-50 mb-1" />
                                <p className="text-[5px] font-semibold text-gray-800 leading-none">B.S. Computer Science · MIT</p>
                                <p className="text-[4px] text-gray-400 mt-0.5 mb-1 leading-none">2017 – 2021</p>
                                <div className="space-y-[2px]">
                                  <div className="h-[2px] bg-gray-200 rounded w-3/4" />
                                  <div className="h-[2px] bg-gray-200 rounded w-2/3" />
                                </div>
                              </div>
                              <div>
                                <p className="text-[5.5px] font-bold text-teal-700 uppercase tracking-widest">Skills</p>
                                <div className="h-[1.5px] bg-teal-600 rounded opacity-50 mb-1" />
                                <div className="flex flex-wrap gap-[2px]">
                                  {PREVIEW_SKILLS.map((s) => (
                                    <span key={s} className="text-[3.5px] bg-teal-50 text-teal-700 px-[2px] py-px rounded">{s}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {name === "Minimal" && (
                          <>
                            <div className="px-2.5 pt-2.5 pb-1.5 shrink-0">
                              <p className="text-[8px] font-bold text-gray-900 leading-none tracking-tight">ALEX JOHNSON</p>
                              <p className="text-[5.5px] text-gray-600 mt-0.5 leading-none">Senior Software Engineer</p>
                              <p className="text-[4.5px] text-gray-500 mt-0.5 leading-none">alex@email.com · (555) 123-4567 · New York, NY</p>
                              <div className="h-[1.5px] bg-gray-900 mt-1.5 rounded" />
                            </div>
                            <div className="px-2.5 pb-2 flex-1 space-y-1.5">
                              <p className="text-[5.5px] font-bold text-gray-900 uppercase tracking-widest">Experience</p>
                              <div>
                                <p className="text-[5px] font-semibold text-gray-800 leading-none">Senior Engineer · TechCorp</p>
                                <p className="text-[4px] text-gray-500 mt-0.5 mb-1 leading-none">2021 – Present</p>
                                <div className="space-y-[2px]">
                                  <div className="h-[2px] bg-gray-200 rounded w-full" />
                                  <div className="h-[2px] bg-gray-200 rounded w-5/6" />
                                  <div className="h-[2px] bg-gray-200 rounded w-4/5" />
                                </div>
                              </div>
                              <div className="h-[1.5px] bg-gray-300 rounded" />
                              <p className="text-[5.5px] font-bold text-gray-900 uppercase tracking-widest">Education</p>
                              <div>
                                <p className="text-[5px] font-semibold text-gray-800 leading-none">B.S. Computer Science · MIT</p>
                                <p className="text-[4px] text-gray-500 mt-0.5 mb-1 leading-none">2017 – 2021</p>
                                <div className="space-y-[2px]">
                                  <div className="h-[2px] bg-gray-200 rounded w-3/4" />
                                  <div className="h-[2px] bg-gray-200 rounded w-2/3" />
                                </div>
                              </div>
                              <div className="h-[1.5px] bg-gray-300 rounded" />
                              <p className="text-[5.5px] font-bold text-gray-900 uppercase tracking-widest">Skills</p>
                              <div className="flex flex-wrap gap-[2px]">
                                {PREVIEW_SKILLS.map((s) => (
                                  <span key={s} className="text-[3.5px] bg-gray-100 text-gray-700 px-[2px] py-px rounded border border-gray-200">{s}</span>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-gray-900 dark:text-white mb-1">{name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <a
                href="/sign-up"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.97] transition-all duration-200"
              >
                Download Your Resume as PDF — Free
                <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </a>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Why ResumeAI ── */}
      <ScrollReveal>
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

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "100% Free, Forever",
                  desc: "No credit card required. No premium tier. No usage limits. All 9 tools are completely free — we keep costs at zero using open-source AI and free-tier infrastructure.",
                  icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg>,
                },
                {
                  title: "AI-Powered Precision",
                  desc: "A curated skill taxonomy with synonym matching extracts every ATS keyword. HuggingFace AI rewrites bullets, generates cover letters, and creates professional summaries — all tailored to your target role.",
                  icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" /></svg>,
                },
                {
                  title: "Built for ATS",
                  desc: "Every tool is designed specifically to help you pass ATS filters. 15 compliance checks ensure your formatting, keywords, and structure meet what automated systems expect.",
                  icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>,
                },
                {
                  title: "No Black Boxes.",
                  desc: "We use a transparent skill taxonomy and HuggingFace — well-documented, open-source AI. We don't store your resume or log your data. Every score is calculated from documented rules you can verify.",
                  icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" /></svg>,
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
      </ScrollReveal>

      {/* ── Privacy & Trust ── */}
      <ScrollReveal>
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
                Private by Design
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
                Your Resume Data Is Yours
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                You shouldn&apos;t have to take our word for it. Every claim below is verifiable.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Stays in your browser",
                  desc: "The Job Tracker and your resume draft live in your browser's localStorage. No account data syncs to our servers unless you explicitly sign in.",
                  icon: (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
                    </svg>
                  ),
                },
                {
                  title: "AI features: sent, never stored",
                  desc: "When you use the AI summary, cover letter, or bullet rewriter, your text is forwarded to HuggingFace’s API and immediately discarded — nothing is logged or retained.",
                  icon: (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                  ),
                },
                {
                  title: "No resume stored in our database",
                  desc: "Your resume content is never stored in our database. AI features forward your text to HuggingFace's API and immediately discard it — nothing is retained on our servers.",
                  icon: (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                    </svg>
                  ),
                },
                {
                  title: "No ads. No data sold. Ever.",
                  desc: "We’re free because we use open-source AI and free-tier infrastructure — not because we monetise your data. There’s no business model that benefits from knowing what’s on your resume.",
                  icon: (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  ),
                },
              ].map(({ title, desc, icon }) => (
                <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-5">
                    {icon}
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── FAQ ── */}
      <ScrollReveal>
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
            <div className="divide-y divide-gray-200 dark:divide-gray-700 space-y-1">
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
            </div>
          </div>
        </section>
      </ScrollReveal>

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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-indigo-700 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.97] transition-all duration-200"
          >
            Create Free Account
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
          </a>
        </div>
      </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
            <div className="sm:col-span-2 lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4 group">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                  <span className="text-white text-xs font-bold">R</span>
                </div>
                <span className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-900 dark:text-white">ResumeAI</span>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mb-3">
                Free ATS resume checker with 9 AI tools. Beat the filters, match keywords, and land more interviews.
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-6">
                Helping 500+ job seekers optimize their resumes
              </p>
              <div className="flex items-center gap-3">
                <span className="h-11 w-11 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500" aria-hidden="true">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" /></svg>
                </span>
                <span className="h-11 w-11 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500" aria-hidden="true">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" /></svg>
                </span>
                <span className="h-11 w-11 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500" aria-hidden="true">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
              <ul className="space-y-2.5 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#tools" className="hover:text-gray-900 dark:hover:text-white transition">ATS Tools</a></li>
                <li><Link href="/keyword-analyzer" className="hover:text-gray-900 dark:hover:text-white transition">Keyword Analyzer</Link></li>
                <li><Link href="/ats-checker" className="hover:text-gray-900 dark:hover:text-white transition">ATS Checker</Link></li>
                <li><a href="#how-it-works" className="hover:text-gray-900 dark:hover:text-white transition">How It Works</a></li>
                <li><a href="#compare" className="hover:text-gray-900 dark:hover:text-white transition">Free vs Paid</a></li>
                <li><Link href="/sign-up" className="hover:text-gray-900 dark:hover:text-white transition">Get Started</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Resources</h3>
              <ul className="space-y-2.5 text-sm text-gray-500 dark:text-gray-400">
                <li><Link href="/blog" className="hover:text-gray-900 dark:hover:text-white transition">Blog</Link></li>
                <li><a href="#faq" className="hover:text-gray-900 dark:hover:text-white transition">FAQ</a></li>
                <li><a href="#how-it-works" className="hover:text-gray-900 dark:hover:text-white transition">ATS Resume Guide</a></li>
                <li><Link href="/keyword-analyzer" className="hover:text-gray-900 dark:hover:text-white transition">Keyword Tips</Link></li>
                <li><Link href="/ats-checker" className="hover:text-gray-900 dark:hover:text-white transition">ATS Checklist</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
              <ul className="space-y-2.5 text-sm text-gray-500 dark:text-gray-400">
                <li><Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition">Terms of Service</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Compare</h3>
              <ul className="space-y-2.5 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#compare" className="hover:text-gray-900 dark:hover:text-white transition">Free vs Paid Tools</a></li>
                <li><a href="#tools" className="hover:text-gray-900 dark:hover:text-white transition">All 9 AI Tools</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} ResumeAI. 100% free.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition">Privacy</Link>
              <span>&middot;</span>
              <Link href="/terms" className="hover:text-gray-600 dark:hover:text-gray-300 transition">Terms</Link>
              <span>&middot;</span>
              <CookieSettingsButton />
              <span>&middot;</span>
              <span>Built with open-source AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
