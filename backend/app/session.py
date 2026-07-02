"""
Shared session store and helpers.
SESSIONS is a module-level singleton dict — all route modules import the same object.
"""
from __future__ import annotations
import asyncio
import logging
import time
from pathlib import Path

from fastapi import HTTPException, UploadFile

import app.config as config

logger = logging.getLogger(__name__)

# Schema: {session_id: {"docs_md":[], "doc_index":{}, "pageindex_ids":[], "analysis":None, "created_at":float}}
SESSIONS: dict[str, dict] = {}


def get_session(session_id: str) -> dict:
    s = SESSIONS.get(session_id)
    if not s:
        raise HTTPException(404, f"Session '{session_id}' not found.")
    return s


def validate_file(f: UploadFile) -> None:
    ext = Path(f.filename or "").suffix.lower()
    if ext not in config.ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"'{ext}' not allowed. Supported: {sorted(config.ALLOWED_EXTENSIONS)}")


async def session_cleanup_loop() -> None:
    """Evict sessions older than SESSION_TTL_HOURS — runs every hour."""
    while True:
        await asyncio.sleep(3_600)
        ttl = config.SESSION_TTL_HOURS * 3_600
        now = time.time()
        dead = [sid for sid, s in SESSIONS.items() if now - s["created_at"] > ttl]
        for sid in dead:
            del SESSIONS[sid]
        if dead:
            logger.info("Evicted %d expired sessions.", len(dead))