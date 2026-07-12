---
name: project-resume-code-review2
description: "2026-07-02 deep code review: 10 findings — ATS score formula flaw, sanitizer text corruption, compliance weighting, go false positive, PDF clipping"
metadata: 
  node_type: memory
  type: project
  originSessionId: e8e96539-04d0-40e9-8079-20a5d7e811f1
---

## Code Review #2 — 2026-07-02 (Session 10)

Full codebase review after security fixes. 10 findings, 2 HIGH.

### HIGH (fix before commit)
1. **ATS score capped at 30% for soft-skill-only jobs** — ats_scorer.py:110-115. Formula: `hard*0.7 + soft*0.3`. When hard_skills=[], hard_score=0, overall maxes at 30%. Fix: redistribute weight to whichever skill types exist.
2. **Sanitizer corrupts legitimate text** — sanitizer.py:10. Strips "system:", "user:" everywhere. "End user: Managed support" becomes "End Managed support". Fix: anchor to line-start or require standalone.

### MEDIUM (fix soon)
3. Compliance score weights all checks equally — checker.py:216
4. "go" false positive matches English word — keyword_extractor.py:46
5. PDF clips long job titles — pdf_generator.py:68-77
6. Non-Latin chars become "?" in PDF — pdf_generator.py:54-55

### LOW (nice to have)
7. spaCy loaded but never used — keyword_extractor.py:34 (200ms startup, 12MB dead weight)
8. Scorer regex runs 2x per skill — ats_scorer.py:103-108
9. Responsibilities only finds "-" bullets — keyword_extractor.py:157
10. API URL falls to localhost silently — GapAnalysis.tsx:44

See [[project-resume-session10-07022026]]
