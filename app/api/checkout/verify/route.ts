import { NextResponse, type NextRequest } from 'next/server'
import { verifyTransaction } from '@/lib/paystack'
import { getOrderByReference, markOrderPaid } from '@/server/orders'

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get('reference')
  if (!reference) {
    return NextResponse.json({ success: false, error: 'Missing reference' }, { status: 400 })
  }

  try {
    const paystackData = await verifyTransaction(reference)

    if (paystackData.status === 'success') {
      await markOrderPaid(reference)
    }

    const order = await getOrderByReference(reference)
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        totalNAD: order.totalNAD,
        status: order.status,
        guestEmail: order.guestEmail,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Verification failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
