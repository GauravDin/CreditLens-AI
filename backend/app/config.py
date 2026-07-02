"""app/config.py — centralised env config. Import first; sets litellm bridge."""
from __future__ import annotations
import os
from dotenv import load_dotenv

load_dotenv()

NVIDIA_API_KEY:  str  = os.getenv("NVIDIA_API_KEY",  "")
NVIDIA_MODEL:    str  = os.getenv("NVIDIA_MODEL",    "meta/llama-3.3-70b-instruct")
NVIDIA_BASE_URL: str  = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")

AZURE_DI_ENDPOINT: str = os.getenv("AZURE_DI_ENDPOINT", "")
AZURE_DI_KEY:      str = os.getenv("AZURE_DI_KEY",      "")

HF_TOKEN:           str = os.getenv("HF_TOKEN",           "")
ALPHA_VANTAGE_KEY:  str = os.getenv("ALPHA_VANTAGE_KEY",  "")

USE_PAGEINDEX:       bool = os.getenv("USE_PAGEINDEX", "false").lower() == "true"
PAGEINDEX_WORKSPACE: str  = os.getenv("PAGEINDEX_WORKSPACE", "./pageindex_workspace")

SESSION_TTL_HOURS: int = int(os.getenv("SESSION_TTL_HOURS", "24"))
MAX_FILE_SIZE_MB:  int = int(os.getenv("MAX_FILE_SIZE_MB",  "50"))

ALLOWED_EXTENSIONS: set[str] = {
    ".pdf", ".docx", ".doc", ".xlsx", ".xls",
    ".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".pptx", ".ppt",
}

# Bridge NVIDIA NIM → OpenAI-compatible API for PageIndex/litellm
if NVIDIA_API_KEY:
    os.environ.setdefault("OPENAI_API_KEY",  NVIDIA_API_KEY)
    os.environ.setdefault("OPENAI_BASE_URL", NVIDIA_BASE_URL)


def validate() -> list[str]:
    missing = []
    if not NVIDIA_API_KEY:    missing.append("NVIDIA_API_KEY")
    if not AZURE_DI_ENDPOINT: missing.append("AZURE_DI_ENDPOINT")
    if not AZURE_DI_KEY:      missing.append("AZURE_DI_KEY")
    return missing