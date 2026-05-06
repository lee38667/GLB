'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/AdminShell'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { formatPrice } from '@/lib/pricing'
import type { PublicProduct } from '@/server/products'

type ListResponse = { items: PublicProduct[]; total: number }

const statusVariant = {
  active: 'success' as const,
  draft: 'warning' as const,
  archived: 'danger' as const,
}

export default function AdminProductsPage() {
  const [items, setItems] = useState<PublicProduct[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'draft' | 'archived'>('all')
  const debouncedQ = useDebounce(q, 300)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const url = new URL('/api/admin/products', window.location.origin)
      if (debouncedQ) url.searchParams.set('q', debouncedQ)
      url.searchParams.set('status', status)
      url.searchParams.set('pageSize', '100')
      const res = await fetch(url.toString(), { headers: adminHeaders() })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to load')
      const json = (await res.json()) as ListResponse
      setItems(json.items)
      setTotal(json.total)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [debouncedQ, status])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: adminHeaders(),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed')
      toast.success(`Deleted "${title}"`)
      setItems((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed')
    }
  }

  const summary = useMemo(() => {
    const active = items.filter((p) => p.status === 'active').length
    const draft = items.filter((p) => p.status === 'draft').length
    const oos = items.filter((p) => !p.inStock && p.status === 'active').length
    return { active, draft, oos }
  }, [items])

  return (
    <AdminShell
      title="Products"
      description={`${total} products in catalogue · ${summary.active} active · ${summary.draft} draft · ${summary.oos} out of stock`}
      actions={
        <Button href="/admin/products/new" variant="primary">
          + New product
        </Button>
      }
    >
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <Input
          label="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Title, tag, SKU…"
          containerClassName="min-w-[260px] flex-1"
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          options={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'draft', label: 'Draft' },
            { value: 'archived', label: 'Archived' },
          ]}
          className="min-w-[160px]"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/5 text-[0.65rem] uppercase tracking-[0.24em] text-tide">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Collection</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skel-${i}`}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-4">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-clay">
                  No products yet.{' '}
                  <Link href="/admin/products/new" className="underline">
                    Create the first one
                  </Link>
                  .
                </td>
              </tr>
            )}

            {!loading &&
              items.map((p) => {
                const totalStock = p.variants.reduce((s, v) => s + (v.isActive ? v.stock : 0), 0)
                const firstImage = p.images[0]
                const priceLabel =
                  p.minPriceNAD === p.maxPriceNAD
                    ? formatPrice(p.minPriceNAD)
                    : `${formatPrice(p.minPriceNAD)} – ${formatPrice(p.maxPriceNAD)}`
                return (
                  <tr key={p.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/5">
                          {firstImage && (
                            <Image
                              src={firstImage.url}
                              alt={firstImage.alt}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="block truncate font-medium text-sand hover:underline"
                          >
                            {p.title}
                          </Link>
                          <p className="truncate text-[0.7rem] text-tide">/{p.handle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-clay">{p.collection || '—'}</td>
                    <td className="px-4 py-3 tabular-nums">{priceLabel}</td>
                    <td className="px-4 py-3 tabular-nums">{totalStock}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[p.status] ?? 'default'}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          href={`/admin/products/${p.id}`}
                          variant="secondary"
                          size="sm"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(p.id, p.title)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:bg-red-500/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}

function adminHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {}
  const key = window.localStorage.getItem('glb_admin_key') ?? ''
  return key ? { 'x-admin-key': key } : {}
}
