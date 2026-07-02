// src/utils/formatters.ts

/**
 * Formats currency/large numbers in corporate terms.
 * e.g., 45095.3 -> ¥45,095.3B JPY
 */
export function formatCurrencyValue(
  value: number | null,
  currency: string = 'USD',
  unit: string = 'millions',
  decimals: number = 2
): string {
  if (value === null || value === undefined) return '–'

  const currencySym = getCurrencySymbol(currency)

  // Use raw number formatter
  const formattedVal = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value)

  // e.g. $45,095.30 million USD
  return `${currencySym}${formattedVal} ${unit}`
}

export function formatRawNumber(value: number | null, decimals: number = 2): string {
  if (value === null || value === undefined) return '–'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatPercent(value: number | null, decimals: number = 1): string {
  if (value === null || value === undefined) return '–'
  return `${value.toFixed(decimals)}%`
}

export function formatRatio(value: number | null, decimals: number = 2): string {
  if (value === null || value === undefined) return '–'
  return `${value.toFixed(decimals)}×`
}

function getCurrencySymbol(curr: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    CAD: 'CA$',
    AUD: 'A$',
    CHF: 'CHF',
  }
  return symbols[curr.toUpperCase()] || `${curr} `
}
