# Backend load tests

`load_test.py` exercises all nine POST routes with only `asyncio` and the project's
existing `httpx` dependency. It uses 20 concurrent workers for `analyze` and
`preview-rewrite`, and 2–3 workers for the remaining routes to limit provider load.

From `backend/`, validate every sample payload without making network requests:

```powershell
python tests/load/load_test.py --dry-run
```

Start the API, obtain a current Supabase access token from an authenticated session,
then run the bounded default scenario:

```powershell
$env:LOAD_TEST_AUTH_TOKEN = "<access-token>"
python tests/load/load_test.py --base-url http://127.0.0.1:8000
```

The token is sent only to the seven protected routes. It can instead be supplied with
`--token`. Defaults are 20 requests per high-concurrency route and 5 requests per
low-concurrency route. Adjust them deliberately with `--deterministic-requests` and
`--ai-requests`; stay within Hugging Face and application fair-use limits. The public
preview route is deterministic and quota-free; authenticated summary, cover-letter,
and rewrite requests consume durable daily AI units.

Each output line reports throughput (`rps`), p50/p95/p99 response latency, non-2xx or
transport error rate, and timeout rate. A high error rate with HTTP 429 responses means
the test reached a configured rate limit, not necessarily that the service failed.
Compare latency percentiles across repeated runs under the same request counts; p95 and
p99 expose slow-tail behavior that an average can hide.

The pytest smoke wrapper uses an in-process mock transport and sends five requests for
each route without contacting the API or Hugging Face:

```powershell
python -m pytest tests/load/test_load_smoke.py
```
