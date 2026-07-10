import 'server-only'
import { connectDb } from '@/lib/db'
import { Order } from '@/models/Order'
import { Product } from '@/models/Product'

/** Statuses whose money we count as realized revenue. */
const REVENUE_STATUSES = ['paid', 'fulfilled', 'shipped', 'delivered']

export type OverviewMetrics = {
  revenueNAD: number
  revenue30dNAD: number
  orders: { total: number; pending: number; paid: number; fulfilled: number; refunded: number }
  aovNAD: number
  unitsSold: number
  activeProducts: number
  lowStock: Array<{ productTitle: string; sku: string; stock: number }>
  customers: number
}

export async function getOverviewMetrics(): Promise<OverviewMetrics> {
  await connectDb()
  const since30d = new Date(Date.now() - 30 * 24 * 3600 * 1000)

  const [revenueAgg, revenue30dAgg, statusCounts, unitsAgg, activeProducts, lowStockAgg, customerAgg] =
    await Promise.all([
      Order.aggregate([
        { $match: { status: { $in: REVENUE_STATUSES } } },
        { $group: { _id: null, total: { $sum: '$totalNAD' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { status: { $in: REVENUE_STATUSES }, createdAt: { $gte: since30d } } },
        { $group: { _id: null, total: { $sum: '$totalNAD' } } },
      ]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { status: { $in: REVENUE_STATUSES } } },
        { $unwind: '$lineItems' },
        { $group: { _id: null, units: { $sum: '$lineItems.qty' } } },
      ]),
      Product.countDocuments({ status: 'active' }),
      Product.aggregate([
        { $match: { status: 'active' } },
        { $unwind: '$variants' },
        { $match: { 'variants.isActive': true, 'variants.stock': { $lte: 3 } } },
        { $project: { productTitle: '$title', sku: '$variants.sku', stock: '$variants.stock' } },
        { $sort: { stock: 1 } },
        { $limit: 8 },
      ]),
      Order.aggregate([
        { $project: { customer: { $ifNull: ['$userId', '$guestEmail'] } } },
        { $match: { customer: { $ne: null } } },
        { $group: { _id: '$customer' } },
        { $count: 'total' },
      ]),
    ])

  const byStatus = Object.fromEntries(statusCounts.map((s) => [s._id, s.count])) as Record<string, number>
  const revenueNAD = revenueAgg[0]?.total ?? 0
  const revenueOrderCount = revenueAgg[0]?.count ?? 0
  const totalOrders = statusCounts.reduce((sum, s) => sum + s.count, 0)

  return {
    revenueNAD,
    revenue30dNAD: revenue30dAgg[0]?.total ?? 0,
    orders: {
      total: totalOrders,
      pending: byStatus.pending ?? 0,
      paid: byStatus.paid ?? 0,
      fulfilled: (byStatus.fulfilled ?? 0) + (byStatus.shipped ?? 0) + (byStatus.delivered ?? 0),
      refunded: byStatus.refunded ?? 0,
    },
    aovNAD: revenueOrderCount ? Math.round(revenueNAD / revenueOrderCount) : 0,
    unitsSold: unitsAgg[0]?.units ?? 0,
    activeProducts,
    lowStock: lowStockAgg,
    customers: customerAgg[0]?.total ?? 0,
  }
}

export type RevenuePoint = { date: string; revenueNAD: number; orders: number }

export async function getRevenueSeries(days = 30): Promise<RevenuePoint[]> {
  await connectDb()
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setDate(since.getDate() - (days - 1))

  const rows = await Order.aggregate([
    { $match: { status: { $in: REVENUE_STATUSES }, createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenueNAD: { $sum: '$totalNAD' },
        orders: { $sum: 1 },
      },
    },
  ])
  const byDate = new Map(rows.map((r) => [r._id, r]))

  const series: RevenuePoint[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date(since)
    d.setDate(since.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    const row = byDate.get(key)
    series.push({ date: key, revenueNAD: row?.revenueNAD ?? 0, orders: row?.orders ?? 0 })
  }
  return series
}

export type FinanceBreakdown = {
  byProduct: Array<{ title: string; unitsSold: number; revenueNAD: number }>
  byCollection: Array<{ collection: string; unitsSold: number; revenueNAD: number }>
  refundedNAD: number
  refundedCount: number
  shippingCollectedNAD: number
  pendingValueNAD: number
}

export async function getFinanceBreakdown(): Promise<FinanceBreakdown> {
  await connectDb()

  const [byProductAgg, refundAgg, shippingAgg, pendingAgg] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $in: REVENUE_STATUSES } } },
      { $unwind: '$lineItems' },
      {
        $group: {
          _id: '$lineItems.productId',
          title: { $first: '$lineItems.title' },
          unitsSold: { $sum: '$lineItems.qty' },
          revenueNAD: { $sum: { $multiply: ['$lineItems.priceNAD', '$lineItems.qty'] } },
        },
      },
      { $sort: { revenueNAD: -1 } },
    ]),
    Order.aggregate([
      { $match: { status: 'refunded' } },
      { $group: { _id: null, total: { $sum: '$totalNAD' }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { status: { $in: REVENUE_STATUSES } } },
      { $group: { _id: null, total: { $sum: '$shippingNAD' } } },
    ]),
    Order.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$totalNAD' } } },
    ]),
  ])

  // Map product ids -> collection for the collection rollup. Line items carry
  // "Title — Size / Color" so we resolve via productId, not the title string.
  const productIds = byProductAgg.map((r) => r._id).filter((id) => /^[a-f0-9]{24}$/i.test(String(id)))
  const products = await Product.find({ _id: { $in: productIds } })
    .select('collection title')
    .lean<Array<{ _id: unknown; collection?: string; title: string }>>()
  const collectionById = new Map(products.map((p) => [String(p._id), p.collection || 'Uncategorised']))

  const collectionTotals = new Map<string, { unitsSold: number; revenueNAD: number }>()
  for (const row of byProductAgg) {
    const collection = collectionById.get(String(row._id)) ?? 'Uncategorised'
    const acc = collectionTotals.get(collection) ?? { unitsSold: 0, revenueNAD: 0 }
    acc.unitsSold += row.unitsSold
    acc.revenueNAD += row.revenueNAD
    collectionTotals.set(collection, acc)
  }

  return {
    byProduct: byProductAgg.map((r) => ({
      title: r.title,
      unitsSold: r.unitsSold,
      revenueNAD: r.revenueNAD,
    })),
    byCollection: [...collectionTotals.entries()]
      .map(([collection, v]) => ({ collection, ...v }))
      .sort((a, b) => b.revenueNAD - a.revenueNAD),
    refundedNAD: refundAgg[0]?.total ?? 0,
    refundedCount: refundAgg[0]?.count ?? 0,
    shippingCollectedNAD: shippingAgg[0]?.total ?? 0,
    pendingValueNAD: pendingAgg[0]?.total ?? 0,
  }
}

export type CustomerRow = {
  customer: string
  email: string | null
  orders: number
  lifetimeNAD: number
  firstOrderAt: string
  lastOrderAt: string
  lastStatus: string
  city: string | null
}

export type CustomersReport = {
  items: CustomerRow[]
  total: number
  repeatRate: number
  avgLifetimeNAD: number
}

export async function getCustomers(limit = 100): Promise<CustomersReport> {
  await connectDb()

  const rows = await Order.aggregate([
    { $addFields: { customer: { $ifNull: ['$userId', '$guestEmail'] } } },
    { $match: { customer: { $ne: null } } },
    { $sort: { createdAt: 1 } },
    {
      $group: {
        _id: '$customer',
        email: { $last: '$guestEmail' },
        orders: { $sum: 1 },
        lifetimeNAD: {
          $sum: {
            $cond: [{ $in: ['$status', REVENUE_STATUSES] }, '$totalNAD', 0],
          },
        },
        firstOrderAt: { $first: '$createdAt' },
        lastOrderAt: { $last: '$createdAt' },
        lastStatus: { $last: '$status' },
        city: { $last: '$shippingAddress.city' },
      },
    },
    { $sort: { lifetimeNAD: -1, lastOrderAt: -1 } },
    { $limit: limit },
  ])

  const total = rows.length
  const repeatCount = rows.filter((r) => r.orders > 1).length
  const lifetimeSum = rows.reduce((sum, r) => sum + r.lifetimeNAD, 0)

  return {
    items: rows.map((r) => ({
      customer: String(r._id),
      email: r.email ?? null,
      orders: r.orders,
      lifetimeNAD: r.lifetimeNAD,
      firstOrderAt: new Date(r.firstOrderAt).toISOString(),
      lastOrderAt: new Date(r.lastOrderAt).toISOString(),
      lastStatus: r.lastStatus,
      city: r.city ?? null,
    })),
    total,
    repeatRate: total ? Math.round((repeatCount / total) * 100) : 0,
    avgLifetimeNAD: total ? Math.round(lifetimeSum / total) : 0,
  }
}
