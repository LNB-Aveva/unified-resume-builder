# AI Resume Generator — Session Memories & Project Context

This directory contains all Claude Code memory/session logs for the AI Resume Generator project.
These provide full context for continuing development in new Claude Code sessions.

## How to use
On a new laptop, after cloning, copy these files to your Claude Code memory directory:
- Windows: C:\Users\<username>\.claude\projects\<project-hash>\memory\
- Or simply paste the handover content from SESSION_LOG.md into a new chat.

## Project Memories
- [project_ai_resume_generator.md](project_ai_resume_generator.md) — Project overview: FastAPI + Next.js 16, 8 endpoints, 8 UI components, Render+Vercel
- [project_resume_seo_growth.md](project_resume_seo_growth.md) — SEO growth plan: 3/4 items DONE, custom domain + backlinks remaining

## Session Logs (chronological)
- [project_resume_deploy_06302026.md](project_resume_deploy_06302026.md) — PR #18, Render+Vercel deployment
- [project_resume_golive_07012026.md](project_resume_golive_07012026.md) — HuggingFace migration, Qwen2.5-7B, all AI endpoints fixed
- [project_resume_e2e_07012026.md](project_resume_e2e_07012026.md) — Browser E2E verification, 62s cold start, bullet issue
- [project_resume_session8_07012026.md](project_resume_session8_07012026.md) — E2E verified, bug fixes pushed, Supabase deployed, UptimeRobot
- [project_resume_supabase_complete.md](project_resume_supabase_complete.md) — All 6 Supabase steps done
- [project_resume_session9_07012026.md](project_resume_session9_07012026.md) — Supabase verified, 4 custom commands, security audit (12 findings)
- [project_resume_session10_07022026.md](project_resume_session10_07022026.md) — Security fixes + deep code review (10 issues)
- [project_resume_session11_07022026.md](project_resume_session11_07022026.md) — All 10 code review findings fixed, spaCy removed
- [project_resume_session12_07032026.md](project_resume_session12_07032026.md) — Maintainability audit complete, 74 tests, PR #19
- [project_resume_session13_07032026.md](project_resume_session13_07032026.md) — PR #19 merged, PR #20 (bullet fix + security headers)
- [project_resume_session14_07032026.md](project_resume_session14_07032026.md) — SEO session: PR #22+#23 merged, PR #24 created
- [project_resume_session15_07112026.md](project_resume_session15_07112026.md) — GitHub sync verified, laptop migration prep complete
- [project_resume_session17_07122026.md](project_resume_session17_07122026.md) — New laptop confirmed set up, CORS multi-origin update, session 17 memory
- [project_resume_session18_07132026.md](project_resume_session18_07132026.md) — Domain resumeai.cv purchased, OG image + CSP fixes committed (ed9ad5b), Steps 2-7 pending

## Code Reviews
- [project_resume_code_review.md](project_resume_code_review.md) — 2026-06-29: 10 findings (XSS, env mismatch, DEBUG, rate limit, ATS score)
- [project_resume_code_review2.md](project_resume_code_review2.md) — 2026-07-02: 10 findings (ATS formula, sanitizer, compliance weighting)
- [project_resume_maintainability_audit.md](project_resume_maintainability_audit.md) — ALL 10 items complete

## Feedback/Rules (always apply)
- [feedback_no_ai_traces.md](feedback_no_ai_traces.md) — NEVER leave Co-Authored-By/emojis/AI traces in commits
- [feedback_github_noreply_email.md](feedback_github_noreply_email.md) — Use 274821620+LNB-Aveva@users.noreply.github.com
- [feedback_scope_discipline.md](feedback_scope_discipline.md) — Stay strictly within requested project
- [feedback_workspace_push_scope.md](feedback_workspace_push_scope.md) — Never push my-workspace from single-project chat
- [feedback_session_management_rules.md](feedback_session_management_rules.md) — 70% context warning, model suitability, handover
- [feedback_end_of_response_tips.md](feedback_end_of_response_tips.md) — Always append tip at end of response
- [feedback_model_token_warnings.md](feedback_model_token_warnings.md) — Warn about model/token usage
- [feedback_new_chat_instructions.md](feedback_new_chat_instructions.md) — Ask questions, suggest fresh chats with handover
