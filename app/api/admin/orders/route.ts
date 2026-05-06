import { NextResponse, type NextRequest } from 'next/server'
import { isAuthorizedAdmin } from '@/lib/admin-auth'
import { listOrders } from '@/server/orders'

export async function GET(req: NextRequest) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sp = req.nextUrl.searchParams
  const result = await listOrders({
    status: sp.get('status') ?? undefined,
    page: Number(sp.get('page') ?? 1),
    pageSize: Number(sp.get('pageSize') ?? 20),
  })

  return NextResponse.json({ success: true, ...result })
}
