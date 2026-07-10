'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/** Admin routes bring their own shell — hide the public site chrome there. */
export function HideOnAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return <>{children}</>
}
