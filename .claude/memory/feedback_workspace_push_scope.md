---
name: feedback-workspace-push-scope
description: NEVER push my-workspace from a single-project chat — it contains ALL projects and will cause cross-project issues
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e9f1db02-7a6a-4c74-ada2-3b2fd34a742f
---

NEVER attempt `git push` on my-workspace from a single-project chat session.

**Why:** my-workspace is a mono-repo containing evaluation-framework, platform-aiassistant, platform-mcp, AI Resume Generator, etc. Pushing it from a resume builder session dragged in a 205MB evaluation-framework report.html that blocked the push. The user was rightfully angry about scope violation.

**How to apply:** If the user asks to push my-workspace, warn that it's a cross-project action and suggest handling it in a dedicated workspace session, NOT inside a project-specific chat. Each project's own repo (e.g., LNB-Aveva/unified-resume-builder) should be pushed independently. [[feedback-scope-discipline]]
