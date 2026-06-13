# Session Log — Unified AI Resume Builder

This file tracks progress across Claude Code sessions so nothing is lost between conversations.

---

## Session 1 — 2026-06-13

### What Was Done This Session:

**Phase 1: Research Review & Planning**
- Reviewed all research notes from Gemini, Claude Chrome, and Claude.ai chats
- Created comprehensive project status report and 4-phase build roadmap (Foundation → Core Engine → AI Features → Polish & Monetize)
- Decided on $0 tech stack: Next.js + FastAPI + Supabase + spaCy + HuggingFace + WeasyPrint
- Planned 10 indirect monetization streams with timeline for when to add each
- Saved 7 memory files for future session continuity (user prefs, project overview, monetization, learning mode, session mgmt, model warnings, claude tools)

**Phase 2: Git & GitHub Setup**
- Initialized Git repository with `git init`
- Set local Git config: email=bobby.bingo696@gmail.com, name=LNB-Aveva (separate from AVEVA work email)
- Created private GitHub repo: https://github.com/LNB-Aveva/unified-resume-builder
- Connected local repo to GitHub with `git remote add origin`
- Pushed 2 commits to main branch
- Installed GitHub CLI (`gh` v2.94.0) via winget — needs `gh auth login` to authenticate (not done yet)

**Phase 3: Backend Setup**
- Created complete folder structure (44 files across 30+ directories)
- Created essential config files: .gitignore, .env.example, requirements.txt, LICENSE, README.md
- Created FastAPI entry point (backend/app/main.py) with CORS middleware
- Created config loader (backend/app/core/config.py) for environment variables
- Created data schemas: ResumeData and JobDescription/JobAnalysis (Pydantic models)
- Created sample data: sample job description + sample resume JSON
- Set up Python virtual environment (backend/venv/)
- Installed all Python dependencies (70+ packages) — fixed spaCy/Pydantic version conflicts
- Downloaded spaCy English model (en_core_web_sm)
- Verified FastAPI runs on http://localhost:8000 (both / and /health endpoints working)

**Phase 4: Frontend Setup**
- Changed from Vite to Next.js (for SEO — critical for AdSense and organic traffic)
- Created Next.js 16 project with TypeScript, Tailwind CSS, ESLint, App Router, src/ directory
- Verified Next.js dev server runs on http://localhost:3000

**Decisions Made:**
- GitHub repo: PRIVATE (protects code while learning; will switch to public later for GitHub Sponsors)
- Frontend: Next.js over Vite (SEO for AdSense revenue; SSR for Google indexing; built-in API routes)
- Revenue goal: Must at minimum cover costs (Claude subscription $20-$100/mo, domain, APIs)
- Not mandatory to follow other AI tool output (Gemini, etc.) unless it aligns with end goal
- From now on: use feature branches, not direct-to-main pushes

**Git Lessons Taught:**
1. What is `git init` (tracking a folder)
2. What is a commit (snapshot with a message)
3. What is `git commit --amend` (rewrite last commit — only before pushing)
4. Local vs Global Git config (per-repo vs all repos)
5. What is `git remote add origin` (connecting to GitHub)
6. What is `git push -u` (uploading + setting tracking)
7. What is `git add` (staging specific files vs everything)
8. Branches & why direct-to-main is risky

**Python/Backend Lessons Taught:**
1. What is a virtual environment (isolated package boxes)
2. Version pinning & compatibility issues

**Frontend Lessons Taught:**
1. What is Next.js vs plain React (framework vs library, SEO, routing, API routes)

### Current File/Folder State:
```
AI Resume Generator/
├── .git/                              # Git initialized, connected to GitHub
├── .github/workflows/                 # CI/CD (empty, for later)
├── .gitignore                         # Ignores secrets, node_modules, __pycache__, venv
├── .env.example                       # Environment variable template
├── LICENSE                            # MIT License
├── README.md                          # Project overview
├── SESSION_LOG.md                     # This file
├── Starting Point (Info Gather).txt   # Original research notes
│
├── backend/                           # PYTHON API SERVER
│   ├── venv/                          # Python virtual environment (NOT committed to Git)
│   ├── requirements.txt               # Python dependencies (INSTALLED)
│   ├── app/
│   │   ├── main.py                    # FastAPI entry point — VERIFIED WORKING at :8000
│   │   ├── core/config.py             # Settings loader from .env
│   │   ├── schemas/resume.py          # Resume data model (Pydantic)
│   │   ├── schemas/job.py             # Job description data model (Pydantic)
│   │   ├── api/routes/                # Empty — API endpoints go here NEXT
│   │   ├── services/nlp/              # Empty — keyword extraction goes here
│   │   ├── services/scoring/          # Empty — ATS scoring goes here
│   │   ├── services/export/           # Empty — PDF export goes here
│   │   ├── models/                    # Empty — database models
│   │   └── utils/                     # Empty — helpers
│   └── tests/                         # Empty — tests
│
├── frontend/                          # NEXT.JS 16 APP — VERIFIED WORKING at :3000
│   ├── src/app/
│   │   ├── layout.tsx                 # Root layout (wraps all pages)
│   │   ├── page.tsx                   # Home page (default Next.js template)
│   │   ├── globals.css                # Global styles (Tailwind configured)
│   │   └── favicon.ico
│   ├── public/                        # Static assets (SVGs)
│   ├── package.json                   # Node.js dependencies
│   ├── tsconfig.json                  # TypeScript config
│   ├── next.config.ts                 # Next.js config
│   ├── tailwind.config.ts             # (auto-generated inside postcss)
│   └── node_modules/                  # Dependencies (NOT committed)
│
├── ai_modules/                        # Standalone AI/NLP components (all empty)
│   ├── keyword_extractor/
│   ├── ats_scorer/
│   ├── resume_rewriter/
│   ├── gap_analyzer/
│   ├── compliance_checker/
│   └── summary_generator/
│
├── templates/                         # Resume PDF templates (empty)
│   ├── modern/
│   ├── classic/
│   └── minimal/
│
├── data/
│   ├── sample_resumes/sample_resume_01.json
│   └── sample_job_descriptions/sample_jd_01.txt
│
├── docs/                              # Documentation (empty)
└── scripts/                           # Automation scripts (empty)
```

### What's Next (Priority Order):
1. [FIRST IMMEDIATE ACTION]: Build the Job Description Keyword Extractor (first real AI module — Python + spaCy)
2. Build the ATS Match Scoring algorithm (compare resume to job keywords)
3. Create the first real API endpoint: POST /api/v1/analyze (accepts job description, returns keywords)
4. Build the frontend landing page (replace default Next.js template with our UI)
5. Connect frontend to backend API (fetch keyword analysis results)
6. Build the Gap Analysis (side-by-side view comparing resume vs job)
7. Add donation button (Buy Me a Coffee) and email capture to the landing page

### Open Decisions / Blockers:
- Run `gh auth login` to authenticate GitHub CLI (not done yet — optional, can do anytime)
- Custom domain ($10-15/year) vs free .vercel.app subdomain? (Decide later when ready to deploy)
- Supabase vs SQLite for database? (Decide when building job tracker feature)

### Pending Items:
- Authenticate `gh` CLI: run `gh auth login` in a new terminal

### Model Used:
- Claude Opus 4.6 (via Claude Code CLI)
- Appropriate for this session: architecture planning + initial project setup = Opus-level task

### Token/Session Notes:
- Session 1 was heavy on context (research review, planning, setup, teaching)
- For Session 2: consider starting fresh and saying "continue from where we left off"
- Session 2 tasks (keyword extractor, scoring) are Sonnet-level — consider switching to Sonnet to save tokens
- All progress saved in: SESSION_LOG.md (this file) + 7 memory files in .claude/projects/

### Git Log:
- Commit 1: `22f0fab` — Initial commit: Project foundation and architecture setup (44 files)
- Commit 2: `5935933` — Add Next.js frontend and fix Python dependency versions (21 files)
