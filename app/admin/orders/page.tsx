'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/AdminShell'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { adminHeaders } from '@/lib/admin-client'
import { ORDER_STATUSES } from '@/lib/constants'
import { formatPrice } from '@/lib/pricing'
import type { PublicOrder } from '@/server/orders'

const STATUS_FILTERS = ['all', ...ORDER_STATUSES] as const

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<PublicOrder[] | null>(null)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const url = new URL('/api/admin/orders', window.location.origin)
      if (status !== 'all') url.searchParams.set('status', status)
      url.searchParams.set('pageSize', '50')
      const res = await fetch(url.toString(), { headers: adminHeaders() })
      if (!res.ok) throw new Error('load failed')
      const json = await res.json()
      setOrders(json.items ?? [])
      setTotal(json.total ?? 0)
    } catch {
      toast.error('Unable to load orders')
      setOrders([])
    }
  }, [status])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = async (order: PublicOrder, nextStatus: string) => {
    setBusy(order.id)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Update failed')
      toast.success(`${order.orderNumber} → ${nextStatus}`)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <AdminShell
      title="Orders"
      description="Track every parcel from payment to doorstep. Status changes email the customer automatically."
      actions={
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`border px-3 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.14em] transition ${
                status === s
                  ? 'border-ink bg-ink text-paper'
                  : 'border-hairline text-graphite hover:border-ink hover:text-ink'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      }
    >
      {orders === null && <Skeleton className="h-64 w-full" />}

      {orders !== null && (
        <section className="border border-ink bg-paper-warm p-6">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-graphite">
            {total} order{total === 1 ? '' : 's'}
            {status !== 'all' ? ` · ${status}` : ''}
          </p>

          {orders.length === 0 ? (
            <p className="mt-6 text-sm text-graphite">No orders here yet.</p>
          ) : (
            <div className="mt-4 divide-y divide-hairline">
              {orders.map((o) => (
                <div key={o.id} className="py-4">
                  <button
                    className="flex w-full flex-wrap items-center justify-between gap-3 text-left"
                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                  >
                    <div className="min-w-0">
                      <span className="font-mono text-sm">{o.orderNumber}</span>
                      <span className="ml-3 text-xs text-graphite">
                        {o.guestEmail ?? 'account customer'} ·{' '}
                        {new Date(o.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <span className="font-mono text-sm tabular-nums">{formatPrice(o.totalNAD)}</span>
                      <span className="border border-hairline px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-sepia">
                        {o.status}
                      </span>
                      <span className="font-mono text-xs text-graphite">
                        {expanded === o.id ? '−' : '+'}
                      </span>
                    </div>
                  </button>

                  {expanded === o.id && (
                    <div className="mt-4 grid gap-6 border-t border-hairline pt-4 md:grid-cols-[2fr_1fr]">
                      <div>
                        <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-vermillion">
                          Items
                        </p>
                        <div className="space-y-2">
                          {o.lineItems.map((li) => (
                            <div key={li.variantSku} className="flex justify-between gap-3 text-sm">
                              <span className="min-w-0 truncate">
                                {li.qty} × {li.title}
                              </span>
                              <span className="shrink-0 font-mono tabular-nums">
                                {formatPrice(li.priceNAD * li.qty)}
                              </span>
                            </div>
                          ))}
                          <div className="flex justify-between gap-3 border-t border-hairline pt-2 text-sm">
                            <span>Shipping</span>
                            <span className="font-mono tabular-nums">{formatPrice(o.shippingNAD)}</span>
                          </div>
                        </div>

                        <p className="mb-2 mt-5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-vermillion">
                          Ship to
                        </p>
                        <p className="text-sm text-graphite">
                          {o.shippingAddress.name} · {o.shippingAddress.line1}
                          {o.shippingAddress.line2 ? `, ${o.shippingAddress.line2}` : ''},{' '}
                          {o.shippingAddress.city}, {o.shippingAddress.region},{' '}
                          {o.shippingAddress.country} · {o.shippingAddress.phone}
                        </p>
                        {o.notes && <p className="mt-2 text-sm italic text-sepia">“{o.notes}”</p>}
                      </div>

                      <div>
                        <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-vermillion">
                          Update status
                        </p>
                        <Select
                          value={o.status}
                          disabled={busy === o.id}
                          onChange={(e) => updateStatus(o, e.target.value)}
                          options={ORDER_STATUSES.map((s) => ({ value: s, label: s }))}
                        />
                        {o.paymentReference && (
                          <p className="mt-3 font-mono text-[0.62rem] text-graphite">
                            Paystack ref: {o.paymentReference}
                          </p>
                        )}
                        {o.paidAt && (
                          <p className="mt-1 font-mono text-[0.62rem] text-graphite">
                            Paid {new Date(o.paidAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </AdminShell>
  )
}
