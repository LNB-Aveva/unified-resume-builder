"""POST /api/v1/export/pdf -- generate ATS-friendly resume PDF."""

import logging
import re
import io

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.schemas.export import ResumeExportRequest
from app.services.export.pdf_generator import generate_pdf

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


def _safe_filename(name: str) -> str:
    safe = re.sub(r"[^\w\s-]", "", name).strip()
    safe = re.sub(r"\s+", "_", safe)
    return (safe or "resume")[:60]


@router.post(
    "/export/pdf",
    summary="Export resume as PDF",
    description=(
        "Accepts structured resume data and returns a professionally formatted "
        "ATS-friendly PDF file as a binary download."
    ),
    response_class=StreamingResponse,
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "PDF file download",
        }
    },
)
@limiter.limit("15/minute")
async def export_pdf(request: Request, export_req: ResumeExportRequest) -> StreamingResponse:
    if not export_req.personal.full_name.strip():
        raise HTTPException(status_code=422, detail="personal.full_name cannot be empty.")
    if not export_req.personal.email.strip():
        raise HTTPException(status_code=422, detail="personal.email cannot be empty.")

    try:
        pdf_bytes = generate_pdf(export_req)
    except Exception as e:
        logger.error("PDF generation failed: %s: %s", type(e).__name__, e)
        raise HTTPException(status_code=500, detail="PDF generation failed. Please check your input and try again.")

    filename = _safe_filename(export_req.filename or export_req.personal.full_name or "resume")

    return StreamingResponse(
        content=io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}.pdf"',
            "Content-Length": str(len(pdf_bytes)),
        },
    )
