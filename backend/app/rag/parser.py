"""
Pure document parser: Azure DI Markdown → hierarchical section list.
No network calls, no LLM — safe to unit-test without credentials.
"""
from __future__ import annotations
import re
import logging

logger = logging.getLogger(__name__)


def parse_sections(markdown: str) -> list[dict]:
    """
    Split Markdown by heading levels into flat section list.
    Each section: {"title": str, "level": int, "content": str}
    """
    sections: list[dict] = []
    current: dict = {"title": "Preamble", "level": 0, "lines": []}

    for line in markdown.splitlines():
        m = re.match(r"^(#{1,6})\s+(.+)$", line)
        if m:
            body = "\n".join(current["lines"]).strip()
            if body or sections:
                sections.append({"title": current["title"], "level": current["level"], "content": body})
            current = {"title": m.group(2).strip(), "level": len(m.group(1)), "lines": []}
        else:
            current["lines"].append(line)

    body = "\n".join(current["lines"]).strip()
    if body:
        sections.append({"title": current["title"], "level": current["level"], "content": body})
    return sections


def build_toc_string(sections: list[dict]) -> str:
    return "\n".join(
        f"[{i}] {'  ' * max(0, s['level']-1)}{s['title']}  ({len(s['content'])} chars)"
        for i, s in enumerate(sections)
    )


def build_doc_index(docs: list[dict]) -> dict[str, list[dict]]:
    """
    Build per-document section index from extracted Markdown.
    Input:  [{"filename": str, "markdown": str}]
    Output: {"filename": [section, ...]}
    """
    index: dict[str, list[dict]] = {}
    for doc in docs:
        sections = parse_sections(doc["markdown"])
        index[doc["filename"]] = sections
        logger.info("Indexed '%s': %d sections", doc["filename"], len(sections))
    return index