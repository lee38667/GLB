import { NextResponse, type NextRequest } from 'next/server'
import { isAuthorizedAdmin } from '@/lib/admin-auth'
import { getOrderById, updateOrderStatus } from '@/server/orders'
import { sendOrderStatusUpdate } from '@/lib/email/order-confirmation'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
  const order = await getOrderById(id)
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ success: true, data: order })
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
  const body = (await req.json()) as {
    status?: string
    trackingNumber?: string
  }

  const order = await updateOrderStatus(id, body.status ?? 'pending', {
    trackingNumber: body.trackingNumber,
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (body.status && body.status !== 'pending') {
    sendOrderStatusUpdate(order, body.status).catch((err) =>
      console.error('Failed to send status update email:', err),
    )
  }

  return NextResponse.json({ success: true, data: order })
}
