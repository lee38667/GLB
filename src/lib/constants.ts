export const SITE = {
  name: 'Give Love Back',
  shortName: 'GLB',
  tagline: 'Fashion as an act of care',
  description:
    'Community-first clothing brand creating pieces that carry care, connection, and self-expression.',
  email: 'hello@giveloveback.com',
  currency: 'NAD',
  locale: 'en-NA',
  countries: ['NA', 'ZA'],
} as const

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/collections', label: 'Collections' },
  { href: '/about', label: 'About' },
  { href: '/events', label: 'Events' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
] as const

export const ADMIN_NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/inventory', label: 'Inventory' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/finance', label: 'Finance' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/rsvp', label: 'RSVPs' },
  { href: '/admin/email', label: 'Email' },
] as const

export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const
export type Size = (typeof SIZE_OPTIONS)[number]

export const ORDER_STATUSES = [
  'pending',
  'paid',
  'fulfilled',
  'shipped',
  'delivered',
  'refunded',
  'cancelled',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const PRODUCT_STATUSES = ['draft', 'active', 'archived'] as const
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]
