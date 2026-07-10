const NAD_FORMATTER = new Intl.NumberFormat('en-NA', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPrice(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return `N$${NAD_FORMATTER.format(0)}`
  }
  return `N$${NAD_FORMATTER.format(value)}`
}

export function formatCents(cents: number): string {
  return formatPrice(cents / 100)
}

export function toCents(value: number): number {
  return Math.round(value * 100)
}
