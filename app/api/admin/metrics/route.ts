import { NextResponse, type NextRequest } from 'next/server'
import { isAuthorizedAdmin } from '@/lib/admin-auth'
import {
  getOverviewMetrics,
  getRevenueSeries,
  getFinanceBreakdown,
  getCustomers,
} from '@/server/metrics'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const scope = req.nextUrl.searchParams.get('scope') ?? 'overview'
  const days = Math.min(Number(req.nextUrl.searchParams.get('days') ?? 30) || 30, 365)

  try {
    switch (scope) {
      case 'overview': {
        const [overview, series] = await Promise.all([getOverviewMetrics(), getRevenueSeries(days)])
        return NextResponse.json({ success: true, data: { overview, series } })
      }
      case 'finance': {
        const [overview, series, breakdown] = await Promise.all([
          getOverviewMetrics(),
          getRevenueSeries(days),
          getFinanceBreakdown(),
        ])
        return NextResponse.json({ success: true, data: { overview, series, breakdown } })
      }
      case 'customers': {
        const customers = await getCustomers()
        return NextResponse.json({ success: true, data: customers })
      }
      default:
        return NextResponse.json({ error: `Unknown scope "${scope}"` }, { status: 400 })
    }
  } catch (error) {
    console.error(`GET /api/admin/metrics?scope=${scope} failed`, error)
    return NextResponse.json({ error: 'Failed to load metrics' }, { status: 500 })
  }
}
