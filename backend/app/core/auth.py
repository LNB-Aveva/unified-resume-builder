"""Supabase JWT verification for authenticated API routes."""

import logging
from functools import lru_cache

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings

logger = logging.getLogger(__name__)

_bearer = HTTPBearer(auto_error=False)


@lru_cache(maxsize=4)
def _get_jwks_client(supabase_url: str) -> jwt.PyJWKClient:
    """Return a cached verifier for a configured Supabase project."""
    jwks_url = f"{supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
    return jwt.PyJWKClient(jwks_url, cache_keys=True, timeout=5)


def require_auth(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),  # noqa: B008
) -> str:
    """FastAPI dependency that verifies a Supabase JWT and returns the user ID.

    Returns the ``sub`` claim (Supabase user UUID) on success.
    Raises 401 if the token is missing, expired, or invalid.
    Raises 503 if the verifier is not configured or Supabase JWKS is unavailable.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        token = credentials.credentials
        algorithm = jwt.get_unverified_header(token).get("alg")

        if settings.SUPABASE_URL:
            # JWKS path (production) — reject algorithm downgrade attempts: only
            # ES256/RS256 tokens are valid here, even if SUPABASE_JWT_SECRET is
            # also configured for local development.
            if algorithm not in {"ES256", "RS256"}:
                raise jwt.InvalidAlgorithmError("Unsupported JWT signing algorithm")
            supabase_url = settings.SUPABASE_URL.rstrip("/")
            signing_key = _get_jwks_client(supabase_url).get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256", "RS256"],
                audience="authenticated",
                issuer=f"{supabase_url}/auth/v1",
            )
        elif settings.SUPABASE_JWT_SECRET:
            # HS256 path (local dev only, no SUPABASE_URL configured)
            if algorithm != "HS256":
                raise jwt.InvalidAlgorithmError("Unsupported JWT signing algorithm")
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication is not configured on this server.",
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None
    except jwt.PyJWKClientConnectionError as e:
        logger.error("Supabase JWKS is unavailable: %s", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is temporarily unavailable.",
        ) from None
    except jwt.PyJWKClientError as e:
        logger.warning("JWT signing key validation failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None
    except jwt.InvalidTokenError as e:
        logger.warning("JWT validation failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None

    user_id: str | None = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user identity.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Supabase anonymous sign-ins receive the same ``authenticated`` role as
    # permanent accounts. Without an explicit claim check, a bot can create
    # throw-away identities without completing the email/OAuth signup controls
    # and use each identity as a fresh application account.
    if payload.get("is_anonymous") is True:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="A permanent account is required.",
        )

    return user_id
