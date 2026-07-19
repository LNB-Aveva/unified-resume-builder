Run a comprehensive security hardening check on the full stack:

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

7. Check for known CVEs in backend dependencies:
   cd backend && pip-audit

8. Check for known CVEs in frontend dependencies:
   cd frontend && npm audit --audit-level=high

9. Verify CSP headers do not include unsafe-eval in production:
   grep -n "unsafe-eval" frontend/next.config.ts

10. Generate SBOM (backend + frontend):
    cd backend && cyclonedx-py environment --output-format JSON > ../.audit/sbom-backend.json
    cd frontend && npm sbom --sbom-format cyclonedx > ../.audit/sbom-frontend.json

Report a summary: PASS/FAIL for each step, total test count, coverage %, and any new findings.
