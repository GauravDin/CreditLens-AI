// src/types/api.ts

export interface UploadResponse {
  session_id: string
  doc_count: number
  filenames: string[]
}

export interface SegmentData {
  name: string
  revenue: number | null
  profit: number | null
  margin: number | null
}

export interface FinancialData {
  company_name: string
  ticker: string | null
  fiscal_year: string | null
  reporting_period: string | null
  currency: string
  unit: string
  sector: string | null
  industry: string | null
  // Income Statement
  revenue: number | null
  revenue_prev: number | null
  gross_profit: number | null
  ebitda: number | null
  operating_profit: number | null
  net_profit: number | null
  interest_expense: number | null
  tax_expense: number | null
  depreciation_amortization: number | null
  // Balance Sheet
  current_assets: number | null
  total_assets: number | null
  current_liabilities: number | null
  total_liabilities: number | null
  net_assets: number | null
  cash: number | null
  retained_earnings: number | null
  inventory: number | null
  accounts_receivable: number | null
  // Cash Flow
  operating_cash_flow: number | null
  capex: number | null
  free_cash_flow: number | null
  // Ratios
  equity_ratio: number | null
  roe: number | null
  roa: number | null
  roi: number | null
  operating_margin: number | null
  ebitda_margin: number | null
  gross_margin: number | null
  net_margin: number | null
  current_ratio: number | null
  quick_ratio: number | null
  cash_ratio: number | null
  debt_to_equity: number | null
  debt_to_assets: number | null
  interest_coverage: number | null
  dscr: number | null
  // Growth
  revenue_growth_pct: number | null
  profit_growth_pct: number | null
  asset_growth_pct: number | null
  // Dividends
  dividend_per_share: number | null
  payout_ratio: number | null
  // Segments & Forecast
  segments: SegmentData[]
  forecast_revenue: number | null
  forecast_op_profit: number | null
  forecast_net_profit: number | null
  qualitative_notes: string
}

export interface ScoreBreakdown {
  profitability: number  // max 30
  leverage: number       // max 25
  liquidity: number      // max 20
  growth: number         // max 15
  qualitative: number    // max 10
}

export interface AltmanZScore {
  z_score: number
  zone: 'Safe' | 'Grey' | 'Distress'
  x1: number | null
  x2: number | null
  x3: number | null
  x4: number | null
  x5: number | null
}

export interface LendingDecision {
  recommendation: 'APPROVE' | 'CONDITIONAL' | 'DECLINE'
  max_safe_loan: number | null
  loan_to_asset_ratio: number | null
  strengths: string[]
  risks: string[]
  conditions: string[]
  monitoring_requirements: string[]
  narrative: string
}

export interface CreditAnalysisResult {
  financials: FinancialData
  credit_score: number
  credit_rating: 'AAA' | 'AA' | 'BBB' | 'BB' | 'CCC'
  score_breakdown: ScoreBreakdown
  altman_z: AltmanZScore | null
  decision: LendingDecision
  loan_amount_requested: number | null
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string // Store ISO strings for serialization
}

export interface StockHistory {
  date: string
  close: number
}

export interface StockData {
  ticker: string
  source: string
  current_price: number | null
  previous_close: number | null
  market_cap: number | null
  pe_ratio: number | null
  forward_pe: number | null
  pb_ratio: number | null
  beta: number | null
  '52w_high': number | null
  '52w_low': number | null
  volume: number | null
  dividend_yield: number | null
  eps: number | null
  roe: number | null
  sector: string | null
  currency: string
  exchange: string | null
  history: StockHistory[]
  error: string | null
}

export interface UploadedFile {
  name: string
  size: number
  type: string
  status: 'pending' | 'uploading' | 'completed' | 'failed'
  error?: string
}
