"""POST /upload — receive files, run Azure DI, build RAG index."""
from __future__ import annotations
import time
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile

import app.config as config
from app.models.requests      import UploadResponse
from app.services.extraction  import extract_documents_parallel
from app.session               import SESSIONS, validate_file
from app.rag                   import build_doc_index, index_documents_async

router = APIRouter(tags=["Documents"])


@router.post("/upload", response_model=UploadResponse)
async def upload_documents(files: list[UploadFile] = File(...)) -> UploadResponse:
    if not files:
        raise HTTPException(400, "At least one file required.")
    if len(files) > 10:
        raise HTTPException(400, "Max 10 files per session.")

    payloads: list[dict] = []
    for f in files:
        validate_file(f)
        data = await f.read()
        max_b = config.MAX_FILE_SIZE_MB * 1024 * 1024
        if len(data) > max_b:
            raise HTTPException(400,
                f"'{f.filename}' is {len(data)//1024//1024} MB — limit {config.MAX_FILE_SIZE_MB} MB.")
        payloads.append({"filename": f.filename or f"doc_{len(payloads)+1}", "bytes": data})

    docs_md        = await extract_documents_parallel(payloads)
    doc_index      = build_doc_index(docs_md)
    session_id     = str(uuid.uuid4())
    pageindex_ids  = await index_documents_async(session_id, docs_md)

    SESSIONS[session_id] = {
        "docs_md":       docs_md,
        "doc_index":     doc_index,
        "pageindex_ids": pageindex_ids,
        "analysis":      None,
        "created_at":    time.time(),
    }
    return UploadResponse(
        session_id=session_id,
        doc_count=len(docs_md),
        filenames=[d["filename"] for d in docs_md],
    )