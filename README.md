# ResumeAI — Free ATS Resume Checker & Keyword Analyzer

An all-in-one platform for ATS scoring, keyword gap analysis, AI-powered resume rewriting, and professional PDF export. Live at [resumeai.cv](https://resumeai.cv).

## Features

- **Keyword Analyzer** — extracts mandatory skills, keywords, and qualifications from job postings
- **ATS Match Scoring** — generates a letter-graded match score between your resume and a job description
- **Gap Analysis** — shows exactly which hard and soft skills are missing with prioritized suggestions
- **AI Resume Rewriter** — naturally incorporates missing keywords into your bullet points
- **ATS Compliance Checker** — validates formatting against 15+ ATS checkpoints
- **AI Summary Generator** — creates tailored professional summaries from your experience
- **AI Cover Letter Generator** — produces role-specific cover letters
- **PDF Export** — clean, simple PDF generation with professional templates
- **Job Tracker** — track applications, statuses, and interview stages

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS 4 | App Router, server components, SEO |
| Backend | Python 3.13 + FastAPI | Async API, Pydantic validation |
| Auth + DB | Supabase (PostgreSQL) | Auth, RLS, profiles, job tracking |
| NLP | JSON skill taxonomy + regex/synonym matching | 220+ skills, 65+ synonym groups |
| AI | HuggingFace Inference API (Qwen2.5-7B-Instruct) | Resume rewriting, summaries, cover letters |
| PDF | fpdf2 | Pure-Python PDF generation (no system deps) |
| Hosting | Vercel (frontend) + Render (backend) | Free-tier deployment |

## Quick Start (PowerShell)

```powershell
# Clone
git clone https://github.com/LNB-Aveva/unified-resume-builder.git
Set-Location unified-resume-builder

# Backend
Set-Location backend
python -m venv venv
& .\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt          # runtime deps
python -m pip install -r requirements-dev.txt      # test/lint/type-check deps
Copy-Item .env.example .env                        # then fill in HUGGINGFACE_API_KEY
python -m uvicorn app.main:app --reload            # http://localhost:8000/docs

# Frontend (new terminal)
Set-Location frontend
npm install
Copy-Item .env.example .env.local                  # then set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev                                        # http://localhost:3000
```

See [docs/ENV_VARS.md](docs/ENV_VARS.md) for the full environment variable matrix.

## Project Status

Launched and live at [resumeai.cv](https://resumeai.cv). See [docs/LAUNCH_PROGRAM.md](docs/LAUNCH_PROGRAM.md) for the phased roadmap and backlog.

## License

MIT License — see [LICENSE](LICENSE) for details.
