'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { BarChart, StatTile } from '@/components/admin/metrics-ui'
import { Skeleton } from '@/components/ui/Skeleton'
import { adminHeaders } from '@/lib/admin-client'
import { formatPrice } from '@/lib/pricing'
import type { OverviewMetrics, RevenuePoint } from '@/server/metrics'
import type { PublicOrder } from '@/server/orders'

type OverviewData = { overview: OverviewMetrics; series: RevenuePoint[] }

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [recentOrders, setRecentOrders] = useState<PublicOrder[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [metricsRes, ordersRes] = await Promise.all([
          fetch('/api/admin/metrics?scope=overview&days=30', { headers: adminHeaders() }),
          fetch('/api/admin/orders?pageSize=6', { headers: adminHeaders() }),
        ])
        if (!metricsRes.ok) throw new Error('Failed to load metrics')
        const metricsJson = await metricsRes.json()
        setData(metricsJson.data)
        if (ordersRes.ok) {
          const ordersJson = await ordersRes.json()
          setRecentOrders(ordersJson.items ?? [])
        }
      } catch (err) {
        console.error(err)
        setError('Unable to load the dashboard. Check the connection and refresh.')
      }
    }
    load()
  }, [])

  return (
    <AdminShell
      title="Overview"
      description="The pulse of the house — sales, stock, and community at a glance."
    >
      {error && (
        <div className="mb-8 border border-vermillion bg-paper-warm p-4 text-sm text-vermillion">
          {error}
        </div>
      )}

      {!data && !error && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {data && (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Realized revenue"
              value={formatPrice(data.overview.revenueNAD)}
              sublabel={`${formatPrice(data.overview.revenue30dNAD)} in the last 30 days`}
              accent
            />
            <StatTile
              label="Orders"
              value={data.overview.orders.total}
              sublabel={`${data.overview.orders.pending} pending · ${data.overview.orders.paid} paid · ${data.overview.orders.fulfilled} fulfilled`}
            />
            <StatTile
              label="Average order"
              value={formatPrice(data.overview.aovNAD)}
              sublabel={`${data.overview.unitsSold} units sold all-time`}
            />
            <StatTile
              label="Customers"
              value={data.overview.customers}
              sublabel={`${data.overview.activeProducts} active products in print`}
            />
          </section>

          <section className="mt-8 border border-ink bg-paper-warm p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-xl uppercase tracking-wide">Revenue — last 30 days</h2>
              <Link
                href="/admin/finance"
                className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-vermillion hover:text-ink"
              >
                Finance →
              </Link>
            </div>
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
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-xl uppercase tracking-wide">Recent orders</h2>
                <Link
                  href="/admin/orders"
                  className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-vermillion hover:text-ink"
                >
                  All orders →
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <p className="mt-5 text-sm text-graphite">No orders yet — share the shop link.</p>
              ) : (
                <div className="mt-5 divide-y divide-hairline">
                  {recentOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <div className="truncate font-mono text-xs">{o.orderNumber}</div>
                        <div className="truncate text-[0.72rem] text-graphite">
                          {o.guestEmail ?? 'account customer'} · {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-mono text-sm tabular-nums">{formatPrice(o.totalNAD)}</div>
                        <div className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-sepia">
                          {o.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-ink bg-paper-warm p-6">
              <h2 className="font-display text-xl uppercase tracking-wide">Low stock</h2>
              {data.overview.lowStock.length === 0 ? (
                <p className="mt-5 text-sm text-graphite">
                  All variants have healthy stock (more than 3 units).
                </p>
              ) : (
                <div className="mt-5 divide-y divide-hairline">
                  {data.overview.lowStock.map((v) => (
                    <div key={v.sku} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm">{v.productTitle}</div>
                        <div className="font-mono text-[0.62rem] text-graphite">{v.sku}</div>
                      </div>
                      <span
                        className={`shrink-0 border px-2 py-1 font-mono text-[0.62rem] tabular-nums ${
                          v.stock === 0 ? 'border-vermillion text-vermillion' : 'border-ink'
                        }`}
                      >
                        {v.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/admin/products"
                className="mt-5 inline-block font-mono text-[0.62rem] uppercase tracking-[0.2em] text-vermillion hover:text-ink"
              >
                Manage products →
              </Link>
            </div>
          </section>
        </>
      )}
    </AdminShell>
  )
}
