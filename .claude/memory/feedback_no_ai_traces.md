---
name: feedback-no-ai-traces
description: "CRITICAL: Never take ADO actions without permission, never leave AI traces in commits/code/docs — everything must look human-authored"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: abf8c90e-7093-4f77-a917-1f66592c2f5f
---

## CRITICAL RULES — No AI Traces, No Unauthorized Remote Actions

### Rule 1: NEVER take action in ADO/GitHub without explicit permission
- Do NOT push, create PRs, comment, or modify anything in remote repos (ADO, GitHub, etc.)
- Instead: guide the user step-by-step with exact commands to run themselves
- User will execute git push, PR creation, and all remote operations manually
- Only act locally (edit files, create commits locally) when instructed

### Rule 2: NEVER leave AI/Claude traces in any output
- NO "Co-Authored-By: Claude..." lines in commit messages — EVER
- NO emojis in README files or documentation (looks AI-generated)
- NO mention of Claude, AI assistant, CLI, or any AI tool in any file
- Commit messages must be SHORT, casual, human-written — look at team members' style (e.g. "add remaining windtopia traces" not "Add all 62 remaining windtopia traces with aggressive payload trimming and null-safety fixes")
- Commit descriptions should NOT look AI-generated — no bullet lists, no structured summaries, no verbose explanations. Keep it to 1 short sentence or skip the description entirely
- Documentation must read as if a human developer wrote it
- Code comments (if any) must sound human

### Rule 3: Guide, don't execute remote operations
- Provide step-by-step instructions the user can copy-paste
- Let the user review and modify before executing
- User decides timing and execution of all remote operations

**Why:** User was burned when "Co-Authored-By: Claude Sonnet 4.6 noreply@anthropic.com" and "Co-Authored-By: Claude Opus 4.6 noreply@anthropic.com" showed up visibly in ADO commit descriptions (evaluation-framework repo, branch LN-Bingi/stakeholder-pages). README with emojis also looked obviously AI-generated. This is a professional work environment where AI assistance should be invisible.

**How to apply:** Before EVERY commit message, strip any Co-Authored-By line. Before writing any docs/README, avoid emojis and AI-sounding language. Before any remote operation, STOP and provide instructions instead. When user asks to "commit" or "push", provide the commands for them to run.

See [[feedback-session-management-rules]]
