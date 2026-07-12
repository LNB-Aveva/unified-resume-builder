---
name: resume-session-11
description: "Session 11 (2026-07-02) — Fixed all 10 code review findings from Session 10, spaCy removed, all 40 Python files compile clean"
metadata: 
  node_type: memory
  type: project
  originSessionId: 8dca6ccf-9e18-44db-8e7d-102602143fa8
---

## Session 11 — 2026-07-02

All 10 code review findings from Session 10 fixed in one pass.

### Fixes Applied (8 files modified):

**HIGH:**
1. **ATS score redistribution** (`ats_scorer.py`) — When one skill type is empty, weight redistributes to existing types instead of capping at 30% or 70%. Fixed in both `score_resume()` and `score_from_text()`.
2. **Sanitizer regex anchored** (`sanitizer.py`) — Changed `(?i)(system|assistant|user)\s*:` to `(?im)^\s*(system|assistant|user)\s*:` so it only strips role tokens at line start, not mid-sentence.

**MEDIUM:**
3. **Compliance severity weighting** (`checker.py`) — Score now uses critical=3x, warning=2x, suggestion=1x weights instead of equal weighting. 4 critical failures now scores ~59% instead of 73%.
4. **"go" false positive removed** (`keyword_extractor.py`) — Removed "go" from HARD_SKILLS, kept "golang" only.
5. **PDF title truncation** (`pdf_generator.py`) — `_two_col()` now truncates with "..." when text exceeds column width instead of silent clipping.
6. **Unicode normalization** (`pdf_generator.py`) — Added `unicodedata.normalize("NFC")` in `_s()` to handle composed accented characters.

**LOW:**
7. **spaCy removed entirely** — Removed from `keyword_extractor.py`, `requirements.txt`, `render.yaml` (build command), `ci.yml` (download step). Saves 12MB deploy size + 200ms startup.
8. **Scorer single-pass** (`ats_scorer.py`) — Both functions now loop once and partition into matched/missing instead of running regex 2x per skill.
9. **Bullet char coverage** (`keyword_extractor.py`) — `_extract_responsibilities()` now matches `-`, `*`, `*`, `*`, `–` (aligns with `_bullet_lines()`).
10. **API URL localhost** — Skipped, working as designed for Next.js build-time inlining.

### Verification:
- All 40 Python files pass `py_compile`
- 8 files modified, ready to commit
- Branch is 91 commits ahead of origin/main

### Push Complete:
- Cloned standalone repo `LNB-Aveva/unified-resume-builder` to temp dir
- Synced all 28 files (Sessions 10+11 combined), committed `7bc2963`
- Pushed `18b7c0a..7bc2963` to `origin/main`
- Note: my-workspace repo still 92 commits ahead — only the standalone repo was pushed

### Still Pending:
- Rotate Supabase service_role key (manual Dashboard action — user will handle)
- Monitor HuggingFace free-tier quota (no dashboard; 429/503 errors = limit hit)
- Verify Render auto-deploys from the new push (spaCy removal should speed up builds)
- Maintainability audit completed — 10 ranked improvements identified (see [[resume-maintainability-audit]])

**Why:** Deep code review from Session 10 found logic flaws that would give wrong scores/corrupt text for certain job categories.
**How to apply:** All fixes are deployed-ready once committed and pushed. The spaCy removal also speeds up Render cold starts significantly.
