import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://giveloveback.netlify.app'
  const now = new Date()

  const staticPaths: Array<{ path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }> = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/shop', priority: 0.9, changeFrequency: 'daily' },
    { path: '/collections', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/events', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/gallery', priority: 0.5, changeFrequency: 'weekly' },
    { path: '/contact', priority: 0.4, changeFrequency: 'monthly' },
  ]

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))

  // Dynamic product + collection entries wired in Phase 1 once the Product model lands.
  return staticEntries
}
