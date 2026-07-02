"""Market data: yfinance → Alpha Vantage → web scrape."""
from __future__ import annotations
import logging
from typing import Any, Optional

import app.config as config

logger = logging.getLogger(__name__)


def _safe_float(v) -> Optional[float]:
    try: return float(v) if v not in (None,"None","-","") else None
    except: return None

def _safe_int(v) -> Optional[int]:
    try: return int(v) if v not in (None,"None","-","") else None
    except: return None


def _yfinance(ticker: str) -> dict:
    import yfinance as yf
    t    = yf.Ticker(ticker)
    info = t.info
    hist = t.history(period="1y")
    history = [{"date": str(d.date()), "close": float(r["Close"])}
               for d, r in hist.iterrows()][-252:]
    return {
        "ticker": ticker, "source": "yfinance",
        "current_price":  info.get("currentPrice"),
        "previous_close": info.get("previousClose"),
        "market_cap":     info.get("marketCap"),
        "pe_ratio":       info.get("trailingPE"),
        "forward_pe":     info.get("forwardPE"),
        "pb_ratio":       info.get("priceToBook"),
        "beta":           info.get("beta"),
        "52w_high":       info.get("fiftyTwoWeekHigh"),
        "52w_low":        info.get("fiftyTwoWeekLow"),
        "volume":         info.get("volume"),
        "dividend_yield": info.get("dividendYield"),
        "eps":            info.get("trailingEps"),
        "roe":            info.get("returnOnEquity"),
        "sector":         info.get("sector"),
        "industry":       info.get("industry"),
        "currency":       info.get("currency","USD"),
        "exchange":       info.get("exchange"),
        "history":        history,
    }


def _alpha_vantage(ticker: str) -> dict:
    if not config.ALPHA_VANTAGE_KEY:
        raise ValueError("ALPHA_VANTAGE_KEY not set")
    import httpx
    base = "https://www.alphavantage.co/query"
    key  = config.ALPHA_VANTAGE_KEY
    with httpx.Client(timeout=12) as c:
        ov = c.get(base, params={"function":"OVERVIEW",      "symbol":ticker,"apikey":key}).json()
        qt = c.get(base, params={"function":"GLOBAL_QUOTE",  "symbol":ticker,"apikey":key}).json().get("Global Quote",{})
    return {
        "ticker": ticker, "source": "alpha_vantage",
        "current_price": _safe_float(qt.get("05. price")),
        "market_cap":    _safe_int(ov.get("MarketCapitalization")),
        "pe_ratio":      _safe_float(ov.get("PERatio")),
        "pb_ratio":      _safe_float(ov.get("PriceToBookRatio")),
        "beta":          _safe_float(ov.get("Beta")),
        "52w_high":      _safe_float(ov.get("52WeekHigh")),
        "52w_low":       _safe_float(ov.get("52WeekLow")),
        "eps":           _safe_float(ov.get("EPS")),
        "roe":           _safe_float(ov.get("ReturnOnEquityTTM")),
        "sector":        ov.get("Sector"),
        "exchange":      ov.get("Exchange"),
        "currency":      ov.get("Currency","USD"),
        "history":       [],
    }


def _web_scrape(ticker: str) -> dict:
    import httpx
    from bs4 import BeautifulSoup
    resp = httpx.get(f"https://finance.yahoo.com/quote/{ticker}",
                     headers={"User-Agent":"Mozilla/5.0"}, timeout=12, follow_redirects=True)
    soup  = BeautifulSoup(resp.text, "html.parser")
    price = None
    for tag, attrs in [("fin-streamer",{"data-field":"regularMarketPrice"}),
                       ("span",{"data-testid":"qsp-price"})]:
        el = soup.find(tag, attrs)
        if el:
            raw = el.get("value") or el.get_text(strip=True)
            try: price = float(str(raw).replace(",","")); break
            except: pass
    return {"ticker": ticker, "source": "web_scrape", "current_price": price, "history": []}


def get_stock_data(ticker: str) -> dict[str, Any]:
    ticker = ticker.upper().strip()
    for fn in [_yfinance, _alpha_vantage, _web_scrape]:
        try:
            data = fn(ticker)
            logger.info("Stock %s from %s", ticker, data["source"])
            return data
        except Exception as exc:
            logger.warning("%s failed for %s: %s", fn.__name__, ticker, exc)
    return {"ticker": ticker, "source": "none", "error": f"No data for {ticker}", "history": []}