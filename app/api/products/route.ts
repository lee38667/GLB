import { NextResponse, type NextRequest } from 'next/server'
import { listProducts, type ProductQuery } from '@/server/products'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const csv = (key: string) => sp.get(key)?.split(',').filter(Boolean) ?? undefined
  const num = (key: string) => {
    const raw = sp.get(key)
    if (raw == null || raw === '') return undefined
    const n = Number(raw)
    return Number.isFinite(n) ? n : undefined
  }
  const sort = sp.get('sort') as ProductQuery['sort'] | null

  const query: ProductQuery = {
    q: sp.get('q') ?? undefined,
    collection: sp.get('collection') ?? undefined,
    sizes: csv('sizes'),
    colors: csv('colors'),
    minPrice: num('minPrice'),
    maxPrice: num('maxPrice'),
    inStock: sp.get('inStock') === '1' || undefined,
    sort: sort ?? undefined,
    page: num('page') ?? 1,
    pageSize: Math.min(num('pageSize') ?? 24, 60),
  }

  try {
    const data = await listProducts(query)
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('GET /api/products failed', error)
    return NextResponse.json({ error: 'Failed to list products' }, { status: 500 })
  }
}
