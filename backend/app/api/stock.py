"""GET /stock/{ticker} — live market data."""
from __future__ import annotations
import asyncio

from fastapi import APIRouter, HTTPException

from app.services.market import get_stock_data

router = APIRouter(tags=["Market Data"])


@router.get("/stock/{ticker}")
async def stock(ticker: str) -> dict:
    ticker = ticker.upper().strip()
    if not ticker or len(ticker) > 10:
        raise HTTPException(400, "Invalid ticker symbol.")
    return await asyncio.to_thread(get_stock_data, ticker)