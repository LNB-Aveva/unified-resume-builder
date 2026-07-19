---
name: frontend-check
description: Run all frontend quality checks (build, lint, type-check)
---

# Frontend Quality Check

1. Read `frontend/AGENTS.md` first (Next.js 16 breaking changes)
2. Run `npm run build` in `frontend/` — catches TypeScript and build errors
3. Check for any `dark:` variant consistency if UI was modified
4. Report results
