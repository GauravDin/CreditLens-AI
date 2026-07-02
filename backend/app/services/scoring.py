"""
Rule-based credit scoring — deterministic, no LLM calls.
Separated from decision.py so it can be unit-tested in isolation.
"""
from __future__ import annotations
import json
import re
from typing import Optional

from app.models.financial import AltmanZScore, ScoreBreakdown


# ── JSON parsing (shared by decision.py) ─────────────────────────────────────

def parse_llm_json(raw: str) -> dict:
    """Extract JSON from LLM output; tries 3 strategies before raising."""
    raw = raw.strip()
    for candidate in [
        raw,
        re.sub(r"^```(?:json)?\s*", "", re.sub(r"\s*```$", "", raw)).strip(),
        raw[raw.find("{"):raw.rfind("}") + 1] if "{" in raw else "",
    ]:
        try:
            return json.loads(candidate)
        except (json.JSONDecodeError, ValueError):
            pass
    raise ValueError(f"Cannot parse JSON from: {raw[:300]}")


# ── Derived ratio computation ─────────────────────────────────────────────────

def compute_derived_ratios(f: dict) -> dict:
    """Fill gaps that can be computed from already-extracted numbers. In-place."""
    ta   = f.get("total_assets")
    tl   = f.get("total_liabilities")
    na   = f.get("net_assets")
    ca   = f.get("current_assets")
    cl   = f.get("current_liabilities")
    rev  = f.get("revenue")
    op   = f.get("operating_profit")
    np_  = f.get("net_profit")
    ie   = f.get("interest_expense")
    ocf  = f.get("operating_cash_flow")
    inv  = f.get("inventory") or 0
    cash = f.get("cash")
    da   = f.get("depreciation_amortization")
    gp   = f.get("gross_profit")

    def _set(key, val):
        if f.get(key) is None and val is not None:
            f[key] = round(val, 4)

    if ta:
        _set("equity_ratio",    na / ta * 100 if na is not None else None)   # na=0 → 0% equity, valid
        _set("roa",             np_ / ta * 100 if np_ is not None else None)
        _set("debt_to_assets",  tl / ta if tl else None)
    if na:   # guard div-by-zero: ROE/D-E undefined when equity=0
        _set("roe",             np_ / na * 100 if np_ is not None else None)
        _set("debt_to_equity",  tl / na if tl else None)
    if rev:
        _set("operating_margin", op  / rev * 100 if op  is not None else None)
        _set("gross_margin",     gp  / rev * 100 if gp  is not None else None)
        _set("net_margin",       np_ / rev * 100 if np_ is not None else None)
    if op is not None and da is not None:
        _set("ebitda", op + da)
    ebitda = f.get("ebitda")
    if ebitda is not None and rev:
        _set("ebitda_margin", ebitda / rev * 100)
    if ca and cl:
        _set("current_ratio", ca / cl)
        _set("quick_ratio",   (ca - inv) / cl)
    if cash and cl:
        _set("cash_ratio", cash / cl)
    if op is not None and ie and ie > 0:
        _set("interest_coverage", op / ie)
    if ocf is not None and ie and ie > 0:
        _set("dscr", ocf / ie)
    if ocf is not None and f.get("capex") is not None:
        _set("free_cash_flow", ocf - f["capex"])
    rv, rvp = f.get("revenue"), f.get("revenue_prev")
    if rv and rvp and rvp != 0:
        _set("revenue_growth_pct", (rv - rvp) / rvp * 100)
    return f


# ── Altman Z′-Score ───────────────────────────────────────────────────────────

def compute_altman_z(f: dict) -> Optional[AltmanZScore]:
    """Modified Altman Z′ for private companies. Returns None if data insufficient."""
    ta = f.get("total_assets")
    if not ta or ta == 0:
        return None
    x1 = ((f.get("current_assets") or 0) - (f.get("current_liabilities") or 0)) / ta
    x2 = (f.get("retained_earnings") or 0) / ta
    x3 = (f.get("operating_profit")  or 0) / ta
    x4 = (f.get("net_assets") or 0) / max(f.get("total_liabilities") or 1, 1)
    x5 = (f.get("revenue")    or 0) / ta
    z  = round(0.717*x1 + 0.847*x2 + 3.107*x3 + 0.420*x4 + 0.998*x5, 3)
    zone = "Safe" if z > 2.9 else ("Grey" if z >= 1.23 else "Distress")
    return AltmanZScore(z_score=z, zone=zone,
                        x1=round(x1,4), x2=round(x2,4), x3=round(x3,4),
                        x4=round(x4,4), x5=round(x5,4))


# ── Weighted credit scoring ───────────────────────────────────────────────────

def compute_credit_score(f: dict) -> tuple[float, ScoreBreakdown]:
    """
    Five-category score (0–100):
      Profitability 30  |  Leverage 25  |  Liquidity 20  |  Growth 15  |  Qualitative 10
    """
    # Profitability (30)
    prof  = min((f.get("roe") or 0) / 15 * 12, 12)
    prof += min((f.get("operating_margin") or 0) / 20 * 10, 10)
    prof += min((f.get("roa") or 0) / 10 * 8, 8)

    # Leverage (25)
    er   = f.get("equity_ratio") or 0
    de   = f.get("debt_to_equity")
    if de is None and f.get("total_liabilities") and (f.get("net_assets") or 0) > 0:
        de = f["total_liabilities"] / f["net_assets"]
    lev  = min(er / 60 * 15, 15) + max(0, 10 - (de or 0) * 5)

    # Liquidity (20)
    cr   = f.get("current_ratio") or 0
    dscr = f.get("dscr")
    ic   = f.get("interest_coverage")
    liq  = min(cr / 2.0 * 10, 10)
    if dscr is not None:
        liq += min(dscr / 1.5 * 10, 10)
    elif ic is not None:
        liq += min(ic  / 3.0 * 10, 10)
    else:
        liq += min(er  / 80  * 10, 10)

    # Growth (15)
    grow  = min(max(f.get("revenue_growth_pct") or 0, 0) / 10 * 7.5, 7.5)
    grow += min(max(f.get("profit_growth_pct")  or 0, 0) / 15 * 7.5, 7.5)

    # Qualitative default (updated by decision LLM)
    qual = 6.0

    bd = ScoreBreakdown(
        profitability=round(max(min(prof, 30), 0), 1),
        leverage     =round(max(min(lev,  25), 0), 1),
        liquidity    =round(max(min(liq,  20), 0), 1),
        growth       =round(max(min(grow, 15), 0), 1),
        qualitative  =qual,
    )
    total = round(min(bd.profitability + bd.leverage + bd.liquidity + bd.growth + bd.qualitative, 100), 1)
    return total, bd


def score_to_rating(score: float) -> str:
    if score >= 85: return "AAA"
    if score >= 70: return "AA"
    if score >= 55: return "BBB"
    if score >= 40: return "BB"
    return "CCC"