import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'outline'

const variants: Record<Variant, string> = {
  default: 'bg-ink text-paper border border-ink',
  success: 'bg-paper-warm text-ink border border-ink',
  warning: 'bg-vermillion text-paper-warm border border-vermillion',
  danger:  'bg-paper-warm text-vermillion border border-vermillion',
  outline: 'bg-transparent text-ink border border-ink',
}

export function Badge({
  variant = 'default',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      {...props}
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[0.6rem] font-medium uppercase tracking-[0.22em]',
        variants[variant],
        className,
      )}
    />
  )
}
