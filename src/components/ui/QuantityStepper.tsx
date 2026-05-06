'use client'

import { cn } from '@/lib/cn'

type Props = {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  className?: string
  ariaLabel?: string
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
  ariaLabel = 'Quantity',
}: Props) {
  const dec = () => onChange(Math.max(min, value - 1))
  const inc = () => onChange(Math.min(max, value + 1))
  return (
    <div
      className={cn(
        'inline-flex items-center border border-ink bg-paper-warm',
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="flex h-10 w-10 items-center justify-center text-graphite transition hover:bg-ink hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-graphite"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      <span className="min-w-[2.4rem] text-center font-mono text-sm tabular-nums text-ink border-x border-ink h-10 leading-10">
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="flex h-10 w-10 items-center justify-center text-graphite transition hover:bg-vermillion hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-graphite"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  )
}
