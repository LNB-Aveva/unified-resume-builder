---
name: full-release
description: Full release cycle — lint, build, test, commit, push, verify in browser, take screenshots
---

# Full Release Workflow

Run this end-to-end when shipping a feature:

1. **Read AGENTS.md** — `frontend/AGENTS.md` for Next.js 16 breaking changes
2. **Frontend build** — `cd frontend && npx next build` — must pass with zero errors
3. **Backend tests** — `cd backend && python -m pytest -q` — all tests must pass
4. **Git status** — review changed files, never stage `.env`, credentials, or unrelated files
5. **Verify git email** — must be `274821620+LNB-Aveva@users.noreply.github.com`
6. **Commit** — short, casual, human message (1 sentence). NO Co-Authored-By, NO emojis
7. **Push** — `git push` immediately after commit
8. **Browser verify** — open `http://localhost:3000/` in Chrome, check both light and dark mode
9. **Screenshot** — capture hero, How It Works, and any changed sections
10. **Report** — list commit hash, what changed, what to verify on live site

### Rules
- Never use `git add -A` or `git add .`
- Never add Co-Authored-By or AI mentions
- Push immediately after every commit
- Create new skills if a reusable pattern emerges
