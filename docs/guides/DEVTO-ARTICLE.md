# Dev.to Article Draft

## Title
How I Built a Free ATS Resume Checker with FastAPI and Next.js

## Tags
#python #webdev #career #opensource

## Cover Image
Screenshot of the ATS score page showing a resume being analyzed

---

## Article Body

Every year, 75% of resumes are rejected by Applicant Tracking Systems before a human ever reads them. I built a free tool to fix that.

**[ResumeAI](https://resumeai.cv)** analyzes your resume against any job description, scores your keyword match, and helps you optimize it — all without signing up or paying.

Here's how I built it.

### The Stack

| Layer | Tech | Why |
|-------|------|-----|
| Frontend | Next.js 16 (App Router) | SEO-first, server components |
| Backend | FastAPI + Python 3.13 | Fast async API, Pydantic validation |
| AI | HuggingFace Inference API | Free tier, Qwen2.5-7B model |
| NLP | JSON skill taxonomy + regex/synonym matching | 220+ skills, 65+ synonym groups |
| PDF | fpdf2 | Pure Python, no system deps |
| Hosting | Vercel + Render | Both free tier |

### How ATS Scoring Works

The core algorithm is simpler than you'd think:

1. **Extract keywords** from the job description using NLP (TF-IDF + predefined skill taxonomies)
2. **Categorize** into hard skills, soft skills, and experience requirements
3. **Match** against the resume text using word boundary regex (handles plurals, variants)
4. **Score** = (matched / total) * 100, weighted 70% hard skills + 30% soft skills

```python
def _skill_present(skill: str, text: str) -> bool:
    pattern = r'\b' + re.escape(skill.lower()) + r'(s|ing|ed|er)?\b'
    return bool(re.search(pattern, text.lower()))
```

### The AI Layer

For bullet rewriting and cover letters, I use HuggingFace's free Inference API with Qwen2.5-7B:

- **Bullet Rewriter**: Takes your existing bullets + missing keywords, rewrites them to naturally incorporate the keywords
- **Cover Letter Generator**: Structured prompt with job context, outputs 250-320 words
- **Summary Generator**: Creates a 2-3 sentence professional summary tailored to the role

The key insight: constrain AI output with Pydantic response models. The model can hallucinate, but the response schema forces structured, parseable results.

### Security (Because Resumes Are Sensitive)

This was the hardest part. Resumes contain PII, so I took security seriously:

- **Stateless processing** — nothing is stored server-side
- **Rate limiting** — 10-30 req/min per IP (slowapi + Cloudflare)
- **Input validation** — Pydantic max_length on every field (50K char ceiling)
- **CSP headers** — No unsafe-eval in production
- **201 automated tests** — including 57 adversarial tests (ReDoS, injection, Unicode edge cases)
- **Pre-commit hooks** — ruff, bandit, detect-secrets, pytest run before every commit

### Deployment

Both hosting services have generous free tiers:

- **Vercel** (frontend): Auto-deploys from `main` branch, edge CDN, custom domain support
- **Render** (backend): Free web service, auto-sleeps after 15min inactivity (cold starts take ~30s)

Total monthly cost: $0 (domain registration excluded).

### What I Learned

1. **ATS matching is keyword-based**, not semantic. Simple regex + TF-IDF beats embedding models for this specific use case.
2. **Free AI APIs have cold starts.** HuggingFace models sleep after inactivity. I added retry logic and clear error messages for the 30s warmup.
3. **Security testing finds real bugs.** My adversarial test suite caught 3 ReDoS-vulnerable patterns that would've caused 10+ second hangs.
4. **SEO beats marketing.** A custom domain with good meta tags gets indexed faster than Reddit posts. Google Search Console verification took 5 minutes.

### Try It

**Live**: [resumeai.cv](https://resumeai.cv)
**Built by**: [LNB-Aveva](https://github.com/LNB-Aveva)

Feedback welcome — what features would make this more useful for your job search?

---

## Publishing Notes
- Post on a Tuesday or Wednesday morning (9-11am ET) for max visibility
- Cross-post to LinkedIn with #resumetips #ATS #jobsearch #opensource
- Respond to every comment in first 2 hours
- DA 70+ backlink from dev.to
