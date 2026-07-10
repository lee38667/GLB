import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { isAuthorizedAdmin } from '@/lib/admin-auth'
import { SOCIAL_PLATFORMS } from '@/models/SocialAccount'
import {
  connectSocialAccount,
  disconnectSocialAccount,
  listSocialAccounts,
  syncSocialAccount,
} from '@/server/socials'

export const dynamic = 'force-dynamic'

const connectSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  handle: z.string().min(1).max(80),
  externalId: z.string().min(1).max(120),
  accessToken: z.string().min(8).max(4000),
})

const actionSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  action: z.enum(['sync', 'disconnect']),
})

export async function GET(req: NextRequest) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const syncStale = req.nextUrl.searchParams.get('sync') === '1'
  try {
    const accounts = await listSocialAccounts({ syncStale })
    return NextResponse.json({ success: true, data: accounts })
  } catch (error) {
    console.error('GET /api/admin/socials failed', error)
    return NextResponse.json({ error: 'Failed to list social accounts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => null)

  const asAction = actionSchema.safeParse(body)
  if (asAction.success) {
    try {
      if (asAction.data.action === 'disconnect') {
        await disconnectSocialAccount(asAction.data.platform)
        return NextResponse.json({ success: true })
      }
      const account = await syncSocialAccount(asAction.data.platform)
      return NextResponse.json({ success: true, data: account })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Action failed'
      return NextResponse.json({ error: message }, { status: 400 })
    }
  }

  const asConnect = connectSchema.safeParse(body)
  if (!asConnect.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: asConnect.error.flatten() },
      { status: 400 },
    )
  }
  try {
    const account = await connectSocialAccount(asConnect.data)
    return NextResponse.json({ success: true, data: account })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Connection failed'
    return NextResponse.json({ error: `Could not connect: ${message}` }, { status: 400 })
  }
}
