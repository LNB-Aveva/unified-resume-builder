"""Shared rate limiters with real client IP extraction for Render + Cloudflare."""

import math
import os
import threading
import time
from collections import deque
from collections.abc import Callable

from slowapi import Limiter
from starlette.requests import Request

# Number of trusted reverse-proxy hops in front of the app that append to
# X-Forwarded-For (Render's edge appends exactly one). The real client IP is the
# entry this many positions from the RIGHT of X-Forwarded-For; everything to the
# left of it is client-supplied and spoofable.
_TRUSTED_PROXY_HOPS = max(1, int(os.getenv("TRUSTED_PROXY_HOPS", "1") or "1"))


def get_client_ip(request: Request) -> str:
    # Only trust CF-Connecting-IP when CF-Ray is also present (Cloudflare always
    # sets it); without CF-Ray the header could be spoofed by a direct caller.
    cf_ip = request.headers.get("CF-Connecting-IP")
    if cf_ip and request.headers.get("CF-Ray"):
        return cf_ip
    # Behind Render's proxy the genuine client IP is appended as the RIGHTMOST
    # X-Forwarded-For entry. We must NOT use the leftmost entry: it is
    # client-supplied, so keying the rate limiter on it lets an attacker mint a
    # fresh bucket per request by rotating the header. Skipping _TRUSTED_PROXY_HOPS
    # entries from the right reaches the value our own proxy asserted. This fails
    # safe: if the header is missing/short we fall back to the socket peer, which
    # at worst shares one bucket rather than being attacker-controllable.
    xff = request.headers.get("X-Forwarded-For")
    if xff:
        parts = [p.strip() for p in xff.split(",") if p.strip()]
        if parts:
            idx = len(parts) - _TRUSTED_PROXY_HOPS
            return parts[idx] if idx >= 0 else parts[0]
    return request.client.host if request.client else "unknown"


limiter = Limiter(key_func=get_client_ip)


class SlidingWindowRateLimiter:
    """Thread-safe, in-memory sliding-window limiter keyed by client IP."""

    def __init__(
        self,
        max_requests: int = 200,
        window_seconds: float = 60.0,
        time_func: Callable[[], float] = time.monotonic,
    ) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._time_func = time_func
        self._requests: dict[str, deque[float]] = {}
        self._lock = threading.Lock()
        self._last_cleanup = self._time_func()

    def check(self, key: str) -> tuple[bool, int]:
        """Record an allowed request or return the seconds until retry is safe."""
        now = self._time_func()
        cutoff = now - self.window_seconds

        with self._lock:
            if now - self._last_cleanup >= self.window_seconds:
                self._cleanup(cutoff)
                self._last_cleanup = now

            requests = self._requests.setdefault(key, deque())
            while requests and requests[0] <= cutoff:
                requests.popleft()

            if len(requests) >= self.max_requests:
                retry_after = max(1, math.ceil(requests[0] + self.window_seconds - now))
                return False, retry_after

            requests.append(now)
            return True, 0

    def _cleanup(self, cutoff: float) -> None:
        expired_keys: list[str] = []
        for key, requests in self._requests.items():
            while requests and requests[0] <= cutoff:
                requests.popleft()
            if not requests:
                expired_keys.append(key)
        for key in expired_keys:
            del self._requests[key]


global_ip_limiter = SlidingWindowRateLimiter()
