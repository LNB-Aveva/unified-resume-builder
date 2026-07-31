# ResumeAI — Test Quality Audit (2026-07-30)

Read-only audit answering: *would the 319 backend tests + Playwright E2E actually catch
bugs, or are they testing illusions?* Scope: 18 backend test files (~305 raw `def test_`,
~319 with parametrization), 3 Playwright specs (30 test blocks — not 24), and the 5 critical
modules (`auth`, `rate_limit`, `ats_scorer`, `pdf_generator`, `hf_client`) read line-by-line.

**Overall confidence: ~55%** chance of catching a real regression on a random deploy.
Strong on pure logic (~85%), near-blind on the authenticated AI product flow (~15%) and
cross-cutting quality (~5%).

## Section verdicts

| # | Section | Verdict |
|---|---------|---------|
| 1 | Mock abuse | **STRONG** (~95% real, ~0% mock theater) |
| 2 | Mutation resistance | **ADEQUATE** (auth strong; leaks elsewhere) |
| 3 | Coverage gaps | **WEAK** (no branch cov; AI success path untested) |
| 4 | E2E depth | **WEAK** (mocked backend, no auth/mobile/multi-browser) |
| 5 | Flaky risk | **WEAK** (wall-clock ReDoS, shared limiter state) |
| 6 | Missing categories | **WEAK/ABSENT** (contract, a11y, visual, latency) |

## 1. Mock abuse — STRONG

Only 4/18 files touch mocks, all at legitimate external boundaries:
`test_hf_client.py` (AsyncMock on `client.post` + fake `time.monotonic`), `test_access_log.py`
(logger handlers), `test_load_smoke.py` (`httpx.MockTransport`), `test_rls_isolation.py`
(real httpx→Supabase, skipped in CI). No test passes with production code deleted.

Near-tautologies flagged:
- `test_ats_scorer.py::test_weighted_scoring` — symmetric hard=1/2, soft=1/2 → `50*0.7+50*0.3
  == 50*0.3+50*0.7`; **cannot detect a hard/soft weight swap**.
- `test_adversarial.py::test_sanitizer_cyrillic_bypass` — asserts only `isinstance(result, str)`.
- `test_adversarial.py::test_injection_buried_in_50k` — `or` in the assert masks partial bypass.

## 2. Mutation resistance — ADEQUATE

- **auth.py — STRONG:** expiry/audience/signature/`sub` mutations all caught. **Gap:** no
  `alg:none` / RS256-key-confusion test — every rejection test signs with HS256, so HS256
  enforcement is never proven.
- **rate_limit.py:** always-True `check()` caught; `>=`→`>` caught. **Gap:** deleting
  `_cleanup()` body is NOT caught (unbounded memory growth / DoS).
- **ats_scorer.py:** return-100 and grade `>=`→`>` caught. **Gap:** hard/soft weight swap NOT
  caught (see §1 tautology).
- **pdf_generator.py:** skipping `_s()` only partially caught (em-dash crashes fpdf); **no test
  asserts text fidelity** (Ž→Z, ñ→n) — tests only check `%PDF-` magic bytes.
- **hf_client.py — STRONG:** retry count, backoff, circuit-breaker states, half-open probe,
  recovery timer, counter reset all covered with a fake clock.

**Bug found (not a mutation):** in `call_hf`, `_record_failure` runs only when
`_is_retryable(exc)`. A **non-retryable** exception during a half-open probe leaves
`_half_open_probe_in_flight = True` forever, permanently wedging the breaker. No test covers it.

## 3. Coverage gaps — WEAK

CI uses `--cov=app --cov-fail-under=80` with **no `--cov-branch`** → happy-path-only branches
count as covered; the 87% line figure overstates real coverage.

- The AI success path (route → sanitize → `call_hf` → parse → 200) is **untested**. AI endpoint
  tests (`/summary`, `/rewrite`, `/cover-letter`) assert only 422 validation (no HF key/stub),
  so `cover_letter.py`, `summarizer.py`, `preview.py`, and the rewriter success path are ~0%.
- The `RuntimeError("Unexpected response shape")` branch (malformed HF JSON) is uncovered.
- Concurrency: `SlidingWindowRateLimiter` has a `threading.Lock` but no thread-based test.

**Priority fix (highest value):**
```python
async def test_rewrite_success_path(client, auth_headers, monkeypatch):
    monkeypatch.setattr(hf_client, "_get_api_key", lambda: "k")
    monkeypatch.setattr(hf_client, "_get_client",
        lambda: type("C",(),{"post": AsyncMock(return_value=_success_response())})())
    r = await client.post("/api/v1/rewrite",
        json={"job_title":"Dev","bullets":"Built APIs","missing_keywords":"python"},
        headers=auth_headers)
    assert r.status_code == 200 and r.json()["rewrites"]
```

## 4. E2E depth — WEAK (and mis-claimed)

- Mocks the backend (`page.route("**/api/v1/analyze", ...)`); only the public analyze route.
- Never signs in — auth tests only assert redirect to `/sign-in` and that forms render.
- No score/results-against-backend, no save/load/delete (blocked on Phase 4).
- `playwright.config.ts` defines a **single `chromium` project** at default desktop viewport.

**False claims in `docs/LAUNCH_PROGRAM.md`:**
- 7.3 "Test full journeys at 375px, 768px, and desktop … DONE" — no viewport projects exist.
- a11y/keyboard/mobile "Definition of Done" — no axe/a11y/mobile tests exist.
- Count: specs contain 30 test blocks (18+6+6), not "24".

## 5. Flaky risk — WEAK

- 10 wall-clock ReDoS assertions in `test_adversarial.py` (`assert perf_counter()-start < 2.0`)
  — flake on loaded CI. Prefer `pytest.mark.timeout` / size scaling.
- The real app's module-level `global_ip_limiter` (200/60s) + slowapi state are shared; `test_auth`
  + `test_endpoints` fire 100+ requests at the real app from one test IP → order-dependent 429
  flake as the suite grows. No per-test reset.
- `test_eval_harness.py` asserts scoring quality `>= 80%` — flips red on legitimate tuning.

## 6. Missing categories

| Category | Status |
|----------|--------|
| Contract / OpenAPI schema | ABSENT |
| Visual regression | ABSENT |
| Accessibility (axe/WCAG) | ABSENT (despite LAUNCH claims) |
| Performance / latency budgets | ABSENT (only ReDoS wall-clock) |
| Chaos (Supabase down, HF garbage) | PARTIAL (HF breaker good; Supabase-down untested) |
| Property-based | PARTIAL (scoring/compliance/keyword only; none for sanitizer/auth/pdf) |

## Top 5 fixes (priority order)

1. Add the AI success-path integration test (§3) — unlocks the untested core flow.
2. De-tautologize `test_weighted_scoring` (asymmetric weights) — catches the weight-swap mutation.
3. Add a JWT `alg:none` / RS256-confusion rejection test — real auth-bypass class.
4. Enable `--cov-branch` and reset `global_ip_limiter` between tests — fix inflated coverage + flake.
5. Add mobile + signed-in Playwright projects, and correct the false "DONE" claims in
   `docs/LAUNCH_PROGRAM.md` (7.3, a11y, mobile).
