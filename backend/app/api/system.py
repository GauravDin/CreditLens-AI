"""GET /health · GET /session/{id} · DELETE /session/{id}."""
from __future__ import annotations
import time

from fastapi import APIRouter, HTTPException

import app.config as config
from app.session import SESSIONS, get_session

router = APIRouter(tags=["System"])


def _find_session(session_id: str) -> tuple[str, dict]:
    """
    Find a session by ID. If not found, try to fall back to the
    most recent active session (resilience against server restarts).
    Returns (actual_session_id, session_dict).
    """
    s = SESSIONS.get(session_id)
    if s:
        return session_id, s

    # Fallback: single active session
    if len(SESSIONS) == 1:
        only_id = next(iter(SESSIONS))
        return only_id, SESSIONS[only_id]

    # Fallback: single analyzed session
    analyzed = {sid: s for sid, s in SESSIONS.items() if s.get("analysis")}
    if len(analyzed) == 1:
        only_id = next(iter(analyzed))
        return only_id, analyzed[only_id]

    raise HTTPException(404, f"Session '{session_id}' not found.")


@router.get("/health")
async def health() -> dict:
    missing = config.validate()
    return {
        "status":          "ok" if not missing else "degraded",
        "missing_config":  missing,
        "active_sessions": len(SESSIONS),
        "nvidia_model":    config.NVIDIA_MODEL,
        "pageindex_mode":  "enabled" if config.USE_PAGEINDEX else "custom-rag",
    }


@router.get("/session/{session_id}")
async def session_info(session_id: str) -> dict:
    actual_id, s = _find_session(session_id)
    return {
        "session_id":     actual_id,
        "doc_count":      len(s.get("docs_md", [])),
        "filenames":      [d["filename"] for d in s.get("docs_md", [])],
        "has_analysis":   s.get("analysis") is not None,
        "pageindex_mode": len(s.get("pageindex_ids", [])) > 0,
        "age_minutes":    round((time.time() - s["created_at"]) / 60, 1),
    }


@router.delete("/session/{session_id}")
async def delete_session(session_id: str) -> dict:
    actual_id, _ = _find_session(session_id)
    del SESSIONS[actual_id]
    return {"deleted": True, "session_id": actual_id}