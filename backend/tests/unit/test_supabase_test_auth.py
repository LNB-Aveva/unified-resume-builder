"""Regression tests for CAPTCHA-compatible production test authentication."""

import ast
from pathlib import Path

import httpx

from tests.integration import _supabase_test_auth

RLS_SUITE = Path(__file__).resolve().parents[1] / "integration" / "test_rls_isolation.py"


def test_access_token_uses_admin_magic_link_then_verifies_hash(monkeypatch):
    calls: list[dict] = []

    def fake_post(url, *, headers, json, timeout):
        calls.append(
            {"url": url, "headers": headers, "json": json, "timeout": timeout}
        )
        if url.endswith("/admin/generate_link"):
            return httpx.Response(200, json={"hashed_token": "hashed-test-token"})
        return httpx.Response(200, json={"access_token": "user-access-token"})

    monkeypatch.setattr(_supabase_test_auth.httpx, "post", fake_post)

    token = _supabase_test_auth.access_token_from_admin_magic_link(
        auth_url="https://project.supabase.co/auth/v1",
        anon_key="anon-key",
        service_key="service-key",
        email="test@example.com",
    )

    assert token == "user-access-token"
    assert calls[0]["url"].endswith("/admin/generate_link")
    assert calls[0]["headers"]["Authorization"] == "Bearer service-key"
    assert calls[0]["json"] == {"type": "magiclink", "email": "test@example.com"}
    assert calls[1]["url"].endswith("/verify")
    assert calls[1]["headers"] == {
        "apikey": "anon-key",
        "Content-Type": "application/json",
    }
    assert calls[1]["json"] == {
        "type": "magiclink",
        "token_hash": "hashed-test-token",
    }


def test_access_token_accepts_client_library_properties_shape(monkeypatch):
    responses = iter(
        (
            httpx.Response(
                200,
                json={"properties": {"hashed_token": "nested-hash"}},
            ),
            httpx.Response(200, json={"access_token": "nested-access-token"}),
        )
    )
    monkeypatch.setattr(
        _supabase_test_auth.httpx,
        "post",
        lambda *args, **kwargs: next(responses),
    )

    token = _supabase_test_auth.access_token_from_admin_magic_link(
        auth_url="https://project.supabase.co/auth/v1",
        anon_key="anon-key",
        service_key="service-key",
        email="test@example.com",
    )

    assert token == "nested-access-token"


def test_every_rls_sign_in_call_uses_captcha_safe_signature():
    tree = ast.parse(RLS_SUITE.read_text(encoding="utf-8"))
    calls = [
        node
        for node in ast.walk(tree)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Name)
        and node.func.id == "_sign_in"
    ]

    assert calls
    assert all(len(call.args) == 1 and not call.keywords for call in calls)
