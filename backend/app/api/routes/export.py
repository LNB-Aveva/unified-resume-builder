"""
export.py — API route for PDF resume export.

ENDPOINT: POST /api/v1/export/pdf

WHY StreamingResponse INSTEAD OF FileResponse:
  FileResponse serves a file that already exists on disk.
  Our PDF is generated in memory (bytes) and never written to a file.
  StreamingResponse lets us stream arbitrary bytes directly to the client —
  no temp files, no cleanup, no disk I/O.

  Think of it like this:
    FileResponse  → serve an existing file from disk
    StreamingResponse → stream bytes you generated on the fly

CONTENT-DISPOSITION HEADER:
  This tells the browser "treat this as a download, not a page to render".
  Without it, browsers may try to display the PDF inline (which is fine)
  but won't prompt a Save dialog. With "attachment; filename=...", the
  browser immediately starts a download with the given filename.

  filename* (RFC 5987 encoding) is the modern standard and handles names
  with spaces or non-ASCII characters. We sanitise the filename to ASCII
  to keep it simple.
"""

import re
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import io

from app.schemas.export import ResumeExportRequest
from app.services.export.pdf_generator import generate_pdf

router = APIRouter()


def _safe_filename(name: str) -> str:
    """Strip non-alphanumeric characters to make a safe PDF filename."""
    safe = re.sub(r"[^\w\s-]", "", name).strip()
    safe = re.sub(r"\s+", "_", safe)
    return (safe or "resume")[:60]   # cap length


@router.post(
    "/export/pdf",
    summary="Export resume as PDF",
    description=(
        "Accepts structured resume data (personal info, experience, education, skills, summary) "
        "and returns a professionally formatted ATS-friendly PDF file as a binary download. "
        "Generated with WeasyPrint + Jinja2."
    ),
    response_class=StreamingResponse,
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "PDF file download",
        }
    },
)
async def export_pdf(request: ResumeExportRequest) -> StreamingResponse:
    """
    POST /api/v1/export/pdf

    Body (JSON): ResumeExportRequest
    Returns: application/pdf binary stream
    """
    if not request.personal.full_name.strip():
        raise HTTPException(status_code=422, detail="personal.full_name cannot be empty.")
    if not request.personal.email.strip():
        raise HTTPException(status_code=422, detail="personal.email cannot be empty.")

    try:
        pdf_bytes = generate_pdf(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")

    filename = _safe_filename(request.filename or request.personal.full_name or "resume")

    return StreamingResponse(
        content=io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}.pdf"',
            "Content-Length": str(len(pdf_bytes)),
        },
    )
