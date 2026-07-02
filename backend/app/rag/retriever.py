"""
Cache Augmented Generation (CAG) retriever.

Instead of re-retrieving on every question, we preload the full relevant
document context into the LLM's context window alongside the conversation
history.  This gives the model a cached "knowledge state" that persists
across follow-up questions — the user can ask clarifications without the
system losing context.

Flow:
  1. select_section_indices  — ask NIM which doc sections are relevant
  2. query_custom_rag        — assemble full context + history, then answer
  3. generate_suggestions    — produce document-specific follow-up prompts
"""
from __future__ import annotations
import asyncio
import json
import logging
import re

from openai import OpenAI
import app.config as config
from app.rag.parser import build_toc_string

logger  = logging.getLogger(__name__)
_nvidia = OpenAI(base_url=config.NVIDIA_BASE_URL, api_key=config.NVIDIA_API_KEY)

# ---------------------------------------------------------------------------
# Step 1 — Section selection
# ---------------------------------------------------------------------------

def select_section_indices(sections: list[dict], question: str) -> list[int]:
    """Ask NIM which section indices are relevant to the question."""
    if not sections:
        return []
    toc = build_toc_string(sections)
    try:
        resp = _nvidia.chat.completions.create(
            model=config.NVIDIA_MODEL,
            messages=[
                {"role": "system", "content": "Return ONLY comma-separated integers. No text."},
                {"role": "user",   "content": (
                    f"TOC:\n{toc}\n\nQuestion: {question}\n\n"
                    "Most relevant 3-5 section indices (comma-separated integers only):"
                )},
            ],
            temperature=0, max_tokens=40,
        )
        raw = resp.choices[0].message.content.strip()
        return [int(p) for p in re.split(r"[,\s]+", raw) if p.isdigit() and int(p) < len(sections)][:5]
    except Exception as exc:
        logger.warning("Section selection failed: %s", exc)
        return list(range(min(3, len(sections))))


# ---------------------------------------------------------------------------
# Step 2 — Cache Augmented Generation query
# ---------------------------------------------------------------------------

def _build_cached_context(doc_index: dict[str, list[dict]], question: str, analysis_ctx: str) -> str:
    """
    Build the full cached context from the document index.
    This is the 'C' in CAG — we preload ALL relevant document chunks
    into the context window so the LLM has full knowledge without
    needing to re-retrieve on follow-up questions.
    """
    parts: list[str] = []
    for filename, sections in doc_index.items():
        for idx in select_section_indices(sections, question):
            s = sections[idx]
            if s["content"]:
                parts.append(f"[{filename} › {s['title']}]\n{s['content']}")

    context = "\n\n---\n\n".join(parts)
    if len(context) > 8_000:
        context = context[:8_000] + "\n…[truncated]"

    if analysis_ctx:
        context = context + analysis_ctx

    return context


def query_custom_rag(
    doc_index: dict[str, list[dict]],
    question: str,
    analysis_ctx: str,
    history: list[dict] | None = None,
) -> str:
    """
    Cache Augmented Generation: assemble context + full conversation
    history, then answer.  The history acts as the 'cached state' —
    the model sees all prior Q&A turns alongside the document context.
    """
    history = history or []

    # Build the cached document context
    cached_context = _build_cached_context(doc_index, question, analysis_ctx)

    # Assemble the full message list with CAG pattern
    messages: list[dict] = [
        {
            "role": "system",
            "content": (
                "You are a senior credit analyst AI assistant. "
                "You have been given the full document context below. "
                "Answer questions using specific numbers, ratios, and facts from the documents. "
                "Always cite which document section your answer comes from. "
                "If information is not available in the context, say so clearly. "
                "You support follow-up questions — use the conversation history to maintain context."
            ),
        },
    ]

    # Inject the cached document context as a system-level knowledge block
    if cached_context:
        messages.append({
            "role": "user",
            "content": f"Here is the full document context for this analysis:\n\n{cached_context}",
        })
        messages.append({
            "role": "assistant",
            "content": (
                "I have loaded and cached the document context. "
                "I can now answer questions about this data, including follow-up questions. "
                "Please go ahead."
            ),
        })

    # Replay conversation history (CAG: the model sees all prior turns)
    for h in history:
        role = h.get("role", "user")
        content = h.get("content", "")
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})

    # Add the current question
    messages.append({"role": "user", "content": question})

    resp = _nvidia.chat.completions.create(
        model=config.NVIDIA_MODEL,
        messages=messages,
        temperature=0.1,
        max_tokens=1_500,
    )
    return resp.choices[0].message.content


# ---------------------------------------------------------------------------
# Step 3 — Async entry point
# ---------------------------------------------------------------------------

async def query_documents_async(
    doc_index: dict[str, list[dict]],
    pageindex_ids: list[str],
    question: str,
    analysis: dict | None = None,
    history: list[dict] | None = None,
) -> str:
    analysis_ctx = f"\n\nCredit Analysis Summary:\n{analysis}" if analysis else ""
    if config.USE_PAGEINDEX and pageindex_ids:
        try:
            from app.rag.pageindex import pageindex_query_sync
            return await asyncio.to_thread(pageindex_query_sync, pageindex_ids, question, analysis_ctx)
        except Exception as exc:
            logger.warning("PageIndex query failed, falling back to custom RAG: %s", exc)

    return await asyncio.to_thread(query_custom_rag, doc_index, question, analysis_ctx, history)


# ---------------------------------------------------------------------------
# Dynamic suggestions generator
# ---------------------------------------------------------------------------

async def generate_suggestions_async(analysis: dict | None) -> list[str]:
    """Generate document-specific follow-up question suggestions."""
    analysis_ctx = f"\n\nCredit Analysis Summary:\n{analysis}" if analysis else ""
    prompt = (
        "Based on the following credit analysis, generate 4 short, highly relevant "
        "follow-up questions a credit analyst should ask. "
        "Make them specific to the company and numbers in the analysis. "
        "Return ONLY a valid JSON array of 4 strings.\n"
        f"{analysis_ctx}"
    )

    try:
        resp = await asyncio.to_thread(
            _nvidia.chat.completions.create,
            model=config.NVIDIA_MODEL,
            messages=[
                {"role": "system", "content": "You output only a valid JSON list of 4 string questions. No markdown block, no extra text."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=200,
        )
        content = resp.choices[0].message.content.strip()
        # Strip markdown code fences if present
        if content.startswith("```"):
            content = re.sub(r"^```(?:json)?\s*", "", content)
            content = re.sub(r"\s*```$", "", content)
        return json.loads(content)
    except Exception as exc:
        logger.warning("Failed to generate suggestions: %s", exc)
        return [
            "What are the main risk factors?",
            "How does the liquidity look?",
            "Are there any covenant concerns?",
            "What is the recommended maximum loan?",
        ]