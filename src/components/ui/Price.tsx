import { cn } from '@/lib/cn'
import { formatPrice } from '@/lib/pricing'

type Props = {
  amount: number
  compareAt?: number | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl',
} as const

export function Price({ amount, compareAt, className, size = 'md' }: Props) {
  const onSale = typeof compareAt === 'number' && compareAt > amount
  return (
    <span className={cn('inline-flex items-baseline gap-2 font-mono tabular-nums', sizes[size], className)}>
      <span className="text-ink">{formatPrice(amount)}</span>
      {onSale && (
        <span className="text-[0.7em] text-graphite line-through decoration-vermillion">
          {formatPrice(compareAt)}
        </span>
      )}
    </span>
  )
}
