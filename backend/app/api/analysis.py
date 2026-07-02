"""POST /analyze/{session_id} — run full credit analysis pipeline."""
from __future__ import annotations
import asyncio
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException

from app.models.requests     import AnalyzeQuery
from app.services.decision   import run_credit_analysis
from app.session              import SESSIONS, get_session

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Analysis"])


@router.post("/analyze/{session_id}")
async def analyze_documents(
    session_id: str,
    body: Optional[AnalyzeQuery] = None,
) -> dict:
    session     = get_session(session_id)
    loan_amount = body.loan_amount if body else None

    # Combine all doc markdown (cap 20 k chars each)
    combined = "\n\n".join(
        f"=== {d['filename']} ===\n{d['markdown'][:20_000]}"
        for d in session["docs_md"]
    )

    try:
        result = await asyncio.to_thread(run_credit_analysis, combined, loan_amount)
    except Exception as exc:
        logger.exception("Analysis failed — session %s", session_id)
        raise HTTPException(500, f"Analysis error: {exc}") from exc

    result_dict          = result.model_dump()
    session["analysis"]  = result_dict

    logger.info("Session %s — score %.1f (%s) %s",
                session_id, result.credit_score,
                result.credit_rating, result.decision.recommendation)
    return result_dict