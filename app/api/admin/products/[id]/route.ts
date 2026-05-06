import { NextResponse, type NextRequest } from 'next/server'
import { isAuthorizedAdmin } from '@/lib/admin-auth'
import { productSchema } from '@/lib/validators/product'
import { deleteProduct, getProductById, updateProduct } from '@/server/products'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const product = await getProductById(id)
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: product })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const json = await req.json().catch(() => null)
  const parsed = productSchema.partial().safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid product', fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }
  const product = await updateProduct(id, parsed.data)
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: product })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const ok = await deleteProduct(id)
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
