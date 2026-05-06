import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Give Love Back',
    short_name: 'GLB',
    description:
      'Community-first clothing brand creating pieces that carry care, connection, and self-expression.',
    start_url: '/',
    display: 'standalone',
    background_color: '#080808',
    theme_color: '#080808',
    icons: [
      { src: '/assets/logo.png', sizes: '512x512', type: 'image/png' },
      { src: '/assets/logo.png', sizes: '192x192', type: 'image/png' },
    ],
  }
}
