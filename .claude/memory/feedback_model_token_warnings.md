---
name: feedback-model-token-warnings
description: Always warn user about model/effort changes needed and when to start fresh chat to save tokens — applies to ALL conversations
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 70919fd1-a9de-4b41-b851-27f7055ff94f
---

At any point during conversation, proactively warn the user:
1. If a model or effort change would be more appropriate for the current task (e.g. switch to Sonnet for boilerplate generation, use Opus for architecture decisions)
2. If the conversation is getting long enough that tokens are being wasted — suggest starting a fresh chat BEFORE 60% context usage or auto-compact
3. When suggesting a new chat, provide the specific content/context to paste into the new chat to continue seamlessly from where we left off
4. Do NOT let the conversation keep compacting silently — warn before it gets there
5. After generating any output, assess and warn proactively — do not wait for the user to ask
6. When warning about model change, specify which model is appropriate and why based on the current task/work

**Why:** User explicitly wants to avoid wasting tokens on long conversations that get compacted. Prefers fresh chats with context handoff over paying for compaction overhead. This applies to ALL conversations in this CLI, not just specific tasks.

**How to apply:** After generating output in any conversation, assess conversation length vs remaining useful context window. If past ~60% capacity or if heavy content (video frames, large file reads) has been loaded, warn explicitly. Provide a ready-to-paste summary block for continuing in a new chat. This is a standing instruction for every conversation — not optional. Keep warning as/when needed based on task/work complexity.

See [[feedback-stepbystep]]
