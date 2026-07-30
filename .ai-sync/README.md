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
| `.ai-sync/codex-mode.ps1` | Codex mode launcher   | Human        | —            |

## Quick Handoff

```powershell
# Switch to Claude Code:
.\.ai-sync\handoff.ps1 -To claude

# Switch Claude Code accounts, then hand off:
.\.ai-sync\handoff.ps1 -To claude -SwitchAccount

# Switch to Codex:
.\.ai-sync\handoff.ps1 -To codex
```

## Codex Modes

Launch the interactive chooser from the repository root:

```powershell
.\.ai-sync\codex-mode.ps1
```

Or select a mode directly:

```powershell
.\.ai-sync\codex-mode.ps1 -Mode auto
.\.ai-sync\codex-mode.ps1 -Mode plan
.\.ai-sync\codex-mode.ps1 -Mode edit
.\.ai-sync\codex-mode.ps1 -Mode normal
.\.ai-sync\codex-mode.ps1 -Mode unattended
```

| Mode | Sandbox | Approvals | Intended use |
|------|---------|-----------|--------------|
| `auto` | workspace-write | on-request | Recommended day-to-day coding |
| `plan` | read-only | on-request | Safe planning; enter `/plan` or press Shift+Tab after launch |
| `edit` | workspace-write | untrusted | Edit files while confirming untrusted commands |
| `normal` | read-only | on-request | Questions, exploration, and review |
| `unattended` | workspace-write + network | never | Trusted automation confined to the workspace sandbox |

`Plan` is a Codex interaction mode, while the other choices are approval and
sandbox presets. The CLI does not currently expose a supported launch flag for
Plan mode, so the launcher starts it read-only and displays the native `/plan`
instruction. Use `-DryRun` to inspect a mode's exact command without launching
Codex. The launcher intentionally does not offer `--yolo`, which disables both
approvals and sandboxing.

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
