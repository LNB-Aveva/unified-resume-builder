"""Tests for rate limiter cleanup, eviction, and concurrency."""

import threading

from app.core.rate_limit import SlidingWindowRateLimiter


class TestCleanupEviction:
    def test_expired_keys_are_removed(self):
        t = 0.0
        limiter = SlidingWindowRateLimiter(
            max_requests=100, window_seconds=10.0, time_func=lambda: t
        )
        limiter.check("old-ip")
        assert "old-ip" in limiter._requests

        t = 20.0
        limiter.check("new-ip")

        assert "old-ip" not in limiter._requests
        assert "new-ip" in limiter._requests

    def test_active_keys_survive_cleanup(self):
        t = 0.0
        limiter = SlidingWindowRateLimiter(
            max_requests=100, window_seconds=10.0, time_func=lambda: t
        )
        limiter.check("ip-a")

        t = 6.0
        limiter.check("ip-b")

        t = 15.0
        limiter.check("ip-c")

        assert "ip-a" not in limiter._requests
        assert "ip-b" in limiter._requests
        assert "ip-c" in limiter._requests

    def test_cleanup_prevents_unbounded_memory_growth(self):
        t = 0.0
        limiter = SlidingWindowRateLimiter(
            max_requests=100, window_seconds=10.0, time_func=lambda: t
        )
        for i in range(500):
            limiter.check(f"ip-{i}")

        t = 20.0
        limiter.check("survivor")

        assert len(limiter._requests) == 1
        assert "survivor" in limiter._requests


class TestConcurrency:
    def test_concurrent_requests_respect_limit(self):
        limiter = SlidingWindowRateLimiter(max_requests=50, window_seconds=60.0)
        results: list[bool] = []
        lock = threading.Lock()

        def hammer():
            for _ in range(20):
                allowed, _ = limiter.check("same-ip")
                with lock:
                    results.append(allowed)

        threads = [threading.Thread(target=hammer) for _ in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert len(results) == 200
        allowed_count = sum(1 for r in results if r)
        assert allowed_count == 50

    def test_concurrent_different_ips_independent(self):
        limiter = SlidingWindowRateLimiter(max_requests=5, window_seconds=60.0)
        ip_results: dict[str, list[bool]] = {}
        lock = threading.Lock()

        def per_ip(ip: str):
            local: list[bool] = []
            for _ in range(10):
                allowed, _ = limiter.check(ip)
                local.append(allowed)
            with lock:
                ip_results[ip] = local

        threads = [threading.Thread(target=per_ip, args=(f"ip-{i}",)) for i in range(5)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        for ip, results in ip_results.items():
            allowed = sum(1 for r in results if r)
            assert allowed == 5, f"{ip} got {allowed} allowed, expected 5"
