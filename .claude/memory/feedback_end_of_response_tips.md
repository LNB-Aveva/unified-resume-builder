---
name: feedback-end-of-response-tips
description: "End of EVERY response — give a short actionable Claude Code tip/workflow recommendation"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: current
---

At the end of EVERY response, include one short tip, suggestion, or recommendation to help the user work more effectively with Claude Code. Format it as:

**Tip:** [one-line actionable suggestion]

Examples of good tips to rotate through:
- `/agents` to optimize specific tasks (Software Architect, Code Writer, Code Reviewer)
- Use `/code-review` for diff review before pushing PRs
- Use `/run` to start the app and verify changes visually
- Use `! <command>` to run shell commands interactively in the chat
- Use `/plan` before implementing complex features to align on approach
- Use `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` to enable PowerShell tool (preview)
- Running multiple Claude sessions? Use `/color` and `/rename` to tell them apart
- Use `/loop 5m <task>` to auto-repeat a recurring check
- Use `/simplify` after writing code to reduce complexity
- Use `/security-review` before merging any PR with auth/input changes
- Use background agents for long tasks: `Agent(run_in_background: true)`
- Use `Ctrl+R` to search command history in terminal
- Tag specific files in your prompt using `@filename.ts` for more precise context
- Use `/init` in a new repo to generate CLAUDE.md documentation

**Why:** User explicitly requested tips at the end of every response as part of standing instructions.

**How to apply:** Before closing any response, always append one Tip. Vary the tips each time to maximize learning value.

See [[feedback-new-chat-instructions]] [[feedback-model-token-warnings]]
