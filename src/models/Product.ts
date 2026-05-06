import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'

const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    alt: { type: String, default: '' },
    position: { type: Number, default: 0 },
  },
  { _id: false },
)

const VariantSchema = new Schema(
  {
    sku: { type: String, required: true, trim: true },
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    priceNAD: { type: Number, required: true, min: 0 },
    compareAtPriceNAD: { type: Number, min: 0, default: null },
    stock: { type: Number, default: 0, min: 0 },
    weightGrams: { type: Number, min: 0 },
    barcode: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { _id: false },
)

const SeoSchema = new Schema(
  {
    title: { type: String, maxlength: 70 },
    description: { type: String, maxlength: 200 },
    ogImage: { type: String },
  },
  { _id: false },
)

const StatsSchema = new Schema(
  {
    views: { type: Number, default: 0 },
    addsToCart: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
  },
  { _id: false },
)

const ProductSchema = new Schema(
  {
    handle: {
      type: String,
      required: [true, 'Handle is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Handle must be lowercase alphanumeric with hyphens only'],
    },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, default: '' },
    collection: { type: String, default: '', index: true },
    categories: { type: [String], default: [] },
    tags: { type: [String], default: [] },

    images: { type: [ImageSchema], default: [] },
    variants: {
      type: [VariantSchema],
      validate: [
        (v: unknown[]) => Array.isArray(v) && v.length > 0,
        'At least one variant is required',
      ],
    },
    defaultVariantSku: { type: String, required: true },

    seo: { type: SeoSchema, default: () => ({}) },
    stats: { type: StatsSchema, default: () => ({}) },

    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: { type: Date },
  },
  { timestamps: true },
)

ProductSchema.index({ status: 1, publishedAt: -1 })
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' })
ProductSchema.index({ 'variants.sku': 1 })

ProductSchema.virtual('minPriceNAD').get(function () {
  const doc = this as unknown as { variants: { priceNAD: number; isActive: boolean }[] }
  const active = doc.variants.filter((v) => v.isActive)
  if (!active.length) return 0
  return Math.min(...active.map((v) => v.priceNAD))
})

ProductSchema.virtual('maxPriceNAD').get(function () {
  const doc = this as unknown as { variants: { priceNAD: number; isActive: boolean }[] }
  const active = doc.variants.filter((v) => v.isActive)
  if (!active.length) return 0
  return Math.max(...active.map((v) => v.priceNAD))
})

ProductSchema.virtual('inStock').get(function () {
  const doc = this as unknown as { variants: { stock: number; isActive: boolean }[] }
  return doc.variants.some((v) => v.isActive && v.stock > 0)
})

ProductSchema.set('toJSON', { virtuals: true })
ProductSchema.set('toObject', { virtuals: true })

export type ProductDoc = InferSchemaType<typeof ProductSchema> & {
  _id: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  minPriceNAD: number
  maxPriceNAD: number
  inStock: boolean
}

type ProductModel = Model<ProductDoc>

const globalForProduct = global as unknown as { __ProductModel?: ProductModel }

export const Product: ProductModel =
  globalForProduct.__ProductModel ??
  ((mongoose.models.Product as ProductModel | undefined) ??
    mongoose.model<ProductDoc>('Product', ProductSchema))

if (process.env.NODE_ENV !== 'production') {
  globalForProduct.__ProductModel = Product
}

export default Product
