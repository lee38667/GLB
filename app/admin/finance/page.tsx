'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { BarChart, ShareList, StatTile } from '@/components/admin/metrics-ui'
import { Skeleton } from '@/components/ui/Skeleton'
import { adminHeaders } from '@/lib/admin-client'
import { formatPrice } from '@/lib/pricing'
import type { FinanceBreakdown, OverviewMetrics, RevenuePoint } from '@/server/metrics'

type FinanceData = {
  overview: OverviewMetrics
  series: RevenuePoint[]
  breakdown: FinanceBreakdown
}

const RANGES = [
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
  { days: 365, label: '12 months' },
]

export default function AdminFinancePage() {
  const [data, setData] = useState<FinanceData | null>(null)
  const [days, setDays] = useState(30)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
    fetch(`/api/admin/metrics?scope=finance&days=${days}`, { headers: adminHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error('load failed')
        return r.json()
      })
      .then((j) => setData(j.data))
      .catch(() => setError('Unable to load finance data.'))
  }, [days])

  return (
    <AdminShell
      title="Finance"
      description="Realized revenue from paid orders onward. Pending and cancelled orders are excluded; refunds tracked separately."
      actions={
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`border px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] transition ${
                days === r.days
                  ? 'border-ink bg-ink text-paper'
                  : 'border-hairline text-graphite hover:border-ink hover:text-ink'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      }
    >
      {error && (
        <div className="mb-8 border border-vermillion bg-paper-warm p-4 text-sm text-vermillion">{error}</div>
      )}

      {!data && !error && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {data && (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatTile label="Realized revenue" value={formatPrice(data.overview.revenueNAD)} accent />
            <StatTile
              label="Shipping collected"
              value={formatPrice(data.breakdown.shippingCollectedNAD)}
            />
            <StatTile
              label="Refunded"
              value={formatPrice(data.breakdown.refundedNAD)}
              sublabel={`${data.breakdown.refundedCount} order${data.breakdown.refundedCount === 1 ? '' : 's'}`}
            />
            <StatTile
              label="Awaiting payment"
              value={formatPrice(data.breakdown.pendingValueNAD)}
              sublabel="Value of pending orders"
            />
          </section>

          <section className="mt-8 border border-ink bg-paper-warm p-6">
            <h2 className="font-display text-xl uppercase tracking-wide">
              Daily revenue — last {days} days
            </h2>
            <div className="mt-5">
              <BarChart
                points={data.series.map((p) => ({
                  label: p.date.slice(5),
                  value: p.revenueNAD,
                  detail: `${p.orders} order${p.orders === 1 ? '' : 's'}`,
                }))}
              />
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="border border-ink bg-paper-warm p-6">
              <h2 className="font-display text-xl uppercase tracking-wide">Revenue by capsule</h2>
              <div className="mt-5">
                {data.breakdown.byCollection.length === 0 ? (
                  <p className="text-sm text-graphite">No paid orders yet.</p>
                ) : (
                  <ShareList
                    rows={data.breakdown.byCollection.map((c) => ({
                      label: c.collection,
                      value: c.revenueNAD,
                      detail: `${c.unitsSold} units`,
                    }))}
                  />
                )}
              </div>
            </div>

            <div className="border border-ink bg-paper-warm p-6">
              <h2 className="font-display text-xl uppercase tracking-wide">Top pieces</h2>
              <div className="mt-5">
                {data.breakdown.byProduct.length === 0 ? (
                  <p className="text-sm text-graphite">No paid orders yet.</p>
                ) : (
                  <ShareList
                    rows={data.breakdown.byProduct.slice(0, 8).map((p) => ({
                      label: p.title,
                      value: p.revenueNAD,
                      detail: `${p.unitsSold} units`,
                    }))}
                  />
                )}
              </div>
            </div>
          </section>

          <p className="mt-8 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-graphite">
            Paystack fees &amp; settlement reconciliation land in Phase 3 — see docs/admin-redesign.md
          </p>
        </>
      )}
    </AdminShell>
  )
}
