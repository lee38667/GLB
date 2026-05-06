import Link from 'next/link'
import { cn } from '@/lib/cn'

export type Crumb = { href?: string; label: string }

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('font-mono text-[0.62rem] uppercase tracking-[0.22em]', className)}
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-graphite">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="transition hover:text-vermillion">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={isLast ? 'text-ink' : ''}
                >
                  {item.label}
                </span>
              )}
              {!isLast && <span className="text-vermillion">·</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
