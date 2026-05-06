import { z } from 'zod'
import { addressSchema } from './order'

export const checkoutSchema = z.object({
  email: z.string().email(),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  shippingMethod: z.enum(['standard', 'express']).default('standard'),
  promoCode: z.string().optional(),
  notes: z.string().max(500).optional(),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
