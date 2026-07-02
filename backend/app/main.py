"""
FastAPI application entry-point.
Wires lifespan, CORS, and all API routers.
Route logic lives in app/api/*  — main.py stays thin.
"""
from __future__ import annotations
import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.config as config          # MUST be first — sets OPENAI_* bridge
from app.api import routers
from app.session import session_cleanup_loop

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s │ %(name)s │ %(message)s",
)
logger = logging.getLogger("main")


@asynccontextmanager
async def _lifespan(app: FastAPI):
    missing = config.validate()
    if missing:
        logger.error("Missing required env-vars: %s", missing)
    else:
        logger.info("Config OK — model: %s  pageindex: %s",
                    config.NVIDIA_MODEL,
                    "on" if config.USE_PAGEINDEX else "off")

    task = asyncio.create_task(session_cleanup_loop())
    yield
    task.cancel()


app = FastAPI(
    title       = "Credit Analysis AI",
    version     = "1.0.0",
    description = (
        "Azure Document Intelligence extraction → NVIDIA NIM analysis → "
        "credit scoring → Word/PDF proposal report."
    ),
    lifespan = _lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

for router in routers:
    app.include_router(router)