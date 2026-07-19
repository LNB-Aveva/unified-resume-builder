Run a comprehensive security hardening check on the backend:

1. Run ruff lint with security rules:
   cd backend && python -m ruff check app/ --config ruff.toml

2. Run bandit security scan:
   cd backend && python -m bandit -c bandit.yaml -r app/

3. Run semgrep with Python + security-audit rules:
   cd backend && semgrep --config=p/python --config=p/security-audit app/

4. Run mypy type checking:
   cd backend && python -m mypy app/ --config-file mypy.ini

5. Run detect-secrets scan (compare against baseline):
   detect-secrets scan --baseline .secrets.baseline

6. Run all tests including property-based (with coverage):
   cd backend && python -m pytest --cov=app --cov-report=term-missing -x -q

7. Check for known CVEs in dependencies:
   cd backend && pip-audit

8. Verify CSP headers do not include unsafe-eval in production:
   grep -n "unsafe-eval" frontend/next.config.ts

Report a summary: PASS/FAIL for each step, total test count, coverage %, and any new findings.
