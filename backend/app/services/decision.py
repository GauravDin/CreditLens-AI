"""
LLM-powered extraction and lending decision.
Orchestrates: extract → derive ratios → score → Altman Z → decision.
"""
from __future__ import annotations
import json
import logging
from typing import Optional

from openai import OpenAI

import app.config as config
from app.models.financial import FinancialData, SegmentData
from app.models.credit    import CreditAnalysisResult, LendingDecision
from app.services.scoring import (
    compute_altman_z, compute_credit_score, compute_derived_ratios,
    parse_llm_json, score_to_rating,
)

logger  = logging.getLogger(__name__)
_nvidia = OpenAI(base_url=config.NVIDIA_BASE_URL, api_key=config.NVIDIA_API_KEY)

# ── Prompts ───────────────────────────────────────────────────────────────────

_EXTRACT_SYSTEM = (
    "You are a financial data extractor. "
    "Return ONLY valid JSON — no fences, no preamble. "
    "Numbers exact scale; percentages as raw value (23.5 not 0.235)."
)

_EXTRACT_SCHEMA = """{
  "company_name":"string","ticker":"string|null","fiscal_year":"string",
  "reporting_period":"string|null","currency":"string","unit":"string",
  "sector":"string|null","industry":"string|null",
  "revenue":number,"revenue_prev":number,"gross_profit":number,
  "ebitda":number,"operating_profit":number,"net_profit":number,
  "interest_expense":number,"tax_expense":number,"depreciation_amortization":number,
  "current_assets":number,"total_assets":number,"current_liabilities":number,
  "total_liabilities":number,"net_assets":number,"cash":number,
  "retained_earnings":number,"inventory":number,"accounts_receivable":number,
  "operating_cash_flow":number,"capex":number,"free_cash_flow":number,
  "equity_ratio":number,"roe":number,"roa":number,
  "operating_margin":number,"ebitda_margin":number,
  "current_ratio":number,"quick_ratio":number,
  "debt_to_equity":number,"interest_coverage":number,"dscr":number,
  "revenue_growth_pct":number,"profit_growth_pct":number,
  "dividend_per_share":number,"payout_ratio":number,
  "segments":[{"name":"string","revenue":number,"profit":number}],
  "forecast_revenue":number,"forecast_op_profit":number,"forecast_net_profit":number,
  "qualitative_notes":"string"
}"""

_DECISION_SCHEMA = """{
  "recommendation":"APPROVE|CONDITIONAL|DECLINE",
  "max_safe_loan":number,
  "loan_to_asset_ratio":number|null,
  "strengths":["string","string","string"],
  "risks":["string","string","string"],
  "conditions":["string"],
  "monitoring_requirements":["string","string"],
  "narrative":"2-3 sentence credit summary"
}"""


def _llm(messages, max_tokens=3000) -> str:
    resp = _nvidia.chat.completions.create(
        model=config.NVIDIA_MODEL,
        messages=messages,
        temperature=0.0,
        max_tokens=max_tokens,
    )
    return resp.choices[0].message.content


def _llm_json(messages, max_tokens=3000) -> dict:
    raw = _llm(messages, max_tokens)
    try:
        return parse_llm_json(raw)
    except ValueError:
        logger.warning("JSON parse failed; strict retry")
        raw2 = _llm([{"role":"assistant","content":raw},
                     {"role":"user","content":"Output ONLY the JSON object. No prose. No fences."}], 1500)
        return parse_llm_json(raw2)


# ── Lending decision ──────────────────────────────────────────────────────────

def get_lending_decision(
    f: dict, score: float, breakdown, altman_z, loan_amount: Optional[float]
) -> LendingDecision:
    ta  = f.get("total_assets") or 0
    er  = f.get("equity_ratio") or 0
    max_loan = ta * 0.20 if er >= 60 else ta * 0.10
    z_text   = f"{altman_z.z_score} ({altman_z.zone})" if altman_z else "N/A"

    data = _llm_json([{"role":"user","content":(
        f"Credit officer decision. Company: {f.get('company_name')} | "
        f"Currency: {f.get('currency')} | Unit: {f.get('unit')}\n"
        f"Score: {score}/100 | Rating: {score_to_rating(score)} | Z′: {z_text}\n"
        f"Breakdown: {json.dumps(breakdown.model_dump())}\n"
        f"Key metrics: revenue={f.get('revenue')} op_profit={f.get('operating_profit')} "
        f"equity_ratio={f.get('equity_ratio')} current_ratio={f.get('current_ratio')} "
        f"dscr={f.get('dscr')} roe={f.get('roe')} total_assets={ta}\n"
        f"Loan requested: {loan_amount} | Max safe (rule): {max_loan:.0f}\n"
        f"Return ONLY this JSON:\n{_DECISION_SCHEMA}"
    )}], 800)

    return LendingDecision(
        recommendation          = data.get("recommendation", "CONDITIONAL"),
        max_safe_loan           = data.get("max_safe_loan") or round(max_loan, 2),
        loan_to_asset_ratio     = data.get("loan_to_asset_ratio"),
        strengths               = data.get("strengths", []),
        risks                   = data.get("risks",     []),
        conditions              = data.get("conditions",[]),
        monitoring_requirements = data.get("monitoring_requirements", [
            "Quarterly financial statements",
            "Annual credit review",
        ]),
        narrative = data.get("narrative", ""),
    )


# ── Main pipeline ─────────────────────────────────────────────────────────────

def run_credit_analysis(combined_markdown: str, loan_amount: Optional[float] = None) -> CreditAnalysisResult:
    """
    Full pipeline:
    1. LLM financial extraction   (1 call)
    2. Clean raw strings/numeric fields to floats or None
    3. Derive missing ratios      (math)
    4. Credit scoring             (math)
    5. Altman Z′                  (math)
    6. LLM lending decision       (1 call)
    Total: 2 LLM calls.
    """
    # 1 — Extract
    raw_f = _llm_json([
        {"role":"system","content":_EXTRACT_SYSTEM},
        {"role":"user",  "content":(
            f"Document:\n\n{combined_markdown}\n\n"
            f"Schema:\n{_EXTRACT_SCHEMA}"
        )},
    ], max_tokens=3000)

    # 2 — Clean float fields before math operations
    # Guard: LLM sometimes returns "N/A" / "null" strings for numeric fields → None
    _NON_NUMERIC = {"n/a", "null", "none", "", "-", "—"}
    _float_fields = {
        k for k, fi in FinancialData.model_fields.items()
        if "float" in str(fi.annotation).lower()
    }
    for key in list(raw_f.keys()):
        if key in _float_fields:
            val = raw_f[key]
            if val is None:
                continue
            if isinstance(val, str) and val.strip().lower() in _NON_NUMERIC:
                raw_f[key] = None
            elif isinstance(val, str):
                try:
                    raw_f[key] = float(val.replace(",", ""))
                except ValueError:
                    raw_f[key] = None

    # 3 — Derive
    raw_f = compute_derived_ratios(raw_f)

    # Guard: SegmentData(**s) may raise ValidationError on unexpected LLM keys
    segs: list[SegmentData] = []
    for s in raw_f.pop("segments", []):
        try:
            segs.append(SegmentData(**s) if isinstance(s, dict) else SegmentData(name=str(s)))
        except Exception:
            pass  # skip malformed segment

    valid_keys = set(FinancialData.model_fields.keys())
    financials = FinancialData(**{k: v for k, v in raw_f.items() if k in valid_keys}, segments=segs)
    f_dict     = financials.model_dump()

    # 4 — Score + Altman
    score, breakdown = compute_credit_score(f_dict)
    altman_z         = compute_altman_z(f_dict)

    # 5 — Decision
    decision = get_lending_decision(f_dict, score, breakdown, altman_z, loan_amount)

    # Adjust qualitative
    breakdown.qualitative = {"APPROVE": 8.5, "CONDITIONAL": 6.0, "DECLINE": 3.0}.get(decision.recommendation, 6.0)
    final_score = round(min(
        breakdown.profitability + breakdown.leverage +
        breakdown.liquidity    + breakdown.growth    + breakdown.qualitative, 100
    ), 1)

    return CreditAnalysisResult(
        financials=financials, credit_score=final_score,
        credit_rating=score_to_rating(final_score),
        score_breakdown=breakdown, altman_z=altman_z,
        decision=decision, loan_amount_requested=loan_amount,
    )