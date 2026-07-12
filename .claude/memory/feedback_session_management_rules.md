---
name: feedback-session-management-rules
description: "Context window warnings at 70%, model suitability warnings, handover content for new chats, tips at end of every response"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5ddfbd49-f786-4d69-aa8d-39188197c19f
---

## Rules for every session:

1. **70% Context Window Warning:** When the token percentage shown by `/context` reaches 70%, warn user to start a new chat. The percentage is shown as "61.1k/200k tokens (31%)" — treat that **31%** as the number to watch. At 70% of that shown percentage, trigger the warning. Provide copy-paste handover content summarizing what was done and what's next.

2. **Model/Effort Suitability Warning:** If the current model/effort level isn't optimal for the task at hand, suggest switching. E.g., research/architecture → Opus, implementation → Sonnet, quick lookups → Haiku.

3. **End-of-Response Tips:** Always append one Claude Code tip/workflow recommendation at the end of every response. Examples: keyboard shortcuts, agent types, parallel tools, /commands, etc. [[feedback_end_of_response_tips]]

4. **Session Memory Saving:** Save important findings, decisions, and progress to memory files and/or session logs after every significant output.

5. **Handover Content Format (at 70%):**
   ```
   ## Handover for Next Chat
   ### Context: [project name]
   ### What was done this session: [bullet list]
   ### Current state: [file states, what works]
   ### What's next: [prioritized list]
   ### Key decisions made: [list]
   ### Commands to resume: [exact commands]
   ```

**Why:** User wants continuity across sessions without losing progress, and wants proactive guidance on efficiency.
**How to apply:** Check context usage periodically. Always end responses with a tip. Save to memory after significant work.
