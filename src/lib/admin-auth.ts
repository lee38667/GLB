import { headers } from 'next/headers'

/**
 * Legacy API key gate used by the existing admin endpoints (events/rsvp/email).
 * Phase 4 replaces this with Auth.js role checks, but we keep it working for now.
 */
export async function isAuthorizedAdmin(): Promise<boolean> {
  const expected = process.env.ADMIN_API_KEY
  if (!expected) return process.env.NODE_ENV !== 'production'
  const hdrs = await headers()
  const key =
    hdrs.get('x-admin-key') ??
    hdrs.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    ''
  return key === expected
}
