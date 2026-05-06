import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Container({
  className,
  size = 'xl',
  ...props
}: HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' }) {
  const max = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-[1440px]',
    full: 'max-w-full',
  }[size]
  return (
    <div
      {...props}
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', max, className)}
    />
  )
}
