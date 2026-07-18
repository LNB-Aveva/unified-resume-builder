Run a comprehensive security hardening check on the backend:

1. Run ruff lint with security rules:
   cd backend && python -m ruff check app/ --config ruff.toml

2. Run bandit security scan:
   cd backend && python -m bandit -c bandit.yaml -r app/

3. Run all tests (including security, adversarial, and integration):
   cd backend && python -m pytest -x -q

4. Check for known CVEs in dependencies:
   cd backend && pip audit 2>/dev/null || echo "pip-audit not installed (optional)"

5. Verify CSP headers do not include unsafe-eval in production:
   grep -n "unsafe-eval" frontend/next.config.ts

Report a summary: PASS/FAIL for each step, total test count, and any new findings.
