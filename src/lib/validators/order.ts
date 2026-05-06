import { z } from 'zod'
import { ORDER_STATUSES } from '@/lib/constants'

export const addressSchema = z.object({
  name: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  region: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().length(2),
  phone: z.string().min(6),
})

export const lineItemSchema = z.object({
  productId: z.string(),
  variantSku: z.string(),
  title: z.string(),
  priceNAD: z.number().nonnegative(),
  qty: z.number().int().positive(),
  image: z.string().url().optional(),
})

export const orderSchema = z.object({
  orderNumber: z.string(),
  userId: z.string().nullable().optional(),
  guestEmail: z.string().email().nullable().optional(),
  lineItems: z.array(lineItemSchema).min(1),
  subtotalNAD: z.number().nonnegative(),
  shippingNAD: z.number().nonnegative().default(0),
  taxNAD: z.number().nonnegative().default(0),
  totalNAD: z.number().nonnegative(),
  currency: z.literal('NAD').default('NAD'),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  status: z.enum(ORDER_STATUSES).default('pending'),
  paymentProvider: z.literal('paystack').default('paystack'),
  paymentReference: z.string().optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
})

export type Address = z.infer<typeof addressSchema>
export type LineItem = z.infer<typeof lineItemSchema>
export type OrderInput = z.infer<typeof orderSchema>
