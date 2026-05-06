'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono uppercase tracking-[0.22em] transition-all duration-200 ease-emphasized focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermillion/60 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50 border'

const variants: Record<Variant, string> = {
  primary:
    'bg-ink text-paper border-ink shadow-[4px_4px_0_0_var(--vermillion)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--vermillion)]',
  secondary:
    'bg-paper-warm text-ink border-ink hover:bg-ink hover:text-paper',
  ghost:
    'bg-transparent text-ink border-transparent hover:border-ink',
  outline:
    'bg-transparent text-ink border-ink hover:bg-ink hover:text-paper',
  danger:
    'bg-vermillion text-paper-warm border-vermillion hover:bg-vermillion-deep hover:border-vermillion-deep',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[0.62rem]',
  md: 'h-11 px-6 text-[0.66rem]',
  lg: 'h-12 px-8 text-[0.72rem]',
  icon: 'h-10 w-10',
}

type CommonProps = {
  variant?: Variant
  size?: Size
  loading?: boolean
  leading?: ReactNode
  trailing?: ReactNode
  className?: string
  children?: ReactNode
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }

type ButtonAsLink = CommonProps & {
  href: string
  target?: string
  rel?: string
  prefetch?: boolean
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}

export type ButtonProps = ButtonAsButton | ButtonAsLink

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const {
      variant = 'primary',
      size = 'md',
      loading,
      leading,
      trailing,
      className,
      children,
      ...rest
    } = props as CommonProps & Record<string, unknown>

    const classes = cn(base, variants[variant], sizes[size], className)
    const content = (
      <>
        {loading ? <Spinner /> : leading}
        {children}
        {!loading && trailing}
      </>
    )

    if ('href' in props && typeof props.href === 'string') {
      const { href, target, rel, prefetch, onClick: linkClick } = props as ButtonAsLink
      return (
        <Link
          href={href}
          target={target}
          rel={rel}
          prefetch={prefetch}
          onClick={linkClick}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
        >
          {content}
        </Link>
      )
    }

    const btnRest = rest as ButtonHTMLAttributes<HTMLButtonElement>
    return (
      <button
        {...btnRest}
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        disabled={btnRest.disabled ?? loading}
      >
        {content}
      </button>
    )
  },
)

function Spinner() {
  return (
    <svg
      className="h-3.5 w-3.5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
