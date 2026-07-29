import asyncio
import logging
import os

import httpx

MODEL = "Qwen/Qwen2.5-7B-Instruct:fastest"
API_URL = "https://router.huggingface.co/v1/chat/completions"

_MAX_RETRIES = 2
_BACKOFF_BASE = 1.0

logger = logging.getLogger(__name__)

_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient()
    return _client


async def close_client() -> None:
    global _client
    if _client is not None and not _client.is_closed:
        await _client.aclose()
        _client = None


def _get_api_key() -> str:
    api_key = os.environ.get("HUGGINGFACE_API_KEY", "").strip()
    if not api_key or api_key == "hf_your_key_here":
        raise ValueError(
            "HUGGINGFACE_API_KEY is not set. "
            "Get a free key at https://huggingface.co/settings/tokens "
            "and add it to backend/.env, then restart the server."
        )
    return api_key


def _is_retryable(exc: Exception) -> bool:
    if isinstance(exc, httpx.TimeoutException):
        return True
    if isinstance(exc, httpx.HTTPStatusError) and exc.response.status_code >= 500:
        return True
    return False


async def call_hf(
    messages: list[dict],
    max_tokens: int,
    temperature: float,
    timeout: float = 30.0,
) -> str:
    api_key = _get_api_key()

    payload = {
        "model": MODEL,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    client = _get_client()
    last_exc: Exception | None = None

    for attempt in range(_MAX_RETRIES + 1):
        try:
            response = await client.post(API_URL, json=payload, headers=headers, timeout=timeout)
            response.raise_for_status()
            data = response.json()

            try:
                return data["choices"][0]["message"]["content"]
            except (KeyError, IndexError, TypeError):
                raise RuntimeError(f"Unexpected response shape from HuggingFace: {data}") from None

        except Exception as exc:
            last_exc = exc
            if attempt < _MAX_RETRIES and _is_retryable(exc):
                delay = _BACKOFF_BASE * (2 ** attempt)
                logger.warning("HF call attempt %d failed (%s), retrying in %.1fs", attempt + 1, exc, delay)
                await asyncio.sleep(delay)
                continue
            raise

    raise last_exc  # type: ignore[misc]
