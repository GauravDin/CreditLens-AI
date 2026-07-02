// src/components/results/QuickMetricsRow.tsx
import React from 'react'
import { FinancialData } from '../../types/api'
import { MetricCard } from '../common/MetricCard'
import { formatCurrencyValue, formatPercent, formatRatio } from '../../utils/formatters'

interface QuickMetricsRowProps {
  financials: FinancialData
}

export function QuickMetricsRow({ financials }: QuickMetricsRowProps) {
  const {
    revenue,
    net_profit,
    total_assets,
    equity_ratio,
    roe,
    dscr,
    currency,
    unit
  } = financials

  // Determine standard status values based on thresholds
  const getEquityStatus = (val: number | null) => {
    if (val === null) return 'neutral'
    if (val >= 60) return 'success'
    if (val >= 40) return 'neutral'
    return 'error'
  }

  const getRoeStatus = (val: number | null) => {
    if (val === null) return 'neutral'
    if (val >= 15) return 'success'
    if (val >= 8) return 'neutral'
    return 'warning'
  }

  const getDscrStatus = (val: number | null) => {
    if (val === null) return 'neutral'
    if (val >= 2.0) return 'success'
    if (val >= 1.5) return 'neutral'
    return 'error'
  }

  const getProfitStatus = (val: number | null) => {
    if (val === null) return 'neutral'
    return val > 0 ? 'neutral' : 'error'
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <MetricCard
        label="Total Revenue"
        value={formatCurrencyValue(revenue, currency, unit, 1)}
        status={getProfitStatus(revenue)}
      />
      <MetricCard
        label="Net Profit"
        value={formatCurrencyValue(net_profit, currency, unit, 1)}
        status={getProfitStatus(net_profit)}
      />
      <MetricCard
        label="Total Assets"
        value={formatCurrencyValue(total_assets, currency, unit, 1)}
      />
      <MetricCard
        label="Equity Ratio"
        value={formatPercent(equity_ratio, 1)}
        benchmark="≥ 40%"
        status={getEquityStatus(equity_ratio)}
      />
      <MetricCard
        label="Return on Equity"
        value={formatPercent(roe, 1)}
        benchmark="≥ 10%"
        status={getRoeStatus(roe)}
      />
      <MetricCard
        label="DSCR Coverage"
        value={formatRatio(dscr, 2)}
        benchmark="≥ 1.50×"
        status={getDscrStatus(dscr)}
      />
    </div>
  )
}
