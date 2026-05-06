import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { checkoutSchema } from '@/lib/validators/checkout'
import { createOrder } from '@/server/orders'
import { initTransaction, newReference } from '@/lib/paystack'

const cartItemSchema = z.object({
  productId: z.string().min(1),
  variantSku: z.string().min(1),
  qty: z.number().int().positive(),
})

const requestSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  checkout: checkoutSchema,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid checkout data', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { items, checkout } = parsed.data
    const order = await createOrder(items, checkout)

    const reference = newReference('ORD')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const { updateOrderStatus } = await import('@/server/orders')
    await updateOrderStatus(order.id, 'pending', { paymentReference: reference })

    const amountKobo = Math.round(order.totalNAD * 100)

    const paystack = await initTransaction({
      email: checkout.email,
      amountKobo,
      currency: (process.env.PAYSTACK_CURRENCY as 'ZAR') ?? 'ZAR',
      reference,
      callbackUrl: `${appUrl}/checkout/success?reference=${reference}`,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        reference,
        authorizationUrl: paystack.authorization_url,
        accessCode: paystack.access_code,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed'
    const status = message.includes('not found') || message.includes('Insufficient') ? 400 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
