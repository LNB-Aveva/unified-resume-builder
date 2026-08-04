import logging
from collections.abc import Awaitable
from typing import Any

import httpx
from fastapi import HTTPException

from app.services.ai.hf_client import CircuitBreakerOpenError

logger = logging.getLogger(__name__)


async def call_ai_service(coro: Awaitable[Any]) -> Any:
    try:
        return await coro
    except BaseExceptionGroup as eg:
        first = eg.exceptions[0]
        await _raise_for_ai_exception(first)
    except CircuitBreakerOpenError:
        raise HTTPException(
            status_code=503,
            detail=(
                "AI service is temporarily offline. The system will automatically retry "
                "in about 60 seconds. Please try again shortly."
            ),
            headers={"Retry-After": "60"},
        ) from None
    except ValueError:
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured. Please contact support.",
        ) from None
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="AI service is temporarily unreachable. Please try again shortly.",
        ) from None
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="AI model timed out (cold-start can take 30s). Wait 30 seconds and try again.",
        ) from None
    except httpx.HTTPStatusError as e:
        logger.error("HF API error %s: %s", e.response.status_code, e.response.text[:200])
        raise HTTPException(
            status_code=502,
            detail="AI service temporarily unavailable.",
        ) from None
    except RuntimeError as e:
        logger.error("AI service error: %s", e)
        raise HTTPException(
            status_code=500,
            detail="AI generation failed. Please try again.",
        ) from None
    except Exception as e:
        logger.error("Unexpected AI error: %s: %s", type(e).__name__, e)
        raise HTTPException(status_code=500, detail="An internal error occurred.") from None


async def _raise_for_ai_exception(exc: BaseException) -> None:
    """Re-dispatch a single exception from an ExceptionGroup through typed handlers."""
    await call_ai_service(_raise(exc))


async def _raise(exc: BaseException) -> Any:
    raise exc
