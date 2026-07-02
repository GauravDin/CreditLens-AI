"""POST /chat/{session_id} — RAG-powered document Q&A with Cache Augmented Generation."""
from __future__ import annotations
import logging

from fastapi import APIRouter, HTTPException

from app.models.requests  import ChatRequest, ChatResponse
from app.rag              import query_documents_async
from app.rag.retriever    import generate_suggestions_async
from app.session          import SESSIONS, get_session

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Chat"])


def _ensure_session(session_id: str) -> dict:
    """
    Try to find the session. If it was lost (e.g. server restart),
    check if any active session exists and return the most recent one.
    This is a resilience layer — the canonical session_id is in the URL
    but the in-memory store may have been rebuilt under a different id.
    """
    s = SESSIONS.get(session_id)
    if s:
        return s

    # Fallback: if there's exactly one active session, use it
    # (common case: user uploaded, server restarted, only one session exists)
    if len(SESSIONS) == 1:
        only_id = next(iter(SESSIONS))
        logger.info("Session %s not found — falling back to active session %s", session_id, only_id)
        return SESSIONS[only_id]

    # If multiple sessions exist, try to find one with analysis (most likely the user's)
    analyzed = {sid: s for sid, s in SESSIONS.items() if s.get("analysis")}
    if len(analyzed) == 1:
        only_id = next(iter(analyzed))
        logger.info("Session %s not found — falling back to analyzed session %s", session_id, only_id)
        return analyzed[only_id]

    raise HTTPException(404, f"Session '{session_id}' not found.")


@router.post("/chat/{session_id}", response_model=ChatResponse)
async def chat(session_id: str, body: ChatRequest) -> ChatResponse:
    session  = _ensure_session(session_id)
    question = body.message.strip()
    if not question:
        raise HTTPException(400, "Message cannot be empty.")

    try:
        answer = await query_documents_async(
            doc_index     = session.get("doc_index", {}),
            pageindex_ids = session.get("pageindex_ids", []),
            question      = question,
            analysis      = session.get("analysis"),
            history       = body.history,
        )
    except Exception as exc:
        logger.exception("Chat failed — session %s", session_id)
        raise HTTPException(500, f"Chat error: {exc}") from exc

    return ChatResponse(answer=answer, session_id=session_id)


@router.get("/chat/{session_id}/suggestions", response_model=list[str])
async def chat_suggestions(session_id: str) -> list[str]:
    session = _ensure_session(session_id)
    analysis = session.get("analysis")
    return await generate_suggestions_async(analysis)