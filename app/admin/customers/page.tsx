'use client'

import { useEffect, useMemo, useState } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { StatTile } from '@/components/admin/metrics-ui'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { adminHeaders } from '@/lib/admin-client'
import { formatPrice } from '@/lib/pricing'
import type { CustomersReport } from '@/server/metrics'

export default function AdminCustomersPage() {
  const [report, setReport] = useState<CustomersReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch('/api/admin/metrics?scope=customers', { headers: adminHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error('load failed')
        return r.json()
      })
      .then((j) => setReport(j.data))
      .catch(() => setError('Unable to load customers.'))
  }, [])

  const filtered = useMemo(() => {
    if (!report) return []
    const needle = q.trim().toLowerCase()
    if (!needle) return report.items
    return report.items.filter(
      (c) =>
        c.customer.toLowerCase().includes(needle) ||
        (c.email ?? '').toLowerCase().includes(needle) ||
        (c.city ?? '').toLowerCase().includes(needle),
    )
  }, [report, q])

  const exportCsv = () => {
    if (!report?.items.length) return
    const headers = ['Customer', 'Email', 'Orders', 'Lifetime (NAD)', 'First order', 'Last order', 'City']
    const rows = report.items.map((c) => [
      c.customer,
      c.email ?? '',
      c.orders,
      c.lifetimeNAD,
      c.firstOrderAt.slice(0, 10),
      c.lastOrderAt.slice(0, 10),
      c.city ?? '',
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `glb-customers-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminShell
      title="Customers"
      description="Buyer profiles assembled from order history — no separate signup required."
      actions={
        <button
          onClick={exportCsv}
          className="border border-ink px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] transition hover:bg-ink hover:text-paper"
        >
          Export CSV
        </button>
      }
    >
      {error && (
        <div className="mb-8 border border-vermillion bg-paper-warm p-4 text-sm text-vermillion">{error}</div>
      )}

      {!report && !error && (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {report && (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <StatTile label="Customers" value={report.total} accent />
            <StatTile
              label="Repeat rate"
              value={`${report.repeatRate}%`}
              sublabel="Bought more than once"
            />
            <StatTile label="Avg lifetime value" value={formatPrice(report.avgLifetimeNAD)} />
          </section>

          <section className="mt-8 border border-ink bg-paper-warm p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-xl uppercase tracking-wide">All customers</h2>
              <div className="w-full max-w-xs">
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email or city…" />
              </div>
            </div>

            {filtered.length === 0 ? (
              <p className="mt-6 text-sm text-graphite">
                {report.items.length === 0 ? 'No orders yet — customers appear with their first order.' : 'No match.'}
              </p>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink font-mono text-[0.6rem] uppercase tracking-[0.18em] text-graphite">
                      <th className="py-2 pr-4 font-medium">Customer</th>
                      <th className="py-2 pr-4 font-medium">City</th>
                      <th className="py-2 pr-4 text-right font-medium">Orders</th>
                      <th className="py-2 pr-4 text-right font-medium">Lifetime</th>
                      <th className="py-2 pr-4 font-medium">Last order</th>
                      <th className="py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {filtered.map((c) => (
                      <tr key={c.customer}>
                        <td className="max-w-[240px] truncate py-3 pr-4">{c.email ?? c.customer}</td>
                        <td className="py-3 pr-4 text-graphite">{c.city ?? '—'}</td>
                        <td className="py-3 pr-4 text-right font-mono tabular-nums">{c.orders}</td>
                        <td className="py-3 pr-4 text-right font-mono tabular-nums">
                          {formatPrice(c.lifetimeNAD)}
                        </td>
                        <td className="py-3 pr-4 text-graphite">{c.lastOrderAt.slice(0, 10)}</td>
                        <td className="py-3">
                          <span className="border border-hairline px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-sepia">
                            {c.lastStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </AdminShell>
  )
}
