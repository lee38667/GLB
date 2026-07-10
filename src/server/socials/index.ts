import 'server-only'
import { connectDb } from '@/lib/db'
import {
  SocialAccount,
  SocialSnapshot,
  type SocialAccountDoc,
  type SocialMetrics,
  type SocialPlatform,
  SOCIAL_PLATFORMS,
} from '@/models/SocialAccount'
import { ADAPTERS } from './adapters'

const STALE_AFTER_MS = 6 * 3600 * 1000

export type PublicSocialAccount = {
  platform: SocialPlatform
  label: string
  connected: boolean
  handle: string | null
  status: string
  lastSyncedAt: string | null
  lastError: string | null
  latest: SocialMetrics | null
  history: Array<{ capturedAt: string; followers: number }>
  connectHelp: string[]
  externalIdLabel: string
}

function toPublic(
  platform: SocialPlatform,
  doc: SocialAccountDoc | null,
  history: Array<{ capturedAt: Date; metrics: SocialMetrics }> = [],
): PublicSocialAccount {
  const adapter = ADAPTERS[platform]
  return {
    platform,
    label: adapter.label,
    connected: !!doc && doc.status !== 'disconnected',
    handle: doc?.handle ?? null,
    status: doc?.status ?? 'disconnected',
    lastSyncedAt: doc?.lastSyncedAt ? new Date(doc.lastSyncedAt).toISOString() : null,
    lastError: doc?.lastError ?? null,
    latest: doc?.latest ?? null,
    history: history.map((h) => ({
      capturedAt: new Date(h.capturedAt).toISOString(),
      followers: h.metrics.followers ?? 0,
    })),
    connectHelp: adapter.connectHelp,
    externalIdLabel: adapter.externalIdLabel,
  }
}

async function syncAccount(doc: SocialAccountDoc): Promise<SocialAccountDoc> {
  const adapter = ADAPTERS[doc.platform as SocialPlatform]
  try {
    const metrics = await adapter.fetchMetrics({
      handle: doc.handle,
      externalId: doc.externalId,
      accessToken: doc.accessToken,
    })
    await SocialSnapshot.create({
      accountId: doc._id,
      platform: doc.platform,
      capturedAt: new Date(),
      metrics,
    })
    const updated = await SocialAccount.findByIdAndUpdate(
      doc._id,
      { latest: metrics, status: 'connected', lastSyncedAt: new Date(), lastError: null },
      { new: true },
    )
    return (updated ?? doc) as SocialAccountDoc
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed'
    const updated = await SocialAccount.findByIdAndUpdate(
      doc._id,
      { status: 'error', lastError: message },
      { new: true },
    )
    return (updated ?? doc) as SocialAccountDoc
  }
}

export async function listSocialAccounts(options?: {
  syncStale?: boolean
}): Promise<PublicSocialAccount[]> {
  await connectDb()
  const docs = await SocialAccount.find({})

  const results: PublicSocialAccount[] = []
  for (const platform of SOCIAL_PLATFORMS) {
    let doc = (docs.find((d) => d.platform === platform) ?? null) as SocialAccountDoc | null
    if (
      doc &&
      doc.status !== 'disconnected' &&
      options?.syncStale &&
      (!doc.lastSyncedAt || Date.now() - new Date(doc.lastSyncedAt).getTime() > STALE_AFTER_MS)
    ) {
      doc = await syncAccount(doc)
    }
    const history = doc
      ? await SocialSnapshot.find({ accountId: doc._id })
          .sort({ capturedAt: -1 })
          .limit(60)
          .lean<Array<{ capturedAt: Date; metrics: SocialMetrics }>>()
      : []
    results.push(toPublic(platform, doc, history.reverse()))
  }
  return results
}

export async function connectSocialAccount(input: {
  platform: SocialPlatform
  handle: string
  externalId: string
  accessToken: string
}): Promise<PublicSocialAccount> {
  await connectDb()
  const adapter = ADAPTERS[input.platform]

  // Validate immediately — a connect that can't fetch is an error the operator
  // should see now, not on the next page load.
  const metrics = await adapter.fetchMetrics({
    handle: input.handle,
    externalId: input.externalId,
    accessToken: input.accessToken,
  })

  const doc = (await SocialAccount.findOneAndUpdate(
    { platform: input.platform },
    {
      ...input,
      status: 'connected',
      lastSyncedAt: new Date(),
      lastError: null,
      latest: metrics,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )) as SocialAccountDoc

  await SocialSnapshot.create({
    accountId: doc._id,
    platform: doc.platform,
    capturedAt: new Date(),
    metrics,
  })

  return toPublic(input.platform, doc, [{ capturedAt: new Date(), metrics }])
}

export async function syncSocialAccount(platform: SocialPlatform): Promise<PublicSocialAccount> {
  await connectDb()
  const doc = (await SocialAccount.findOne({ platform })) as SocialAccountDoc | null
  if (!doc || doc.status === 'disconnected') {
    throw new Error(`${platform} is not connected`)
  }
  const updated = await syncAccount(doc)
  const history = await SocialSnapshot.find({ accountId: updated._id })
    .sort({ capturedAt: -1 })
    .limit(60)
    .lean<Array<{ capturedAt: Date; metrics: SocialMetrics }>>()
  return toPublic(platform, updated, history.reverse())
}

export async function disconnectSocialAccount(platform: SocialPlatform): Promise<void> {
  await connectDb()
  await SocialAccount.findOneAndUpdate(
    { platform },
    { status: 'disconnected', accessToken: 'revoked', lastError: null },
  )
}
