'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { ADMIN_NAV, SITE } from '@/lib/constants'
import { cn } from '@/lib/cn'

type AdminShellProps = {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

const NAV_GROUPS: Array<{ label: string; hrefs: string[] }> = [
  { label: 'Pulse', hrefs: ['/admin'] },
  { label: 'Commerce', hrefs: ['/admin/orders', '/admin/products', '/admin/customers', '/admin/finance'] },
  { label: 'Marketing', hrefs: ['/admin/socials', '/admin/email'] },
  { label: 'Community', hrefs: ['/admin/events', '/admin/rsvp'] },
]

export function AdminShell({ title, description, actions, children }: AdminShellProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const nav = (
    <nav className="flex flex-col gap-6">
      {NAV_GROUPS.map((group) => {
        const items = ADMIN_NAV.filter((i) => group.hrefs.includes(i.href))
        if (!items.length) return null
        return (
          <div key={group.label}>
            <p className="mb-2 font-mono text-[0.58rem] uppercase tracking-[0.28em] text-vermillion">
              {group.label}
            </p>
            <div className="flex flex-col">
              {items.map((item) => {
                const active =
                  item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'border-l-2 px-3 py-2 text-sm transition',
                      active
                        ? 'border-ink bg-ink text-paper'
                        : 'border-hairline text-graphite hover:border-ink hover:text-ink',
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex w-full max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-8 overflow-y-auto border-r border-ink bg-paper-warm px-5 py-8 lg:flex">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display text-lg uppercase tracking-wide">{SITE.shortName}</span>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-vermillion">
              Admin
            </span>
          </Link>
          {nav}
          <p className="mt-auto font-mono text-[0.55rem] uppercase tracking-[0.2em] text-graphite">
            {SITE.name}
          </p>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-ink bg-paper/90 px-6 py-5 backdrop-blur lg:px-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-vermillion">
                  GLB Admin
                </p>
                <h1 className="mt-1 font-display text-2xl uppercase tracking-wide sm:text-3xl">
                  {title}
                </h1>
                {description && (
                  <p className="mt-2 max-w-2xl text-sm text-graphite">{description}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {actions}
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="border border-ink px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] lg:hidden"
                >
                  Menu
                </button>
              </div>
            </div>
            {menuOpen && (
              <div className="mt-5 border border-ink bg-paper-warm p-5 lg:hidden">{nav}</div>
            )}
          </header>
          <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  )
}
