"""Financial domain models — extracted data + scoring intermediates."""
from __future__ import annotations
from typing import Any, Optional
from pydantic import BaseModel, Field


class SegmentData(BaseModel):
    name:   str
    revenue: Optional[float] = None
    profit:  Optional[float] = None
    margin:  Optional[float] = None


class FinancialData(BaseModel):
    # Identity
    company_name:     str            = "Unknown Company"
    ticker:           Optional[str]  = None
    fiscal_year:      Optional[str]  = None
    reporting_period: Optional[str]  = None
    currency:         str            = "N/A"
    unit:             str            = "millions"
    sector:           Optional[str]  = None
    industry:         Optional[str]  = None

    # Income Statement
    revenue:                  Optional[float] = None
    revenue_prev:             Optional[float] = None
    gross_profit:             Optional[float] = None
    ebitda:                   Optional[float] = None
    operating_profit:         Optional[float] = None
    net_profit:               Optional[float] = None
    interest_expense:         Optional[float] = None
    tax_expense:              Optional[float] = None
    depreciation_amortization:Optional[float] = None

    # Balance Sheet
    current_assets:     Optional[float] = None
    total_assets:       Optional[float] = None
    current_liabilities:Optional[float] = None
    total_liabilities:  Optional[float] = None
    net_assets:         Optional[float] = None
    cash:               Optional[float] = None
    retained_earnings:  Optional[float] = None
    inventory:          Optional[float] = None
    accounts_receivable:Optional[float] = None

    # Cash Flow
    operating_cash_flow: Optional[float] = None
    capex:               Optional[float] = None
    free_cash_flow:      Optional[float] = None

    # Ratios
    equity_ratio:      Optional[float] = None
    roe:               Optional[float] = None
    roa:               Optional[float] = None
    roi:               Optional[float] = None
    operating_margin:  Optional[float] = None
    ebitda_margin:     Optional[float] = None
    gross_margin:      Optional[float] = None
    net_margin:        Optional[float] = None
    current_ratio:     Optional[float] = None
    quick_ratio:       Optional[float] = None
    cash_ratio:        Optional[float] = None
    debt_to_equity:    Optional[float] = None
    debt_to_assets:    Optional[float] = None
    interest_coverage: Optional[float] = None
    dscr:              Optional[float] = None

    # Growth (YoY %)
    revenue_growth_pct: Optional[float] = None
    profit_growth_pct:  Optional[float] = None
    asset_growth_pct:   Optional[float] = None

    # Dividends
    dividend_per_share: Optional[float] = None
    payout_ratio:       Optional[float] = None

    # Segments / forecasts
    segments:            list[SegmentData] = Field(default_factory=list)
    forecast_revenue:    Optional[float]   = None
    forecast_op_profit:  Optional[float]   = None
    forecast_net_profit: Optional[float]   = None

    qualitative_notes: str = ""


class ScoreBreakdown(BaseModel):
    """Weighted scores summing to ≤ 100."""
    profitability: float = 0.0   # max 30
    leverage:      float = 0.0   # max 25
    liquidity:     float = 0.0   # max 20
    growth:        float = 0.0   # max 15
    qualitative:   float = 0.0   # max 10


class AltmanZScore(BaseModel):
    """Altman Z′ for private companies."""
    z_score: float
    zone:    str              # Safe | Grey | Distress
    x1: Optional[float] = None
    x2: Optional[float] = None
    x3: Optional[float] = None
    x4: Optional[float] = None
    x5: Optional[float] = None