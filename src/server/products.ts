import 'server-only'
import { connectDb } from '@/lib/db'
import { Product, type ProductDoc } from '@/models/Product'
import type { ProductInput } from '@/lib/validators/product'

export type PublicProduct = {
  id: string
  handle: string
  title: string
  description: string
  collection: string
  categories: string[]
  tags: string[]
  images: { url: string; alt: string; position: number }[]
  variants: Array<{
    sku: string
    size: string
    color: string
    priceNAD: number
    compareAtPriceNAD: number | null
    stock: number
    isActive: boolean
  }>
  defaultVariantSku: string
  minPriceNAD: number
  maxPriceNAD: number
  inStock: boolean
  seo?: { title?: string; description?: string; ogImage?: string }
  status: 'draft' | 'active' | 'archived'
  publishedAt: string | null
}

export type ProductQuery = {
  q?: string
  collection?: string
  sizes?: string[]
  colors?: string[]
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  sort?: 'featured' | 'new' | 'price-asc' | 'price-desc' | 'best-selling'
  page?: number
  pageSize?: number
  status?: 'active' | 'draft' | 'archived' | 'all'
}

function toPublic(doc: ProductDoc): PublicProduct {
  return {
    id: String(doc._id),
    handle: doc.handle,
    title: doc.title,
    description: doc.description ?? '',
    collection: doc.collection ?? '',
    categories: doc.categories ?? [],
    tags: doc.tags ?? [],
    images: (doc.images ?? []).map((i) => ({
      url: i.url,
      alt: i.alt ?? '',
      position: i.position ?? 0,
    })),
    variants: (doc.variants ?? []).map((v) => ({
      sku: v.sku,
      size: v.size,
      color: v.color,
      priceNAD: v.priceNAD,
      compareAtPriceNAD: v.compareAtPriceNAD ?? null,
      stock: v.stock ?? 0,
      isActive: v.isActive ?? true,
    })),
    defaultVariantSku: doc.defaultVariantSku,
    minPriceNAD: doc.minPriceNAD,
    maxPriceNAD: doc.maxPriceNAD,
    inStock: doc.inStock,
    seo: doc.seo ? { title: doc.seo.title ?? undefined, description: doc.seo.description ?? undefined, ogImage: doc.seo.ogImage ?? undefined } : undefined,
    status: doc.status as 'draft' | 'active' | 'archived',
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : null,
  }
}

export async function listProducts(query: ProductQuery = {}): Promise<{
  items: PublicProduct[]
  total: number
  page: number
  pageSize: number
}> {
  await connectDb()

  const {
    q,
    collection,
    sizes,
    colors,
    minPrice,
    maxPrice,
    inStock,
    sort = 'featured',
    page = 1,
    pageSize = 24,
    status = 'active',
  } = query

  const filter: Record<string, unknown> = {}
  if (status !== 'all') filter.status = status
  if (q) filter.$text = { $search: q }
  if (collection) filter.collection = collection
  if (sizes?.length) filter['variants.size'] = { $in: sizes }
  if (colors?.length) filter['variants.color'] = { $in: colors }
  if (inStock) filter['variants.stock'] = { $gt: 0 }
  if (typeof minPrice === 'number' || typeof maxPrice === 'number') {
    const range: Record<string, number> = {}
    if (typeof minPrice === 'number') range.$gte = minPrice
    if (typeof maxPrice === 'number') range.$lte = maxPrice
    filter['variants.priceNAD'] = range
  }

  const sortSpec: Record<string, 1 | -1> =
    sort === 'new'
      ? { publishedAt: -1, createdAt: -1 }
      : sort === 'price-asc'
        ? { 'variants.priceNAD': 1 }
        : sort === 'price-desc'
          ? { 'variants.priceNAD': -1 }
          : sort === 'best-selling'
            ? { 'stats.purchases': -1 }
            : { 'stats.views': -1, createdAt: -1 }

  const skip = (page - 1) * pageSize
  const [docs, total] = await Promise.all([
    Product.find(filter).sort(sortSpec).skip(skip).limit(pageSize).lean<ProductDoc[]>(),
    Product.countDocuments(filter),
  ])

  const hydrated = await Product.find({ _id: { $in: docs.map((d) => d._id) } }).sort(sortSpec)
  return {
    items: hydrated.map((d) => toPublic(d.toObject() as ProductDoc)),
    total,
    page,
    pageSize,
  }
}

export async function getProductByHandle(handle: string): Promise<PublicProduct | null> {
  await connectDb()
  const doc = await Product.findOne({ handle, status: 'active' })
  if (!doc) return null
  return toPublic(doc.toObject() as ProductDoc)
}

export async function getProductById(id: string): Promise<PublicProduct | null> {
  await connectDb()
  if (!id.match(/^[a-f0-9]{24}$/i)) return null
  const doc = await Product.findById(id)
  if (!doc) return null
  return toPublic(doc.toObject() as ProductDoc)
}

export async function createProduct(input: ProductInput): Promise<PublicProduct> {
  await connectDb()
  const doc = await Product.create({
    ...input,
    publishedAt: input.status === 'active' ? (input.publishedAt ?? new Date()) : input.publishedAt,
  })
  return toPublic(doc.toObject() as ProductDoc)
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<PublicProduct | null> {
  await connectDb()
  const patch: Partial<ProductInput> & { publishedAt?: Date } = { ...input }
  if (input.status === 'active' && !input.publishedAt) {
    patch.publishedAt = new Date()
  }
  const doc = await Product.findByIdAndUpdate(id, patch, { new: true, runValidators: true })
  if (!doc) return null
  return toPublic(doc.toObject() as ProductDoc)
}

export async function deleteProduct(id: string): Promise<boolean> {
  await connectDb()
  const res = await Product.findByIdAndDelete(id)
  return !!res
}

export async function listAllHandles(): Promise<string[]> {
  await connectDb()
  const docs = await Product.find({ status: 'active' }, { handle: 1 }).lean<Array<{ handle: string }>>()
  return docs.map((d) => d.handle)
}

export async function getFacets(): Promise<{
  sizes: string[]
  colors: string[]
  collections: string[]
  priceRange: { min: number; max: number }
}> {
  await connectDb()
  const [sizes, colors, collections, priceAgg] = await Promise.all([
    Product.distinct('variants.size', { status: 'active' }),
    Product.distinct('variants.color', { status: 'active' }),
    Product.distinct('collection', { status: 'active' }),
    Product.aggregate<{ _id: null; min: number; max: number }>([
      { $match: { status: 'active' } },
      { $unwind: '$variants' },
      { $match: { 'variants.isActive': true } },
      {
        $group: {
          _id: null,
          min: { $min: '$variants.priceNAD' },
          max: { $max: '$variants.priceNAD' },
        },
      },
    ]),
  ])
  const { min = 0, max = 0 } = priceAgg[0] ?? {}
  return {
    sizes: sizes.filter(Boolean).sort(),
    colors: colors.filter(Boolean).sort(),
    collections: collections.filter(Boolean).sort(),
    priceRange: { min, max },
  }
}
