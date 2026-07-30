"""Shared rate limiters with real client IP extraction for Render + Cloudflare."""

import math
import threading
import time
from collections import deque
from collections.abc import Callable

from slowapi import Limiter
from starlette.requests import Request


def get_client_ip(request: Request) -> str:
    # Only trust CF-Connecting-IP when CF-Ray is also present (Cloudflare always
    # sets it); without CF-Ray the header could be spoofed by a direct caller.
    cf_ip = request.headers.get("CF-Connecting-IP")
    if cf_ip and request.headers.get("CF-Ray"):
        return cf_ip
    # X-Forwarded-For leftmost entry is client-supplied and cannot be trusted
    # when there is no upstream proxy asserting it. Fall back to the socket IP.
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
