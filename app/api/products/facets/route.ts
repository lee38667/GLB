import { NextResponse } from 'next/server'
import { getFacets } from '@/server/products'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const facets = await getFacets()
    return NextResponse.json({ data: facets }, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=1800' },
    })
  } catch (error) {
    console.error('GET /api/products/facets failed', error)
    return NextResponse.json({ error: 'Failed to load facets' }, { status: 500 })
  }
}
