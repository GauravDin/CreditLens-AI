"""
PageIndex integration — optional enhanced RAG path.
Enabled via USE_PAGEINDEX=true in .env.
Falls back to custom RAG on any error.
"""
from __future__ import annotations
import asyncio
import logging
import os

from openai import OpenAI
import app.config as config

logger  = logging.getLogger(__name__)
_nvidia = OpenAI(base_url=config.NVIDIA_BASE_URL, api_key=config.NVIDIA_API_KEY)


def _pi_client():
    """Build PageIndexClient with NVIDIA NIM via litellm openai-router."""
    from pageindex import PageIndexClient  # type: ignore[import]
    os.makedirs(config.PAGEINDEX_WORKSPACE, exist_ok=True)
    return PageIndexClient(
        workspace=config.PAGEINDEX_WORKSPACE,
        api_key  =config.NVIDIA_API_KEY,          # sets OPENAI_API_KEY
        model    =f"openai/{config.NVIDIA_MODEL}", # litellm → NVIDIA NIM
    )


def _index_sync(session_id: str, docs: list[dict]) -> list[str]:
    client  = _pi_client()
    doc_ids: list[str] = []
    for doc in docs:
        md_path = os.path.join(config.PAGEINDEX_WORKSPACE, f"{session_id}_{doc['filename']}.md")
        with open(md_path, "w", encoding="utf-8") as fh:
            fh.write(doc["markdown"])
        doc_id = client.index(md_path, mode="md")
        doc_ids.append(doc_id)
        logger.info("PageIndex: '%s' → %s", doc["filename"], doc_id)
    return doc_ids


def pageindex_query_sync(doc_ids: list[str], question: str, analysis_ctx: str) -> str:
    client = _pi_client()
    parts: list[str] = []
    for doc_id in doc_ids:
        structure = str(client.get_document_structure(doc_id))[:3_000]
        nav = _nvidia.chat.completions.create(
            model=config.NVIDIA_MODEL,
            messages=[{"role":"user","content":(
                f"Structure:\n{structure}\n\nQuestion: {question}\n\n"
                "Reply ONLY with page/line range (e.g. '3-5' or '12')."
            )}],
            temperature=0, max_tokens=10,
        )
        page_range = nav.choices[0].message.content.strip()
        try:
            content = client.get_page_content(doc_id, page_range)
            if content: parts.append(content)
        except Exception as exc:
            logger.warning("PageIndex get_page_content: %s", exc)

    context = "\n\n".join(parts)[:8_000]
    resp = _nvidia.chat.completions.create(
        model=config.NVIDIA_MODEL,
        messages=[
            {"role":"system","content":"Senior credit analyst. Cite numbers and source sections."},
            {"role":"user",  "content":f"Context:\n{context}{analysis_ctx}\n\nQuestion: {question}"},
        ],
        temperature=0.1, max_tokens=1_500,
    )
    return resp.choices[0].message.content


async def index_documents_async(session_id: str, docs: list[dict]) -> list[str]:
    """Run PageIndex indexing in thread pool — avoids event-loop conflicts."""
    if not config.USE_PAGEINDEX:
        return []
    try:
        return await asyncio.to_thread(_index_sync, session_id, docs)
    except Exception as exc:
        logger.error("PageIndex indexing failed: %s", exc)
        return []