"""GET /report/{session_id} — download Word or PDF credit proposal."""
from __future__ import annotations
import asyncio
import logging
import time

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response

from app.report  import generate_pdf_report, generate_word_report
from app.session import get_session

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Report"])


@router.get("/report/{session_id}")
async def download_report(
    session_id: str,
    fmt: str = Query(default="docx", enum=["docx", "pdf"]),
) -> Response:
    session  = get_session(session_id)
    analysis = session.get("analysis")
    if not analysis:
        raise HTTPException(400, "Run POST /analyze/{session_id} first.")

    docs      = session["docs_md"]
    company   = (analysis.get("financials") or {}).get("company_name", "company")
    safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in company)[:40]
    today     = time.strftime("%Y%m%d")

    try:
        if fmt == "pdf":
            data       = await asyncio.to_thread(generate_pdf_report, analysis, docs)
            filename   = f"{safe_name}_credit_{today}.pdf"
            media_type = "application/pdf"
        else:
            data       = await asyncio.to_thread(generate_word_report, analysis, docs)
            filename   = f"{safe_name}_credit_{today}.docx"
            media_type = ("application/vnd.openxmlformats-officedocument"
                          ".wordprocessingml.document")
    except Exception as exc:
        logger.exception("Report generation failed — session %s", session_id)
        raise HTTPException(500, f"Report error: {exc}") from exc

    return Response(
        content=data,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )