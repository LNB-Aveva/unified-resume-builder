# Test-Quality Audit v2 — ResumeAI (2026-07-31)

Follow-up to the 2026-07-30 read-only audit (`2026-07-30_test-quality-audit.md`).
This pass re-measured the suite from scratch **and implemented the highest-impact
fixes** from that backlog. Method: ran the full backend suite with coverage, read
every critical module + its tests, performed manual mutation analysis, and ran the
full Playwright suite against a live dev server.

## Measured ground truth

| Metric | Before (claimed / prior) | After (this session, measured) |
|---|---|---|
| Backend tests | 319 claimed / 329 run | **341 pass, 20 skipped** |
| Backend coverage (`--cov=app`) | ~87% / 88% | **91.19%** |
| E2E tests | 24 claimed | **38 pass** (34 chromium + 4 mobile) |
| Playwright in CI | none | **`e2e` job added** |
| ruff / eslint | clean | clean |

---

## Section verdicts (unchanged findings from v1)

1. **Mock abuse — STRONG.** ~95% real tests, ~0% mock theater. Mocks concentrated in
   `test_hf_client.py` (network boundary) where they belong.
2. **Mutation testing — ADEQUATE→STRONG.** Two clean escapes existed and are now closed
   (ATS weight-swap, auth alg-confusion). Remaining escapes: rate-limit `_cleanup`
   eviction, PDF `_s()` sanitization fidelity (content not asserted), auth 503-unconfigured branch.
3. **Coverage gap — improved.** AI generation services (`rewriter`/`summarizer`/`cover_letter`)
   were 50–66% because the happy path never executed; now exercised via `call_hf`-mocked unit
   tests. Branch coverage still not enforced (`--cov-branch` off).
4. **E2E depth — improved but still shallow.** Mobile viewport + no-overflow + touch-target now
   covered; CI now runs E2E. Still uses a mocked backend; no real signed-in save/load/delete flow.
5. **Flaky risk — ADEQUATE.** Time is injected in hf/rate-limit tests; live-network RLS suite is
   correctly `skipif`-guarded (20 skipped). Global circuit-breaker state guarded by an autouse reset.
6. **Missing categories — still open:** contract/OpenAPI, visual regression, axe a11y automation,
   perf budgets, Supabase-down/HF-garbage chaos, property tests for auth/rate_limit/PDF.

---

## Fixes implemented this session

| Backlog item (DEC-025) | Fix | File |
|---|---|---|
| #1 AI success path untested | `call_hf`-mocked unit tests exercising real parse/assemble | `backend/tests/unit/test_ai_generation.py` (new) |
| #5 symmetric weight test hides hard/soft swap | asymmetric 70.0 vs 30.0 assertion | `backend/tests/unit/test_ats_scorer.py` |
| #3 no alg-confusion test | `alg=none` + `HS384` rejection tests | `backend/tests/integration/test_auth.py` |
| #6 no mobile project | Pixel 7 project scoped to mobile spec | `frontend/playwright.config.ts` |
| #6 no mobile spec | overflow / 44px target / analyzer flow / auth redirect | `frontend/tests/e2e/mobile.spec.ts` (new) |
| Playwright never gated merges | dedicated `e2e` CI job (`--with-deps`, dummy env) | `.github/workflows/ci.yml` |
| — | `test:e2e` script | `frontend/package.json` |

### Why service-level (not route-level) for the AI tests
Route→`call_hf`→200 depends on nondeterministic model text. Mocking only `call_hf`
lets us assert the deterministic parse/clean/assemble logic (numbered-block parsing,
per-bullet fallback, quote/code-fence/preamble stripping, empty-output `RuntimeError`)
without asserting on model prose.

### Why the mobile project is scoped, not global
`happy-path.spec.ts` asserts on nav CTAs that are `hidden sm:inline-flex` — invisible on
mobile by design. Running those specs under a phone viewport produced a false failure.
The mobile project therefore runs only the purpose-built `mobile.spec.ts`; desktop specs
stay chromium-only.

---

## Remaining backlog (not closed — needs owner decisions / infra)

- **Real signed-in E2E fixture** (save/load/delete resume, export download). Blocked on a
  Supabase test user + service-role key in CI (same blocker as the 20 skipped RLS tests).
- **Contract/OpenAPI tests** validating responses against `app.openapi()` schemas.
- **`--cov-branch` enforcement** so happy-path-only branches stop inflating the line %.
- **Concurrency test** for the threaded `SlidingWindowRateLimiter` and the module-global
  circuit breaker.
- **axe/WCAG automation**, visual regression, perf budgets, chaos (Supabase-down / HF-garbage).
- **Rate-limit `_cleanup` eviction** and **PDF `_s()` content-fidelity** assertions.

---

## Confidence

Pre-fix estimate was **~55%** chance of catching a real regression. With AI-parse paths now
exercised, the two mutation escapes closed, and E2E (incl. mobile) actually gating CI, the
blended estimate rises to **~70–72%**. The ceiling is still capped by the absence of a real
authenticated end-to-end flow (login/persistence/export) — the area where user-facing
regressions are most likely and currently least tested.
