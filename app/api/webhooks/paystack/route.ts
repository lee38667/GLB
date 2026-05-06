import { NextResponse, type NextRequest } from 'next/server'
import { verifyWebhookSignature } from '@/lib/paystack'
import { markOrderPaid } from '@/server/orders'
import { sendOrderConfirmation } from '@/lib/email/order-confirmation'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-paystack-signature')

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody) as {
    event: string
    data: { reference: string; status: string }
  }

  if (event.event === 'charge.success' && event.data.status === 'success') {
    const order = await markOrderPaid(event.data.reference)
    if (order) {
      sendOrderConfirmation(order).catch((err) =>
        console.error('Failed to send order confirmation email:', err),
      )
    }
  }

  return NextResponse.json({ received: true })
}
