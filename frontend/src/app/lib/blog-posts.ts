export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  keywords: string[];
  sections: { heading: string; content: string[] }[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-beat-ats-filters-2026",
    title: "How to Beat ATS Filters in 2026 — The Complete Guide",
    description:
      "75% of resumes are rejected by ATS before a human reads them. Learn exactly how Applicant Tracking Systems work, what they scan for, and how to optimise your resume to pass every time.",
    publishedAt: "2026-07-04",
    updatedAt: "2026-07-04",
    readingTime: "12 min read",
    keywords: [
      "how to beat ATS",
      "ATS filters",
      "ATS resume tips",
      "applicant tracking system",
      "ATS compatible resume",
    ],
    sections: [
      {
        heading: "What Is ATS and Why Does It Reject 75% of Resumes?",
        content: [
          "An Applicant Tracking System (ATS) is software that companies use to manage job applications. Before a recruiter ever sees your resume, ATS scans it, parses the text, extracts structured data (name, email, skills, work history), and scores you against the job description.",
          "If your resume doesn't include the right keywords or uses formatting that the parser can't read, you're filtered out automatically — no matter how qualified you are. Studies from Jobscan and Harvard Business School estimate that 75% of resumes are rejected by ATS before reaching a human reviewer.",
          "This isn't a problem limited to small companies. Over 99% of Fortune 500 companies use ATS, and the software has expanded to mid-market and startup hiring as well. The most common ATS platforms in 2026 include Workday, Greenhouse, Lever, iCIMS, Ashby, and SAP SuccessFactors.",
        ],
      },
      {
        heading: "The 6 Most Common ATS Platforms in 2026",
        content: [
          "Each ATS parses resumes slightly differently. Here are the platforms you're most likely to encounter:",
          "Workday — used by large enterprises (60% of Fortune 500). Known for strict formatting requirements. Parses PDFs well but struggles with multi-column layouts.",
          "Greenhouse — popular with tech companies and startups. Good at parsing modern resume formats but penalises missing keywords heavily.",
          "Lever — combines ATS with CRM. Relatively forgiving on formatting but keyword matching is strict.",
          "iCIMS — common in healthcare, finance, and government. Older parser technology — avoid complex formatting entirely.",
          "Ashby — growing rapidly in tech. Modern parser that handles most formats well, but still keyword-dependent.",
          "SAP SuccessFactors — enterprise-grade, common in manufacturing and large corporations. Conservative parser — stick to simple, single-column layouts.",
        ],
      },
      {
        heading: "10 Formatting Rules Every ATS-Friendly Resume Must Follow",
        content: [
          "ATS failures fall into two categories: missing keywords and unreadable formatting. Even if you have every keyword, bad formatting means the parser can't extract them. Follow these 10 rules:",
          "1. Use a single-column layout. Multi-column resumes confuse most ATS parsers because they read left-to-right, top-to-bottom. Two columns cause text to get interleaved.",
          "2. No images, graphics, or icons. ATS can't read visual elements. Your skills chart or headshot is invisible to the parser.",
          "3. Use standard section headings. Stick to 'Work Experience', 'Education', 'Skills', and 'Summary'. Creative headings like 'My Journey' or 'What I Bring' won't be recognised.",
          "4. No headers or footers. Many ATS platforms strip headers and footers entirely. If your name and contact info are in a header, the parser may miss them completely.",
          "5. No text boxes or tables. Content inside text boxes is often skipped. Tables can cause data to appear in the wrong order.",
          "6. Use standard bullet characters. Round bullets are safest. Arrows, diamonds, and custom symbols may be converted to garbled characters.",
          "7. Consistent date formatting. Pick one format (e.g., 'Jan 2024 – Present') and use it everywhere. Mixed formats confuse date-range extraction.",
          "8. Readable font size (10pt+). Anything smaller may not parse correctly. Stick to 10-12pt for body text.",
          "9. Contact information at the top. Name, email, phone, and LinkedIn URL should be in the first few lines of the document — not in a sidebar or header.",
          "10. Save as PDF or DOCX. PDF is generally safest because it preserves formatting. Some older ATS platforms prefer DOCX. Avoid image-based PDFs (scanned documents).",
        ],
      },
      {
        heading: "How to Find the Right Keywords for Your Resume",
        content: [
          "Keywords are the single most important factor in ATS scoring. The system compares words in your resume against words in the job description and calculates a match percentage.",
          "The manual approach: Read the job description carefully. Highlight every hard skill (Python, Tableau, GAAP), soft skill (collaboration, leadership), certification (PMP, AWS Certified), and tool (Jira, Salesforce) mentioned. Then check your resume for each one.",
          "The automated approach: Use a keyword extraction tool to parse the job description with NLP and identify every term the ATS is likely scanning for. This catches keywords you might miss manually — including job title variants, industry jargon, and skill synonyms.",
          "Pro tip: Exact keyword matches score higher than synonyms. If the job says 'project management', use that exact phrase rather than 'managed projects'. ATS systems are getting smarter at synonyms, but exact matches are still the safest bet.",
        ],
      },
      {
        heading: "Step-by-Step: Checking Your Resume with ResumeAI",
        content: [
          "Here's how to use our free tool to check your resume against any job description:",
          "Step 1: Go to ResumeAI and paste the job description into the ATS Keyword Extractor. The NLP engine identifies every keyword the ATS is likely scanning for — hard skills, soft skills, certifications, and job title variants.",
          "Step 2: Paste your resume into the Gap Analysis tool alongside the job description. You'll see a match score and a list of keywords that are present vs missing.",
          "Step 3: Run the ATS Compliance Checker to verify your formatting passes all 15 rules. This catches issues that prevent the parser from reading your resume even if the keywords are there.",
          "Step 4: Use the AI Bullet Rewriter to naturally incorporate missing keywords into your experience bullets — without inventing facts or experience you don't have.",
          "Step 5: Generate a tailored cover letter and download your optimised resume as a clean PDF.",
        ],
      },
      {
        heading: "Common ATS Myths Debunked",
        content: [
          "Myth: 'I need to stuff my resume with keywords.' — Reality: Keyword stuffing (repeating the same word 20 times) actually hurts you. Modern ATS platforms detect this and flag it as spam. Use keywords naturally in context.",
          "Myth: 'ATS can't read PDFs.' — Reality: This was true 10 years ago but not anymore. Most modern ATS platforms parse PDFs well. The exception is image-based PDFs (scanned documents). Always use a digitally created PDF, not a scan.",
          "Myth: 'I should use a plain text resume.' — Reality: Plain text (.txt) resumes lose all formatting and look unprofessional. PDF or DOCX is the standard. The key is simple formatting, not no formatting.",
          "Myth: 'White text keywords will trick ATS.' — Reality: Some people add hidden white text with keywords. Modern ATS platforms detect this and many will reject your application automatically. Don't risk it.",
          "Myth: 'Creative resumes stand out.' — Reality: Creative formatting (infographics, timelines, icons) hurts you with ATS. Save creativity for portfolios. Your resume needs to be machine-readable first, human-readable second.",
        ],
      },
      {
        heading: "15-Point ATS Compatibility Checklist",
        content: [
          "Before you submit any application, verify your resume passes these 15 checks:",
          "1. Single-column layout (no tables or columns)",
          "2. No images, graphics, or icons",
          "3. Standard section headings (Experience, Education, Skills)",
          "4. No content in headers or footers",
          "5. No text boxes",
          "6. No special characters in headings",
          "7. Consistent date formatting throughout",
          "8. Standard bullet characters (round dots)",
          "9. No colour-coded text for meaning",
          "10. Font size 10pt or larger",
          "11. Contact info at the top (not in a sidebar)",
          "12. No hyperlink-only text (spell out URLs)",
          "13. PDF or DOCX file format",
          "14. Adequate page margins (0.5 inch minimum)",
          "15. Logical section order (Contact → Summary → Experience → Education → Skills)",
          "You can run all 15 checks automatically with the free ATS Compliance Checker on ResumeAI.",
        ],
      },
    ],
  },
  {
    slug: "ats-keywords-by-industry",
    title: "Top 50 ATS Keywords by Industry (2026) — Software, Finance, Marketing & Healthcare",
    description:
      "The definitive list of ATS keywords by industry. Copy these into your resume to pass Applicant Tracking System filters for software engineering, finance, marketing, and healthcare roles.",
    publishedAt: "2026-07-04",
    updatedAt: "2026-07-04",
    readingTime: "10 min read",
    keywords: [
      "ATS keywords by industry",
      "resume keywords",
      "ATS keywords list",
      "resume skills by industry",
      "ATS friendly keywords",
    ],
    sections: [
      {
        heading: "Why Keyword Matching Is the #1 ATS Ranking Factor",
        content: [
          "When a recruiter posts a job, the ATS creates a profile of required and preferred qualifications — skills, tools, certifications, and experience levels. Your resume is scored based on how many of these keywords it contains.",
          "A study by Preptel found that resumes with a keyword match rate above 70% are 3x more likely to reach a human reviewer. Below 40%, you're almost certainly filtered out.",
          "But here's the catch: you can't just add generic keywords. ATS systems weight keywords differently based on how they appear in the job description. A skill listed under 'Required Qualifications' counts more than one mentioned in passing.",
          "The lists below are compiled from analysis of thousands of job descriptions across four major industries. These are the keywords that appear most frequently — the ones ATS systems are most likely to scan for.",
        ],
      },
      {
        heading: "Software Engineering — Top 50 Keywords",
        content: [
          "Technical skills: Python, JavaScript, TypeScript, Java, C++, Go, Rust, SQL, React, Angular, Vue.js, Node.js, Next.js, Django, FastAPI, Spring Boot, .NET, Docker, Kubernetes, AWS, Azure, GCP",
          "Methodologies & tools: Agile, Scrum, CI/CD, Git, GitHub Actions, Jenkins, Terraform, microservices, REST API, GraphQL, unit testing, integration testing, TDD, code review",
          "Soft skills & concepts: cross-functional collaboration, system design, technical leadership, mentoring, performance optimisation, scalability, observability, incident response",
          "Certifications: AWS Certified Solutions Architect, Azure Administrator, Google Cloud Professional, Kubernetes Administrator (CKA), Certified Scrum Master (CSM)",
        ],
      },
      {
        heading: "Finance & Accounting — Top 50 Keywords",
        content: [
          "Technical skills: GAAP, IFRS, financial modelling, forecasting, variance analysis, budgeting, P&L management, cash flow analysis, Bloomberg Terminal, Excel (advanced), Power BI, Tableau, SAP, Oracle Financials, QuickBooks",
          "Regulatory & compliance: SOX compliance, audit, internal controls, risk assessment, regulatory reporting, Basel III, Dodd-Frank, anti-money laundering (AML), Know Your Customer (KYC)",
          "Soft skills & concepts: financial planning & analysis (FP&A), revenue recognition, cost optimisation, stakeholder reporting, due diligence, M&A, valuation",
          "Certifications: CPA, CFA, CMA, FRM (Financial Risk Manager), CIA (Certified Internal Auditor), Series 7, Series 63",
        ],
      },
      {
        heading: "Marketing & Growth — Top 50 Keywords",
        content: [
          "Digital marketing: SEO, SEM, PPC, Google Ads, Meta Ads, content marketing, email marketing, marketing automation, HubSpot, Marketo, Mailchimp, social media marketing, influencer marketing",
          "Analytics & tools: Google Analytics (GA4), conversion rate optimisation (CRO), A/B testing, attribution modelling, customer segmentation, funnel analysis, UTM tracking, Amplitude, Mixpanel",
          "Strategy & concepts: CAC (customer acquisition cost), LTV (lifetime value), brand strategy, go-to-market (GTM), demand generation, product marketing, market research, competitive analysis",
          "Certifications: Google Ads Certification, HubSpot Inbound Marketing, Meta Blueprint, Google Analytics Certification",
        ],
      },
      {
        heading: "Healthcare — Top 50 Keywords",
        content: [
          "Clinical skills: patient care, clinical assessment, medication administration, care planning, electronic medical records (EMR), EHR, vital signs monitoring, wound care, IV therapy, triage",
          "Regulatory & compliance: HIPAA, Joint Commission standards, infection control, quality assurance, patient safety, regulatory compliance, clinical documentation, OSHA",
          "Systems & tools: Epic, Cerner, Meditech, Allscripts, eClinicalWorks, CPOE (computerised physician order entry), telehealth platforms",
          "Certifications: RN, BSN, NP, BLS, ACLS, PALS, CNA, CPR, specialty certifications (CCRN, OCN, etc.)",
        ],
      },
      {
        heading: "How to Use These Keywords Without Keyword Stuffing",
        content: [
          "Adding keywords to your resume isn't about cramming every term into a skills section. Here's the right approach:",
          "1. Match the job description first. The lists above are general — always prioritise keywords that appear in the specific job description you're applying to. Use the ATS Keyword Extractor on ResumeAI to identify them automatically.",
          "2. Use keywords in context. Instead of a raw skills list, weave keywords into your experience bullets: 'Built CI/CD pipelines using GitHub Actions, reducing deployment time by 40%' is better than just listing 'CI/CD'.",
          "3. Include both the acronym and the full term. Write 'Customer Acquisition Cost (CAC)' the first time, then use 'CAC' afterwards. This catches both search variants.",
          "4. Don't add skills you don't have. ATS gets you past the filter, but the recruiter interview will catch dishonesty. Only include keywords for skills you can actually demonstrate.",
          "5. Use the Gap Analysis tool. After adding keywords, run your updated resume through the gap analysis to verify your match score improved. Aim for 70%+ on every application.",
        ],
      },
    ],
  },
  {
    slug: "free-ats-resume-checker-comparison",
    title: "Free ATS Resume Checker: What Most Resume Builders Miss in 2026",
    description:
      "Compare the best free ATS resume checkers in 2026. See how ResumeAI stacks up against Jobscan, Resume Worded, and Skillresy on features, pricing, and accuracy.",
    publishedAt: "2026-07-04",
    updatedAt: "2026-07-04",
    readingTime: "8 min read",
    keywords: [
      "free ATS resume checker",
      "best resume checker",
      "ATS checker comparison",
      "resume scanner free",
      "Jobscan alternative",
    ],
    sections: [
      {
        heading: "The Problem with Most 'Free' Resume Checkers",
        content: [
          "Search for 'free ATS resume checker' and you'll find dozens of tools. But most of them follow the same playbook: offer 1-2 free scans, then lock the results behind a $30-50/month paywall.",
          "This is frustrating for job seekers who are often already financially stressed. You need to check your resume against every job description you apply to — not just one or two. A tool that limits you to 2 free scans per month isn't solving the problem.",
          "Beyond the paywall issue, most resume checkers only do keyword matching. They compare words in your resume to words in the job description and give you a percentage. That's useful, but it misses half the problem: formatting.",
          "A resume can have every keyword perfectly matched and still get rejected if the ATS parser can't read the file. Tables, multi-column layouts, images, and custom fonts all break parsing. You need both keyword analysis AND formatting checks.",
        ],
      },
      {
        heading: "What a Proper ATS Check Should Include",
        content: [
          "A complete ATS check needs three things:",
          "1. Keyword extraction — Identify every keyword the ATS is likely scanning for in the job description. This goes beyond simple word frequency — it should detect hard skills, soft skills, certifications, tools, and job title variants.",
          "2. Gap analysis — Compare your resume against those keywords and show exactly which ones are present vs missing, with a match score.",
          "3. Format compliance — Check your resume's structure against known ATS parsing rules: single-column layout, standard headings, no images, proper bullet characters, consistent dates, and more.",
          "Most tools do #1 and #2 at a basic level but skip #3 entirely. The best tools also help you fix the gaps — with AI-powered suggestions for rewriting bullets and generating content.",
        ],
      },
      {
        heading: "Feature Comparison: ResumeAI vs Jobscan vs Resume Worded vs Skillresy",
        content: [
          "Here's how the major ATS resume checkers compare on features, pricing, and limitations:",
          "Jobscan — The market leader. Strong keyword matching with specific ATS platform detection (Workday, Greenhouse, etc.). Offers AI Optimize, Job Match, and LinkedIn optimisation. Price: $49.95/month after 2 free scans. Limitation: Free tier is extremely limited, and the monthly price is steep for job seekers.",
          "Resume Worded — Good scoring algorithm with detailed feedback. Offers a 'Targeted Resume' tool and LinkedIn review. Price: $29/month after limited free checks. Limitation: AI suggestions are generic and don't account for your specific experience.",
          "Skillresy — Newer entrant focused on skills matching. Clean interface with visual skill gap charts. Price: Free tier with limited scans, $19/month for full access. Limitation: Formatting checks are minimal.",
          "ResumeAI — 9 tools including keyword extraction, gap analysis, 15-rule compliance checker, AI summary generator, AI cover letter generator, AI bullet rewriter, PDF export with 3 templates, and job application tracker. Price: Free, no sign-up, no usage limits. All features available immediately.",
        ],
      },
      {
        heading: "Why 15 Formatting Rules Matter More Than You Think",
        content: [
          "Here's a scenario that happens more often than you'd expect: a candidate has an 85% keyword match but gets rejected by ATS. The reason? Their resume uses a two-column layout, and the ATS parser read the columns as interleaved text — turning 'Senior Software Engineer at Google' into 'Senior Software at Engineer Google'.",
          "Formatting issues are invisible to the applicant. Your resume looks perfect on screen, but the ATS parser sees something completely different. This is why a formatting compliance check is essential — not optional.",
          "ResumeAI's compliance checker runs 15 specific formatting rules: single-column layout, no images or graphics, standard section headings, no header/footer content, no text boxes, no special characters in headings, consistent date formats, standard bullet characters, no colour-coded meaning, readable font size, contact info at top, no hyperlink-only text, correct file type, adequate margins, and logical section order.",
          "Each rule comes with a pass/fail result and specific instructions for fixing any issues. This catches formatting problems that keyword-only checkers completely miss.",
        ],
      },
      {
        heading: "The Bottom Line: What to Look for in an ATS Checker",
        content: [
          "When choosing an ATS resume checker, look for these five things:",
          "1. No artificial scan limits. You need to check your resume against every job you apply to. A tool that limits free scans forces you to guess which applications matter most.",
          "2. Keyword extraction, not just matching. The tool should analyse the job description and tell you what to look for — not just compare two documents word by word.",
          "3. Formatting compliance checks. Keywords don't matter if the parser can't read your resume. Look for a tool that checks structural formatting rules.",
          "4. Actionable suggestions. A score without context is useless. The tool should tell you exactly what to fix and how.",
          "5. No sign-up required. If you have to create an account before seeing any results, the tool is optimised for lead capture, not for helping you.",
          "ResumeAI meets all five criteria. It's completely free, requires no sign-up, and gives you 9 tools that cover the full resume optimisation workflow — from keyword extraction to PDF export.",
        ],
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}
