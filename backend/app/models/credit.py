"""Credit decision models."""
from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field
from app.models.financial import FinancialData, ScoreBreakdown, AltmanZScore


class LendingDecision(BaseModel):
    recommendation:          str                 # APPROVE | CONDITIONAL | DECLINE
    max_safe_loan:           Optional[float] = None
    loan_to_asset_ratio:     Optional[float] = None
    strengths:               list[str] = Field(default_factory=list)
    risks:                   list[str] = Field(default_factory=list)
    conditions:              list[str] = Field(default_factory=list)
    monitoring_requirements: list[str] = Field(default_factory=list)
    narrative:               str       = ""


class CreditAnalysisResult(BaseModel):
    financials:            FinancialData
    credit_score:          float
    credit_rating:         str          # AAA | AA | BBB | BB | CCC
    score_breakdown:       ScoreBreakdown
    altman_z:              Optional[AltmanZScore] = None
    decision:              LendingDecision
    loan_amount_requested: Optional[float]        = None