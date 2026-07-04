import logging
from typing import Any, Awaitable

from fastapi import HTTPException
import httpx

logger = logging.getLogger(__name__)


async def call_ai_service(coro: Awaitable[Any]) -> Any:
    try:
        return await coro
    except ValueError:
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured. Please contact support.",
        )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="AI model timed out (cold-start can take 30s). Wait 30 seconds and try again.",
        )
    except httpx.HTTPStatusError as e:
        logger.error("HF API error %s: %s", e.response.status_code, e.response.text[:200])
        raise HTTPException(
            status_code=502,
            detail="AI service temporarily unavailable.",
        )
    except RuntimeError as e:
        logger.error("AI service error: %s", e)
        raise HTTPException(
            status_code=500,
            detail="AI generation failed. Please try again.",
        )
    except Exception as e:
        logger.error("Unexpected AI error: %s: %s", type(e).__name__, e)
        raise HTTPException(status_code=500, detail="An internal error occurred.")
