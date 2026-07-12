---
name: feedback-github-noreply-email
description: LNB-Aveva GitHub account requires noreply email for all commits — bobby.bingo696@gmail.com is blocked by GH007
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 9b5342fd-4466-4263-a46a-5f24c86cd0f9
---

When pushing to LNB-Aveva repos, commits MUST use the GitHub noreply email:
`274821620+LNB-Aveva@users.noreply.github.com`

The gmail address `bobby.bingo696@gmail.com` is set as private on GitHub — pushes with it are rejected with GH007 "Your push would publish a private email address."

**Why:** GitHub email privacy setting blocks pushes containing the private email. Discovered 2026-07-03 when PR #20 push failed 3 times.

**How to apply:** When committing to standalone repos (not my-workspace), always use:
```
git -c user.email="274821620+LNB-Aveva@users.noreply.github.com" -c user.name="Laxmi Narayana Bingi" commit ...
```
Or the user can permanently fix by unchecking "Block command line pushes that expose my email" at github.com/settings/emails.
