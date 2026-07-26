"""Shared rate limiter with real client IP extraction for Render + Cloudflare."""

from slowapi import Limiter
from starlette.requests import Request


def get_client_ip(request: Request) -> str:
    # Only trust CF-Connecting-IP when CF-Ray is also present (Cloudflare always
    # sets it); without CF-Ray the header could be spoofed by a direct caller.
    cf_ip = request.headers.get("CF-Connecting-IP")
    if cf_ip and request.headers.get("CF-Ray"):
        return cf_ip
    xff = request.headers.get("X-Forwarded-For")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


limiter = Limiter(key_func=get_client_ip)
