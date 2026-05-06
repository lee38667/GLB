'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

type DrawerProps = {
  open: boolean
  onClose: () => void
  side?: 'right' | 'left' | 'bottom'
  title?: string
  children: ReactNode
  className?: string
  widthClassName?: string
}

export function Drawer({
  open,
  onClose,
  side = 'right',
  title,
  children,
  className,
  widthClassName,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  const axis = side === 'bottom' ? 'y' : 'x'
  const from = side === 'right' ? '100%' : side === 'left' ? '-100%' : '100%'
  const position =
    side === 'right'
      ? 'right-0 top-0 h-full'
      : side === 'left'
      ? 'left-0 top-0 h-full'
      : 'bottom-0 left-0 right-0'
  const width =
    widthClassName ?? (side === 'bottom' ? 'w-full max-h-[80vh]' : 'w-full max-w-md')

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title ?? 'Drawer'}
            initial={{ [axis]: from } as never}
            animate={{ [axis]: 0 } as never}
            exit={{ [axis]: from } as never}
            transition={{ duration: 0.3, ease: [0.17, 0.67, 0.36, 0.99] }}
            className={cn(
              'absolute z-10 border-l border-ink bg-paper shadow-2xl',
              position,
              width,
              side === 'bottom' && 'border-l-0 border-t',
              className,
            )}
          >
            {title && (
              <header className="flex items-center justify-between border-b border-ink bg-paper-warm px-6 py-5">
                <h2 className="font-display text-2xl tracking-tight text-ink">
                  {title}<span className="text-vermillion">.</span>
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center border border-ink text-ink transition hover:bg-ink hover:text-paper"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 6l12 12M18 6 6 18"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </header>
            )}
            <div className="h-full overflow-y-auto">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
