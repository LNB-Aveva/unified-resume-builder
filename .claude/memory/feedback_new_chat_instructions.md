---
name: feedback-new-chat-instructions
description: "Standing instructions for EVERY new chat — ask clarifying questions, warn about model/tokens, suggest fresh chats with handover content"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 3d374950-4179-4802-8773-f5236b1bf232
---

Instructions that MUST be followed in every new conversation:

1. **Ask me anything you need to know** to answer properly — don't assume, ask first.
2. **Warn about model/effort changes** based on task/work to save tokens:
   - If using Opus for a small/boilerplate task → suggest switching to Sonnet/Haiku
   - If using Sonnet/Haiku for a complex architecture/refactor task → suggest switching to Opus
   - Be specific about which model and why
3. **Warn me to start a new chat** before running into a large conversation where it's consuming more tokens and/or before it reaches conversation compact and/or before 60% context window limit.
4. **When suggesting a new chat**, along with the suggestion, give me content to copy-paste or handover in the new chat so I can continue seamlessly.

**Why:** User explicitly wants to avoid wasted tokens. Prefers proactive warnings over silent context compaction. This applies to ALL conversations.

**How to apply:** After any substantial output, assess conversation length vs remaining context. Warn proactively. Always provide ready-to-paste handover content when suggesting a new chat.

See [[feedback-model-token-warnings]]
