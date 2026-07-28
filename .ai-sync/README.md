# .ai-sync — 2-Agent Coordination Directory

Keeps **Claude Code CLI** (2 Pro accounts) and **OpenAI Codex CLI** in sync
when both work on the same codebase.

## How It Works

```
┌─────────────────────┐          ┌─────────────────────┐
│     Claude Code      │          │    OpenAI Codex      │
│  reads: CLAUDE.md    │          │  reads: AGENTS.md    │
└──────────┬──────────┘          └──────────┬──────────┘
           │                                │
           └───────────────┬────────────────┘
                           │
                  ┌────────▼────────┐
                  │   .ai-sync/     │
                  │  WORKLOG.md     │  ← both agents read & write
                  │  DECISIONS.md   │  ← both agents read & write
                  └────────┬────────┘
                           │
                  ┌────────▼────────┐
                  │   git history   │
                  │  [claude] ...   │
                  │  [codex] ...    │
                  │  [manual] ...   │
                  └─────────────────┘
```

## Files

| File                  | Purpose                   | Who Reads    | Who Writes   |
|-----------------------|---------------------------|--------------|--------------|
| `CLAUDE.md`           | Claude Code instructions  | Claude Code  | Human        |
| `AGENTS.md`           | Codex CLI instructions    | Codex        | Human        |
| `.ai-sync/WORKLOG.md` | Shared task & session log | Both agents  | Both agents  |
| `.ai-sync/DECISIONS.md` | Architectural decisions | Both agents  | Both agents  |
| `.ai-sync/handoff.ps1` | Agent switching script   | Human        | —            |

## Quick Handoff

```powershell
# Switch to Claude Code:
.\.ai-sync\handoff.ps1 -To claude

# Switch Claude Code accounts, then hand off:
.\.ai-sync\handoff.ps1 -To claude -SwitchAccount

# Switch to Codex:
.\.ai-sync\handoff.ps1 -To codex
```

## Claude Account Switching

When switching between Claude Pro accounts, the `-SwitchAccount` option prints
the logout, login, and account-verification commands before the normal pickup
prompt. It does not execute those account commands for you.

## Token Strategy

| Task Type                              | Use Agent   | Why                          |
|----------------------------------------|-------------|------------------------------|
| Multi-file refactor, deep code review  | Claude Code | 200k context, best at arch   |
| Targeted bug fixes, feature impl       | Codex       | Strong at focused code edits |
| Simple tests, quick one-file changes   | Codex       | Save Claude tokens           |
| Architecture decisions, security audit | Claude Code | Reasoning depth              |
