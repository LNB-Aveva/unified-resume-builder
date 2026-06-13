# Unified AI Resume Builder

An all-in-one platform for ATS scoring, keyword gap analysis, AI-powered resume rewriting, and professional PDF export.

## Features

- **Job Description Parser** - Extracts mandatory skills, keywords, and qualifications from job postings
- **ATS Match Scoring** - Generates a 0-100% match rate between your resume and a job description
- **Gap Analysis** - Shows exactly which keywords are missing with prioritized suggestions
- **AI Resume Rewriter** - Naturally incorporates missing keywords into your bullet points
- **ATS Compliance Checker** - Validates formatting against 23+ ATS checkpoints
- **AI Summary & Cover Letter** - Auto-generates tailored professional summaries
- **PDF Export** - Professional document generation with multiple templates
- **Job Tracker** - Track applications, statuses, and linked resume versions
- **Template System** - ATS-friendly, designer-quality resume templates

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React | User interface |
| Backend | Python + FastAPI | API server |
| Database | Supabase (PostgreSQL) | Data storage |
| NLP | spaCy + NLTK + scikit-learn | Keyword extraction & scoring |
| AI | HuggingFace Inference API | Resume rewriting |
| PDF | WeasyPrint | HTML to PDF conversion |
| Hosting | Vercel (frontend) + Render (backend) | Free tier deployment |

## Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/unified-resume-builder.git
cd unified-resume-builder

# Set up backend
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt

# Run the API server
cd app
uvicorn main:app --reload
# Visit http://localhost:8000/docs for API documentation
```

## Project Status

Currently in active development. See [SESSION_LOG.md](SESSION_LOG.md) for latest progress.

## Support This Project

If you find this tool useful, consider supporting its development:
- [Buy Me a Coffee](https://buymeacoffee.com/) (link coming soon)

## License

MIT License - see [LICENSE](LICENSE) for details.
