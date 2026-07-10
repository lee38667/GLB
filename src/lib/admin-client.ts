/** Headers for calls from admin pages to /api/admin/* routes. */
export function adminHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {}
  const key = window.localStorage.getItem('glb_admin_key') ?? ''
  return key ? { 'x-admin-key': key, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}
