import os

import httpx

MODEL = "Qwen/Qwen2.5-7B-Instruct:fastest"
API_URL = "https://router.huggingface.co/v1/chat/completions"

_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient()
    return _client


def _get_api_key() -> str:
    api_key = os.environ.get("HUGGINGFACE_API_KEY", "").strip()
    if not api_key or api_key == "hf_your_key_here":
        raise ValueError(
            "HUGGINGFACE_API_KEY is not set. "
            "Get a free key at https://huggingface.co/settings/tokens "
            "and add it to backend/.env, then restart the server."
        )
    return api_key


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
    response = await client.post(API_URL, json=payload, headers=headers, timeout=timeout)
    response.raise_for_status()
    data = response.json()

    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        raise RuntimeError(f"Unexpected response shape from HuggingFace: {data}") from None
