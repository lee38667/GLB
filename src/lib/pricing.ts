const NAD_FORMATTER = new Intl.NumberFormat('en-NA', {
  style: 'currency',
  currency: 'NAD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPrice(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return NAD_FORMATTER.format(0)
  }
  return NAD_FORMATTER.format(value)
}

export function formatCents(cents: number): string {
  return formatPrice(cents / 100)
}

export function toCents(value: number): number {
  return Math.round(value * 100)
}
