import 'server-only'
import crypto from 'node:crypto'
import { connectDb } from '@/lib/db'
import { Order, type OrderDoc } from '@/models/Order'
import { Product } from '@/models/Product'
import type { CheckoutInput } from '@/lib/validators/checkout'

export type PublicOrder = {
  id: string
  orderNumber: string
  userId: string | null
  guestEmail: string | null
  lineItems: Array<{
    productId: string
    variantSku: string
    title: string
    priceNAD: number
    qty: number
    image?: string
  }>
  subtotalNAD: number
  shippingNAD: number
  taxNAD: number
  totalNAD: number
  currency: string
  shippingAddress: {
    name: string
    line1: string
    line2?: string
    city: string
    region: string
    postalCode: string
    country: string
    phone: string
  }
  billingAddress?: PublicOrder['shippingAddress']
  status: string
  paymentProvider: string
  paymentReference?: string
  paidAt: string | null
  trackingNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

function toPublic(doc: OrderDoc): PublicOrder {
  const o = doc as OrderDoc & { _id: { toString(): string }; createdAt: Date; updatedAt: Date }
  return {
    id: String(o._id),
    orderNumber: o.orderNumber,
    userId: o.userId ?? null,
    guestEmail: o.guestEmail ?? null,
    lineItems: (o.lineItems ?? []).map((li) => ({
      productId: li.productId,
      variantSku: li.variantSku,
      title: li.title,
      priceNAD: li.priceNAD,
      qty: li.qty,
      image: li.image ?? undefined,
    })),
    subtotalNAD: o.subtotalNAD,
    shippingNAD: o.shippingNAD ?? 0,
    taxNAD: o.taxNAD ?? 0,
    totalNAD: o.totalNAD,
    currency: o.currency ?? 'NAD',
    shippingAddress: {
      name: o.shippingAddress.name,
      line1: o.shippingAddress.line1,
      line2: o.shippingAddress.line2 ?? undefined,
      city: o.shippingAddress.city,
      region: o.shippingAddress.region,
      postalCode: o.shippingAddress.postalCode,
      country: o.shippingAddress.country,
      phone: o.shippingAddress.phone,
    },
    billingAddress: o.billingAddress
      ? {
          name: o.billingAddress.name,
          line1: o.billingAddress.line1,
          line2: o.billingAddress.line2 ?? undefined,
          city: o.billingAddress.city,
          region: o.billingAddress.region,
          postalCode: o.billingAddress.postalCode,
          country: o.billingAddress.country,
          phone: o.billingAddress.phone,
        }
      : undefined,
    status: o.status ?? 'pending',
    paymentProvider: o.paymentProvider ?? 'paystack',
    paymentReference: o.paymentReference ?? undefined,
    paidAt: o.paidAt ? new Date(o.paidAt).toISOString() : null,
    trackingNumber: o.trackingNumber ?? undefined,
    notes: o.notes ?? undefined,
    createdAt: new Date(o.createdAt).toISOString(),
    updatedAt: new Date(o.updatedAt).toISOString(),
  }
}

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `GLB-${ts}-${rand}`
}

type CartItem = { productId: string; variantSku: string; qty: number }

export async function createOrder(
  items: CartItem[],
  checkout: CheckoutInput,
  userId?: string,
): Promise<PublicOrder> {
  await connectDb()

  const productIds = [...new Set(items.map((i) => i.productId))]
  const products = await Product.find({ _id: { $in: productIds } })
  const productMap = new Map(products.map((p) => [String(p._id), p]))

  const lineItems = items.map((item) => {
    const product = productMap.get(item.productId)
    if (!product) throw new Error(`Product ${item.productId} not found`)

    const variant = product.variants.find((v) => v.sku === item.variantSku)
    if (!variant) throw new Error(`Variant ${item.variantSku} not found`)
    if (!variant.isActive) throw new Error(`Variant ${item.variantSku} is not active`)
    if (variant.stock < item.qty) {
      throw new Error(`Insufficient stock for ${item.variantSku}: ${variant.stock} available`)
    }

    const image = product.images?.[0]?.url

    return {
      productId: item.productId,
      variantSku: item.variantSku,
      title: `${product.title} — ${variant.size} / ${variant.color}`,
      priceNAD: variant.priceNAD,
      qty: item.qty,
      image,
    }
  })

  const subtotalNAD = lineItems.reduce((sum, li) => sum + li.priceNAD * li.qty, 0)
  const shippingNAD = checkout.shippingMethod === 'express' ? 150 : 0
  const totalNAD = subtotalNAD + shippingNAD

  const doc = await Order.create({
    orderNumber: generateOrderNumber(),
    userId: userId ?? null,
    guestEmail: checkout.email,
    lineItems,
    subtotalNAD,
    shippingNAD,
    taxNAD: 0,
    totalNAD,
    currency: 'NAD',
    shippingAddress: checkout.shippingAddress,
    billingAddress: checkout.billingAddress,
    status: 'pending',
    paymentProvider: 'paystack',
    notes: checkout.notes,
  })

  return toPublic(doc.toObject() as OrderDoc)
}

export async function getOrderById(id: string): Promise<PublicOrder | null> {
  await connectDb()
  if (!id.match(/^[a-f0-9]{24}$/i)) return null
  const doc = await Order.findById(id)
  if (!doc) return null
  return toPublic(doc.toObject() as OrderDoc)
}

export async function getOrderByReference(reference: string): Promise<PublicOrder | null> {
  await connectDb()
  const doc = await Order.findOne({ paymentReference: reference })
  if (!doc) return null
  return toPublic(doc.toObject() as OrderDoc)
}

export async function getOrderByNumber(orderNumber: string): Promise<PublicOrder | null> {
  await connectDb()
  const doc = await Order.findOne({ orderNumber })
  if (!doc) return null
  return toPublic(doc.toObject() as OrderDoc)
}

export async function updateOrderStatus(
  id: string,
  status: string,
  extra?: { paymentReference?: string; paidAt?: Date; trackingNumber?: string },
): Promise<PublicOrder | null> {
  await connectDb()
  const update: Record<string, unknown> = { status, ...extra }
  const doc = await Order.findByIdAndUpdate(id, update, { new: true, runValidators: true })
  if (!doc) return null
  return toPublic(doc.toObject() as OrderDoc)
}

export async function markOrderPaid(
  paymentReference: string,
): Promise<PublicOrder | null> {
  await connectDb()
  const doc = await Order.findOneAndUpdate(
    { paymentReference, status: 'pending' },
    { status: 'paid', paidAt: new Date() },
    { new: true },
  )
  if (!doc) return null

  for (const li of doc.lineItems) {
    await Product.updateOne(
      { _id: li.productId, 'variants.sku': li.variantSku },
      { $inc: { 'variants.$.stock': -li.qty, 'stats.purchases': li.qty } },
    )
  }

  return toPublic(doc.toObject() as OrderDoc)
}

export async function listOrders(query: {
  userId?: string
  email?: string
  status?: string
  page?: number
  pageSize?: number
}): Promise<{ items: PublicOrder[]; total: number; page: number; pageSize: number }> {
  await connectDb()

  const { userId, email, status, page = 1, pageSize = 20 } = query
  const filter: Record<string, unknown> = {}
  if (userId) filter.userId = userId
  if (email) filter.guestEmail = email
  if (status && status !== 'all') filter.status = status

  const skip = (page - 1) * pageSize
  const [docs, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean<OrderDoc[]>(),
    Order.countDocuments(filter),
  ])

  return {
    items: docs.map((d) => toPublic(d as OrderDoc)),
    total,
    page,
    pageSize,
  }
}
