"""Unit tests for spoof-resistant client IP extraction (rate-limit key)."""

from starlette.requests import Request

from app.core.rate_limit import get_client_ip


def _request(headers: dict[str, str], client_host: str | None = "10.0.0.1") -> Request:
    raw_headers = [(k.lower().encode(), v.encode()) for k, v in headers.items()]
    scope = {
        "type": "http",
        "headers": raw_headers,
        "client": (client_host, 12345) if client_host else None,
    }
    return Request(scope)


def test_cloudflare_ip_used_only_with_cf_ray():
    req = _request({"CF-Connecting-IP": "203.0.113.5", "CF-Ray": "abc"})
    assert get_client_ip(req) == "203.0.113.5"


def test_cf_connecting_ip_ignored_without_cf_ray():
    # Without CF-Ray the header is untrusted; fall through to XFF/socket.
    req = _request({"CF-Connecting-IP": "203.0.113.5"}, client_host="10.0.0.9")
    assert get_client_ip(req) == "10.0.0.9"


def test_rightmost_xff_entry_is_used():
    # Render appends the real client IP as the rightmost entry.
    req = _request({"X-Forwarded-For": "198.51.100.7"})
    assert get_client_ip(req) == "198.51.100.7"


def test_spoofed_leftmost_xff_cannot_change_the_key():
    # Attacker prepends fake entries; Render still appends the real IP last.
    victim = _request({"X-Forwarded-For": "198.51.100.7"})
    attacker = _request({"X-Forwarded-For": "1.2.3.4, 5.6.7.8, 198.51.100.7"})
    # Both resolve to the same (real, rightmost) IP -> same bucket, no bypass.
    assert get_client_ip(victim) == get_client_ip(attacker) == "198.51.100.7"


def test_falls_back_to_socket_without_headers():
    req = _request({}, client_host="172.16.0.4")
    assert get_client_ip(req) == "172.16.0.4"


def test_unknown_when_no_client_and_no_headers():
    req = _request({}, client_host=None)
    assert get_client_ip(req) == "unknown"
