import { NextResponse, type NextRequest } from 'next/server'
import { isAuthorizedAdmin } from '@/lib/admin-auth'
import { productSchema } from '@/lib/validators/product'
import { createProduct, listProducts } from '@/server/products'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const sp = req.nextUrl.searchParams
  const data = await listProducts({
    q: sp.get('q') ?? undefined,
    status: (sp.get('status') as 'active' | 'draft' | 'archived' | 'all' | null) ?? 'all',
    page: Number(sp.get('page') ?? 1),
    pageSize: Math.min(Number(sp.get('pageSize') ?? 50), 100),
  })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const json = await req.json().catch(() => null)
  const parsed = productSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid product', fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }
  try {
    const product = await createProduct(parsed.data)
    return NextResponse.json({ data: product }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create product'
    const conflict = /duplicate key|E11000/.test(message)
    return NextResponse.json(
      { error: conflict ? 'Handle already exists' : message },
      { status: conflict ? 409 : 500 },
    )
  }
}
