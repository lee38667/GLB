'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { ADMIN_NAV, SITE } from '@/lib/constants'
import { cn } from '@/lib/cn'

type AdminShellProps = {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function AdminShell({ title, description, actions, children }: AdminShellProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-ink text-sand">
      <div className="mx-auto flex w-full max-w-[1440px] gap-0">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/10 bg-ink-900/50 px-5 py-8 lg:block">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-lg uppercase tracking-wide">{SITE.shortName}</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] text-tide">Admin</span>
          </Link>
          <nav className="mt-10 flex flex-col gap-1">
            {ADMIN_NAV.map((item) => {
              const active =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm transition',
                    active
                      ? 'bg-ivory text-ink'
                      : 'text-clay hover:bg-white/5 hover:text-sand',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-white/10 bg-ink/80 px-6 py-6 backdrop-blur lg:px-10">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-tide">GLB Admin</p>
              <h1 className="mt-1 font-display text-2xl uppercase tracking-wide sm:text-3xl">
                {title}
              </h1>
              {description && <p className="mt-2 max-w-2xl text-sm text-clay">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
          </header>
          <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  )
}
