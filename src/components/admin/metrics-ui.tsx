'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { formatPrice } from '@/lib/pricing'

export function StatTile({
  label,
  value,
  sublabel,
  accent = false,
}: {
  label: string
  value: string | number
  sublabel?: string
  accent?: boolean
}) {
  return (
    <div className="border border-ink bg-paper-warm p-5">
      <div className={cn('font-display text-3xl tabular-nums', accent ? 'text-vermillion' : 'text-ink')}>
        {value}
      </div>
      <div className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.24em] text-graphite">
        {label}
      </div>
      {sublabel && <div className="mt-2 text-[0.72rem] text-sepia">{sublabel}</div>}
    </div>
  )
}

export type BarPoint = { label: string; value: number; detail?: string }

/**
 * Single-series bar chart (SVG). One hue, per-bar hover tooltip, peak value
 * direct-labeled. Not for multi-series data.
 */
export function BarChart({
  points,
  height = 160,
  formatValue = (v: number) => formatPrice(v),
}: {
  points: BarPoint[]
  height?: number
  formatValue?: (v: number) => string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(...points.map((p) => p.value), 1)
  const peakIndex = points.findIndex((p) => p.value === max && max > 0)
  const width = 720
  const padTop = 22
  const padBottom = 18
  const innerH = height - padTop - padBottom
  const step = width / points.length
  const barW = Math.max(Math.min(step - 2, 26), 3)

  if (!points.length) return null

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[480px]"
        role="img"
        aria-label="Bar chart"
        onMouseLeave={() => setHover(null)}
      >
        {/* recessive baseline + midline */}
        <line x1="0" y1={height - padBottom} x2={width} y2={height - padBottom} stroke="#C9BEA7" strokeWidth="1" />
        <line x1="0" y1={padTop + innerH / 2} x2={width} y2={padTop + innerH / 2} stroke="#C9BEA7" strokeWidth="0.5" strokeDasharray="2 4" />

        {points.map((p, i) => {
          const h = max ? (p.value / max) * innerH : 0
          const x = i * step + (step - barW) / 2
          const y = height - padBottom - h
          const active = hover === i
          return (
            <g key={p.label}>
              {/* generous hit target */}
              <rect
                x={i * step}
                y={0}
                width={step}
                height={height}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
              />
              {p.value > 0 && (
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx={2}
                  fill={active ? '#D63A26' : '#14110E'}
                  style={{ pointerEvents: 'none' }}
                />
              )}
              {i === peakIndex && p.value > 0 && (
                <text
                  x={Math.min(Math.max(x + barW / 2, 30), width - 40)}
                  y={Math.max(y - 6, 12)}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="monospace"
                  fill="#14110E"
                >
                  {formatValue(p.value)}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {hover !== null && points[hover] && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 border border-ink bg-paper px-3 py-2 text-xs shadow-stamp"
          style={{ left: `${((hover + 0.5) / points.length) * 100}%` }}
        >
          <div className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-graphite">
            {points[hover].label}
          </div>
          <div className="mt-1 font-semibold tabular-nums">{formatValue(points[hover].value)}</div>
          {points[hover].detail && <div className="text-[0.68rem] text-sepia">{points[hover].detail}</div>}
        </div>
      )}
    </div>
  )
}

/** Minimal single-series sparkline for trend context (e.g. follower growth). */
export function Sparkline({
  values,
  width = 220,
  height = 48,
}: {
  values: number[]
  width?: number
  height?: number
}) {
  if (values.length < 2) {
    return (
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-graphite">
        Not enough history yet
      </p>
    )
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pad = 4
  const points = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (width - pad * 2)
      const y = height - pad - ((v - min) / range) * (height - pad * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Trend">
      <polyline points={points} fill="none" stroke="#14110E" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle
        cx={width - pad}
        cy={height - pad - (((values.at(-1) ?? min) - min) / range) * (height - pad * 2)}
        r="3.5"
        fill="#D63A26"
      />
    </svg>
  )
}

/** Horizontal proportion list — replaces pie charts for share-of-total. */
export function ShareList({
  rows,
  formatValue = (v: number) => formatPrice(v),
}: {
  rows: Array<{ label: string; value: number; detail?: string }>
  formatValue?: (v: number) => string
}) {
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{r.label}</span>
            <span className="shrink-0 font-mono text-xs tabular-nums">{formatValue(r.value)}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-2 flex-1 bg-paper-soft">
              <div
                className="h-2 bg-ink"
                style={{ width: `${Math.max((r.value / max) * 100, 1)}%` }}
              />
            </div>
            {r.detail && (
              <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-graphite">
                {r.detail}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
