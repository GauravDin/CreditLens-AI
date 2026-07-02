"""HTTP I/O shapes — no domain logic."""
from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field


class UploadResponse(BaseModel):
    session_id: str
    doc_count:  int
    filenames:  list[str]


class AnalyzeQuery(BaseModel):
    loan_amount:   Optional[float] = None
    loan_currency: Optional[str]   = None


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = Field(default_factory=list)


class ChatResponse(BaseModel):
    answer:     str
    session_id: str