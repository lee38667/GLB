import { z } from 'zod'

export const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  alt: z.string().default(''),
  position: z.number().int().min(0).default(0),
})

export const variantSchema = z.object({
  sku: z.string().min(1),
  size: z.string().min(1),
  color: z.string().min(1),
  priceNAD: z.number().nonnegative(),
  compareAtPriceNAD: z.number().nonnegative().nullable().optional(),
  stock: z.number().int().min(0).default(0),
  weightGrams: z.number().nonnegative().optional(),
  barcode: z.string().optional(),
  isActive: z.boolean().default(true),
})

export const productSchema = z.object({
  handle: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'lowercase letters, numbers, hyphens only'),
  title: z.string().min(1).max(140),
  description: z.string().default(''),
  collection: z.string().default(''),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  images: z.array(imageSchema).default([]),
  variants: z.array(variantSchema).min(1, 'At least one variant required'),
  defaultVariantSku: z.string().min(1),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  seo: z
    .object({
      title: z.string().max(70).optional(),
      description: z.string().max(200).optional(),
      ogImage: z.string().url().optional(),
    })
    .optional(),
  publishedAt: z.coerce.date().optional(),
})

export type ProductInput = z.infer<typeof productSchema>
export type VariantInput = z.infer<typeof variantSchema>
export type ImageInput = z.infer<typeof imageSchema>
