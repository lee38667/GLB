import { NextResponse } from 'next/server'
import { getProductByHandle } from '@/server/products'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params
  try {
    const product = await getProductByHandle(handle)
    if (!product) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ data: product }, {
      headers: { 'Cache-Control': 's-maxage=120, stale-while-revalidate=600' },
    })
  } catch (error) {
    console.error(`GET /api/products/${handle} failed`, error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
