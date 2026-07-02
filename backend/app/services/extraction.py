"""Azure Document Intelligence v4.0 async extraction."""
from __future__ import annotations
import asyncio
import logging
import mimetypes
from pathlib import Path

import app.config as config

logger = logging.getLogger(__name__)

try:
    from azure.ai.documentintelligence.aio import DocumentIntelligenceClient
    from azure.ai.documentintelligence.models import AnalyzeDocumentRequest, DocumentContentFormat as ContentFormat
    from azure.core.credentials import AzureKeyCredential
    _AZURE_OK = True
except ImportError:
    _AZURE_OK = False
    logger.warning("azure-ai-documentintelligence not installed.")

_BYTES_LIMIT = 4 * 1024 * 1024  # 4 MB free-tier limit


def _content_type(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    return {
        ".pdf":  "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".doc":  "application/msword",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".png":  "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".tiff": "image/tiff",
    }.get(ext) or mimetypes.guess_type(filename)[0] or "application/octet-stream"


async def extract_markdown_async(file_bytes: bytes, filename: str = "document") -> str:
    if not _AZURE_OK:
        return f"[Azure DI not installed — skipped {filename}]"
    if not config.AZURE_DI_ENDPOINT or not config.AZURE_DI_KEY:
        return f"[Azure DI not configured — skipped {filename}]"
    if len(file_bytes) > _BYTES_LIMIT:
        mb = len(file_bytes) / 1024 / 1024
        return f"[{filename} ({mb:.1f} MB) exceeds 4 MB limit — use URL source]"
    try:
        async with DocumentIntelligenceClient(
            endpoint=config.AZURE_DI_ENDPOINT,
            credential=AzureKeyCredential(config.AZURE_DI_KEY),
        ) as client:
            poller = await client.begin_analyze_document(
                model_id="prebuilt-layout",
                body=AnalyzeDocumentRequest(bytes_source=file_bytes),
                output_content_format=ContentFormat.MARKDOWN,
            )
            result = await poller.result()
            content = result.content or ""
            logger.info("Azure DI: %d chars from '%s'", len(content), filename)
            return content
    except Exception as exc:
        logger.error("Azure DI failed for '%s': %s", filename, exc)
        return f"[Azure DI error for {filename}: {exc}]"


async def extract_documents_parallel(file_payloads: list[dict]) -> list[dict]:
    """Parallel extraction. Input: [{"filename": str, "bytes": bytes}]"""
    tasks    = [extract_markdown_async(p["bytes"], p["filename"]) for p in file_payloads]
    results  = await asyncio.gather(*tasks, return_exceptions=True)
    return [
        {"filename": p["filename"], "markdown": str(md) if not isinstance(md, Exception) else f"[Error: {md}]"}
        for p, md in zip(file_payloads, results)
    ]