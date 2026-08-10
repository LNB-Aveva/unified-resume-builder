"""Authentication helpers for credential-gated Supabase production tests."""

from __future__ import annotations

import httpx


def access_token_from_admin_magic_link(
    *,
    auth_url: str,
    anon_key: str,
    service_key: str,
    email: str,
) -> str:
    """Mint a test-user session without bypassing or disabling CAPTCHA globally."""
    admin_headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }
    generated = httpx.post(
        f"{auth_url}/admin/generate_link",
        headers=admin_headers,
        json={"type": "magiclink", "email": email},
        timeout=30,
    )
    assert generated.status_code == 200, (
        f"Admin magic-link generation failed for {email}: {generated.text}"
    )

    generated_body = generated.json()
    properties = generated_body.get("properties") or generated_body
    token_hash = properties.get("hashed_token")
    assert token_hash, "Admin magic-link response omitted hashed_token"

    verified = httpx.post(
        f"{auth_url}/verify",
        headers={"apikey": anon_key, "Content-Type": "application/json"},
        json={"type": "magiclink", "token_hash": token_hash},
        timeout=30,
    )
    assert verified.status_code == 200, (
        f"Admin magic-link verification failed for {email}: {verified.text}"
    )

    access_token = verified.json().get("access_token")
    assert access_token, "Magic-link verification response omitted access_token"
    return access_token
