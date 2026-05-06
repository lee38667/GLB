'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { ProductCard, type ProductCardData } from '@/components/commerce/ProductCard'
import { useDebounce } from '@/hooks/useDebounce'
import { useMediaQuery } from '@/hooks/useMediaQuery'

type Facets = {
  sizes: string[]
  colors: string[]
  collections: string[]
  priceRange: { min: number; max: number }
}

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'new', label: 'Newest' },
  { value: 'price-asc', label: 'Price · low to high' },
  { value: 'price-desc', label: 'Price · high to low' },
  { value: 'best-selling', label: 'Best selling' },
]

const pillBase =
  'border px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] transition'

const pillIdle =
  'border-hairline text-graphite hover:text-ink hover:border-ink'
const pillActive = 'border-ink bg-ink text-paper'

export default function ShopPage() {
  const router = useRouter()
  const sp = useSearchParams()

  const [products, setProducts] = useState<ProductCardData[]>([])
  const [total, setTotal] = useState(0)
  const [facets, setFacets] = useState<Facets | null>(null)
  const [loading, setLoading] = useState(true)

  const [q, setQ] = useState(sp.get('q') ?? '')
  const [sort, setSort] = useState(sp.get('sort') ?? 'featured')
  const [collection, setCollection] = useState(sp.get('collection') ?? '')
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(
    new Set(sp.get('sizes')?.split(',').filter(Boolean) ?? []),
  )
  const [selectedColors, setSelectedColors] = useState<Set<string>>(
    new Set(sp.get('colors')?.split(',').filter(Boolean) ?? []),
  )
  const [inStockOnly, setInStockOnly] = useState(sp.get('inStock') === '1')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const debouncedQ = useDebounce(q, 300)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  useEffect(() => {
    fetch('/api/products/facets')
      .then((r) => r.json())
      .then((j) => setFacets(j.data))
      .catch(() => {})
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const url = new URL('/api/products', window.location.origin)
    if (debouncedQ) url.searchParams.set('q', debouncedQ)
    if (sort !== 'featured') url.searchParams.set('sort', sort)
    if (collection) url.searchParams.set('collection', collection)
    if (selectedSizes.size) url.searchParams.set('sizes', [...selectedSizes].join(','))
    if (selectedColors.size) url.searchParams.set('colors', [...selectedColors].join(','))
    if (inStockOnly) url.searchParams.set('inStock', '1')

    try {
      const res = await fetch(url.toString())
      const json = await res.json()
      setProducts(json.items ?? [])
      setTotal(json.total ?? 0)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [debouncedQ, sort, collection, selectedSizes, selectedColors, inStockOnly])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const toggleSize = (s: string) => {
    setSelectedSizes((prev) => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })
  }
  const toggleColor = (c: string) => {
    setSelectedColors((prev) => {
      const next = new Set(prev)
      next.has(c) ? next.delete(c) : next.add(c)
      return next
    })
  }
  const clearFilters = () => {
    setQ('')
    setSort('featured')
    setCollection('')
    setSelectedSizes(new Set())
    setSelectedColors(new Set())
    setInStockOnly(false)
  }
  const activeFilterCount = useMemo(() => {
    let n = 0
    if (collection) n++
    n += selectedSizes.size
    n += selectedColors.size
    if (inStockOnly) n++
    return n
  }, [collection, selectedSizes, selectedColors, inStockOnly])

  const filterPanel = (
    <div className="space-y-7">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search the catalogue…"
        label="Search"
      />

      {facets && facets.collections.length > 0 && (
        <div>
          <p className="mb-3 font-mono text-[0.6rem] font-medium uppercase tracking-[0.22em] text-vermillion">
            Capsules
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCollection('')}
              className={`${pillBase} ${!collection ? pillActive : pillIdle}`}
            >
              All
            </button>
            {facets.collections.map((c) => (
              <button
                key={c}
                onClick={() => setCollection(collection === c ? '' : c)}
                className={`${pillBase} ${collection === c ? pillActive : pillIdle}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {facets && facets.sizes.length > 0 && (
        <div>
          <p className="mb-3 font-mono text-[0.6rem] font-medium uppercase tracking-[0.22em] text-vermillion">
            Sizes
          </p>
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((s) => (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                className={`flex h-9 min-w-9 items-center justify-center border font-mono text-[0.65rem] tracking-[0.12em] uppercase transition ${
                  selectedSizes.has(s)
                    ? 'border-ink bg-ink text-paper'
                    : 'border-hairline text-graphite hover:text-ink hover:border-ink'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {facets && facets.colors.length > 0 && (
        <div>
          <p className="mb-3 font-mono text-[0.6rem] font-medium uppercase tracking-[0.22em] text-vermillion">
            Colours
          </p>
          <div className="flex flex-wrap gap-2">
            {facets.colors.map((c) => (
              <button
                key={c}
                onClick={() => toggleColor(c)}
                className={`${pillBase} ${selectedColors.has(c) ? pillActive : pillIdle}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="flex items-center gap-3 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="h-4 w-4 accent-vermillion"
        />
        <span className="font-mono text-[0.7rem] tracking-[0.18em] uppercase">In stock only</span>
      </label>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-vermillion underline underline-offset-4 hover:text-ink"
        >
          Clear filters ({activeFilterCount})
        </button>
      )}
    </div>
  )

  return (
    <main className="bg-paper text-ink">
      <section className="glb-hero pb-0">
        <div className="glb-shell">
          <div className="flex items-center justify-between border-b border-ink pb-4">
            <span className="glb-caption uppercase tracking-[0.22em]">
              Letter № 03 · Catalogue
            </span>
            <span className="glb-eyebrow-stamp">In Print</span>
          </div>

          <div className="grid grid-cols-12 gap-6 mt-12 items-end">
            <div className="col-span-12 lg:col-span-8">
              <p className="glb-num">All pieces, currently in print</p>
              <h1 className="glb-display mt-4 text-[clamp(2.4rem,7vw,6rem)]">
                The <em>catalogue.</em>
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-4">
              <p className="glb-lede">
                Filter by capsule, size, or colour. Pieces appear in small
                batches and disappear when the print runs out.
              </p>
            </div>
          </div>

          <Breadcrumbs
            items={[{ href: '/', label: 'Home' }, { label: 'Shop' }]}
            className="mt-10"
          />
        </div>
      </section>

      <Container className="pb-24 pt-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-4">
          <p className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-graphite">
            {loading ? '…' : `${total} piece${total === 1 ? '' : 's'} in print`}
          </p>
          <div className="flex items-center gap-3">
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              options={SORT_OPTIONS}
              className="min-w-[200px]"
            />
            {!isDesktop && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-12">
          {isDesktop && (
            <aside className="sticky top-28 w-64 shrink-0 self-start">
              <p className="glb-num mb-5">№ — Filter the print run</p>
              {filterPanel}
            </aside>
          )}

          {!isDesktop && filtersOpen && (
            <div className="mb-6 w-full border border-ink bg-paper-warm p-6">
              {filterPanel}
            </div>
          )}

          <div className="flex-1">
            {loading && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="aspect-[4/5] w-full" />
                    <Skeleton className="mt-3 h-4 w-3/4" />
                    <Skeleton className="mt-2 h-4 w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="py-24 text-center border border-ink bg-paper-warm">
                <p className="font-display text-3xl italic">
                  No pieces match your letter.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-5 font-mono text-[0.7rem] tracking-[0.22em] uppercase text-vermillion underline underline-offset-4"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {!loading && products.length > 0 && (
              <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
                {products.map((p, i) => (
                  <ProductCard key={p.id} product={p} priority={i < 4} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </main>
  )
}
