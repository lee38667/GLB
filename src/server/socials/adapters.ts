import 'server-only'
import type { SocialMetrics, SocialPlatform } from '@/models/SocialAccount'

/**
 * Each platform adapter validates a token + handle pair and fetches the
 * current metric set. Adding a platform = adding one adapter here.
 */
export type AdapterInput = {
  handle: string
  externalId: string
  accessToken: string
}

export type SocialAdapter = {
  platform: SocialPlatform
  label: string
  /** Human instructions rendered on the connect card. */
  connectHelp: string[]
  /** What to put in the "Account ID" field. */
  externalIdLabel: string
  fetchMetrics(input: AdapterInput): Promise<SocialMetrics>
}

async function getJson(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, { cache: 'no-store' })
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    const message =
      (json as { error?: { message?: string } }).error?.message ??
      `${res.status} ${res.statusText}`
    throw new Error(message)
  }
  return json
}

const GRAPH = 'https://graph.facebook.com/v21.0'

const instagram: SocialAdapter = {
  platform: 'instagram',
  label: 'Instagram',
  externalIdLabel: 'IG business user ID',
  connectHelp: [
    'Convert the GLB Instagram to a Business/Creator account and link it to a Facebook Page.',
    'Create a Meta app (developers.facebook.com) and generate a long-lived access token with instagram_basic + instagram_manage_insights.',
    'Find the IG user ID via the Graph API explorer: GET me/accounts → page → instagram_business_account.',
  ],
  async fetchMetrics({ externalId, accessToken }) {
    const profile = await getJson(
      `${GRAPH}/${externalId}?fields=followers_count,follows_count,media_count&access_token=${encodeURIComponent(accessToken)}`,
    )
    const metrics: SocialMetrics = {
      followers: Number(profile.followers_count ?? 0),
      following: Number(profile.follows_count ?? 0),
      posts: Number(profile.media_count ?? 0),
    }
    try {
      const insights = (await getJson(
        `${GRAPH}/${externalId}/insights?metric=reach,profile_views&period=days_28&access_token=${encodeURIComponent(accessToken)}`,
      )) as { data?: Array<{ name: string; values?: Array<{ value?: number }> }> }
      for (const m of insights.data ?? []) {
        const value = m.values?.at(-1)?.value ?? 0
        if (m.name === 'reach') metrics.reach28d = value
        if (m.name === 'profile_views') metrics.profileViews28d = value
      }
    } catch {
      // Insights need a Business account with enough activity — profile counts alone are still useful.
    }
    return metrics
  },
}

const facebook: SocialAdapter = {
  platform: 'facebook',
  label: 'Facebook Page',
  externalIdLabel: 'Page ID',
  connectHelp: [
    'Use the same Meta app as Instagram.',
    'Generate a Page access token with pages_read_engagement.',
    'The Page ID is shown in the Page&apos;s About section or via GET me/accounts.',
  ],
  async fetchMetrics({ externalId, accessToken }) {
    const page = await getJson(
      `${GRAPH}/${externalId}?fields=fan_count,followers_count&access_token=${encodeURIComponent(accessToken)}`,
    )
    return {
      followers: Number(page.followers_count ?? page.fan_count ?? 0),
    }
  },
}

const tiktok: SocialAdapter = {
  platform: 'tiktok',
  label: 'TikTok',
  externalIdLabel: 'Open ID (auto-filled if left blank)',
  connectHelp: [
    'Create an app at developers.tiktok.com with the user.info.basic + user.info.stats scopes (Display API).',
    'Complete the OAuth flow once (e.g. via their API explorer) and paste the user access token here.',
  ],
  async fetchMetrics({ accessToken }) {
    const json = (await getJson(
      `https://open.tiktokapis.com/v2/user/info/?fields=follower_count,following_count,video_count,likes_count&access_token=${encodeURIComponent(accessToken)}`,
    )) as { data?: { user?: Record<string, number> } }
    const user = json.data?.user ?? {}
    return {
      followers: Number(user.follower_count ?? 0),
      following: Number(user.following_count ?? 0),
      posts: Number(user.video_count ?? 0),
      engagement28d: Number(user.likes_count ?? 0),
    }
  },
}

export const ADAPTERS: Record<SocialPlatform, SocialAdapter> = {
  instagram,
  facebook,
  tiktok,
}
