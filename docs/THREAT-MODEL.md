# Threat Model — ResumeAI (resumeai.cv)

Last updated: 2026-07-19 (Session 26)

## System Overview

| Component      | Stack                          | Host        |
|----------------|--------------------------------|-------------|
| Frontend       | Next.js 16 (App Router)        | Vercel      |
| Backend API    | Python 3.13 + FastAPI 0.139.2  | Render      |
| Database       | Supabase (PostgreSQL)          | Supabase    |
| AI Service     | HuggingFace Inference API      | HuggingFace |
| DNS/Proxy      | Cloudflare                     | Cloudflare  |

## Attack Surface Map

### Endpoint Inventory

| # | Endpoint              | Rate Limit  | Input Size Cap   | AI-Backed | Auth |
|---|----------------------|-------------|-----------------|-----------|------|
| 1 | POST /api/v1/analyze  | 30/min      | 50,000 chars     | No        | No   |
| 2 | POST /api/v1/score    | 30/min      | 50,000 + resume  | No        | No   |
| 3 | POST /api/v1/gap      | 30/min      | 50,000 x2        | No        | No   |
| 4 | POST /api/v1/compliance | 30/min    | 50,000 chars     | No        | No   |
| 5 | POST /api/v1/summary  | 10/min      | 50,000 + 10,000  | Yes       | No   |
| 6 | POST /api/v1/rewrite  | 10/min      | 5,000 + 2,000    | Yes       | No   |
| 7 | POST /api/v1/cover-letter | 10/min  | 50,000 + 10,000  | Yes       | No   |
| 8 | POST /api/v1/export/pdf | 15/min    | Structured JSON   | No        | No   |

Utility endpoints (no rate limit):
- GET / — health message
- GET /health — status check

---

## Threat Categories

### 1. Denial of Service (DoS)

**Threat**: Exhausting server resources via high-volume or computationally expensive requests.

**Mitigations in place**:
- slowapi rate limiter on all 8 endpoints (10-30 req/min per IP)
- Client IP extraction via `CF-Connecting-IP` header (Cloudflare), with `X-Forwarded-For` fallback
- Pydantic `max_length` on all string fields (50,000 char ceiling)
- List length limits on structured arrays (e.g., `experience` max 20, `bullets` max 30)
- HuggingFace API has its own timeout (30s) preventing indefinite hangs
- Render free tier auto-sleeps after inactivity (limits sustained attacks)

**Residual risk**:
- Rate limiting is per-IP; distributed attacks from many IPs bypass it
- No global request concurrency cap (Render's infrastructure limits apply)
- NLP processing (TF-IDF vectorization) on 50,000-char inputs is CPU-intensive

**Severity**: Medium

---

### 2. Input Validation / Injection

**Threat**: Malformed, oversized, or malicious payloads causing crashes or unintended behavior.

**Mitigations in place**:
- Pydantic schema validation with `max_length` on every string field
- Per-item string length limits (e.g., bullet max 2,000 chars, filename max 100)
- Empty-string rejection via explicit `.strip()` checks before processing
- `Literal` type constraints on enum fields (`tone`, `template`)
- Integer bounds (`years_experience: ge=0, le=60`)
- Filename sanitization in export endpoint (`re.sub(r"[^\w\s-]", "")`)
- 57 adversarial tests covering: ReDoS patterns, Unicode edge cases, null bytes, oversized payloads, boundary values

**Residual risk**:
- No WAF-level filtering (Cloudflare free tier has limited rules)
- `raw_text` accepts any content up to 50K — no structural validation beyond length

**Severity**: Low

---

### 3. AI Prompt Injection

**Threat**: Attacker crafts job descriptions or resume text that manipulates the AI model (Qwen2.5-7B) to produce unintended output.

**Affected endpoints**: `/summary`, `/rewrite`, `/cover-letter`

**Mitigations in place**:
- Output is constrained by Pydantic response models (structured fields, not raw passthrough)
- AI responses are parsed and validated before returning to the user
- `call_ai_service()` catches and wraps all AI errors generically (no raw model output leaked)
- Rate limiting (10/min) limits mass probing

**Residual risk**:
- No input sanitization specifically targeting prompt injection patterns
- The AI model may follow injected instructions within its response content
- Generated text (cover letter, summary, bullets) is returned to the user as-is within the structured field
- Impact is low: output goes only to the requesting user, not stored or shared

**Severity**: Low (self-harm only — attacker poisons their own output)

---

### 4. Server-Side Request Forgery (SSRF)

**Threat**: Tricking the backend into making requests to internal services.

**Mitigations in place**:
- Only outbound HTTP call is to HuggingFace Inference API (hardcoded endpoint)
- No user-supplied URLs are fetched server-side
- `JobDescription.url` field is stored but never fetched

**Residual risk**: None identified.

**Severity**: None

---

### 5. Cross-Site Scripting (XSS)

**Threat**: Injecting malicious scripts via user input that executes in other users' browsers.

**Mitigations in place**:
- Content Security Policy headers (frontend):
  - `script-src 'self' 'unsafe-inline'` (no `unsafe-eval` in production)
  - `frame-ancestors 'none'`
- `X-Content-Type-Options: nosniff` on both frontend and backend
- `X-Frame-Options: DENY` on both frontend and backend
- Backend API returns JSON only (no HTML rendering)
- PDF export generates binary PDF, no user-controlled HTML
- React (Next.js) auto-escapes all rendered content

**Residual risk**:
- `unsafe-inline` for scripts is required by Next.js but slightly weakens CSP
- Stored XSS is not applicable (no persistent user content displayed to others)

**Severity**: Very Low

---

### 6. Data Exposure / Privacy

**Threat**: Leaking sensitive user data (resumes, job descriptions, personal info).

**Mitigations in place**:
- No server-side storage of submitted resumes or job descriptions (stateless processing)
- PDF export returns binary directly to the user (no temp files persisted)
- Supabase RLS enforces row-level access (user can only access own rows)
- CORS restricted to specific origins (localhost + production frontend URL)
- OpenAPI/Swagger docs disabled in production
- HSTS enabled in production (31536000s)
- `Referrer-Policy: strict-origin-when-cross-origin`

**Residual risk**:
- HuggingFace Inference API receives resume/job content in prompts (third-party processing)
- Server logs may capture error details containing partial user input
- Render platform logs are accessible to the project owner

**Severity**: Low

---

### 7. Authentication & Authorization

**Threat**: Unauthorized access to user-specific data or admin functionality.

**Current state**:
- Public API endpoints require no authentication (by design — free tool)
- Job Tracker (Supabase) uses Supabase Auth with RLS
- No admin endpoints exist
- No API keys required from end users

**Mitigations in place**:
- Supabase RLS: 5 policies on `public.jobs` table enforce `auth.uid() = user_id`
- Verified: anon role returns 0 rows, authenticated role only sees own rows
- Rate limiting provides a soft barrier against abuse

**Residual risk**:
- Unauthenticated endpoints can be used by anyone (intentional trade-off for SEO traffic)
- No usage quotas beyond rate limits (free tier abuse possible)

**Severity**: Low (accepted risk for growth-stage product)

---

### 8. Dependency Vulnerabilities

**Threat**: Known CVEs in third-party packages exploited in production.

**Mitigations in place**:
- 29/31 CVEs fixed in Session 21; 3 more fixed in Session 26 (click, mcp, pytest)
- `pip-audit` now runs in CI (auto-fails on new CVEs, ignores PYSEC-2026-597)
- `bandit` security linting in pre-commit hooks and CI
- `ruff` with security rules (S prefix) enforced
- CI runs `bandit -r app/` on every push

**Remaining CVEs (unfixable)**:
| Package    | CVE              | Status                    |
|-----------|------------------|---------------------------|
| nltk 3.9.4 | PYSEC-2026-597  | No upstream patch exists; corpus download feature not used |

**Fixed in Session 26**:
| Package    | CVE              | Fixed Version |
|-----------|------------------|---------------|
| click 8.1.8 | PYSEC-2026-2132 | 8.3.3 (transitive, upgraded) |
| mcp 1.23.3 | CVE-2026-52870, CVE-2026-52869, CVE-2026-59950 | 1.28.1 (transitive via semgrep) |
| pytest 8.4.1 | PYSEC-2026-1845 | 9.0.3 (upgraded) |

**Residual risk**:
- nltk CVE: applies to corpus download features — ResumeAI uses pre-downloaded stopwords only, not affected in practice

**Severity**: Very Low (sole remaining CVE is non-exploitable in this context)

---

### 9. Supply Chain / Build

**Threat**: Compromised dependencies or CI pipeline.

**Mitigations in place**:
- Pre-commit hooks run ruff + bandit + detect-secrets + mypy + pytest before every commit
- CI workflow validates lint, types, tests, security scan, secret scan, and dependency CVEs (pip-audit)
- SSH-based git push (no token scope vulnerabilities)
- Pinned dependency versions in `requirements.txt`
- Vercel builds from main branch only

**Residual risk**:
- No lock file hash verification (`pip freeze` without `--require-hashes`)
- npm packages use `package-lock.json` but no integrity audit in CI

**Severity**: Low

---

## Test Coverage Summary

| Suite              | Tests | Coverage Area                                    |
|-------------------|-------|--------------------------------------------------|
| Unit tests         | 74    | ATS scorer, compliance checker, keyword extractor |
| Security tests     | 37    | Schema bounds, header injection, path traversal   |
| Adversarial tests  | 57    | ReDoS, Unicode, null bytes, oversized payloads    |
| Integration tests  | 33    | All 8 endpoints, error codes, malformed requests  |
| **Total**          | **201** | **~1.6-3.2s execution time**                   |

---

## Security Controls Matrix

| Control                    | Layer      | Status    |
|---------------------------|------------|-----------|
| Rate limiting (slowapi)    | Backend    | Active    |
| Input validation (Pydantic)| Backend    | Active    |
| CORS (allow-list)          | Backend    | Active    |
| Security headers           | Both       | Active    |
| CSP (no unsafe-eval prod)  | Frontend   | Active    |
| HSTS                       | Backend    | Active    |
| RLS (Supabase)             | Database   | Active    |
| Pre-commit hooks           | Dev        | Active    |
| CI security scan           | Pipeline   | Active    |
| Docs disabled in prod      | Backend    | Active    |
| Filename sanitization      | Backend    | Active    |

---

## Risk Summary

| Category                  | Severity   | Exploitable? | Action Needed     |
|--------------------------|------------|--------------|-------------------|
| DoS (distributed)         | Medium     | Yes (costly)  | Monitor; Cloudflare rules if needed |
| Input validation          | Low        | Unlikely      | None              |
| AI prompt injection       | Low        | Self-harm only| Monitor outputs   |
| SSRF                      | None       | No            | None              |
| XSS                       | Very Low   | No            | None              |
| Data exposure             | Low        | Limited       | HF privacy policy |
| AuthN/AuthZ               | Low        | By design     | None              |
| Dependency CVEs           | Very Low   | No            | Watch for patches |
| Supply chain              | Low        | Unlikely      | Add pip hash verification |

---

## Recommended Future Hardening

1. **Cloudflare WAF rules** — Add rate limiting at the edge for distributed attacks
2. **pip --require-hashes** — Pin package integrity in requirements.txt
3. **npm audit in CI** — Add `npm audit --audit-level=high` to frontend CI job
4. **AI output filtering** — Add basic regex check for injected instructions in AI responses
5. **Request body size limit** — Add Starlette middleware to cap total request body (e.g., 1MB)
6. **Structured logging** — Ensure PII is never logged (currently logs partial error context)
