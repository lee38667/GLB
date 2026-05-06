'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from '@/state/CartContext'
import { CartDrawer } from '@/components/commerce/CartDrawer'
import { cn } from '@/lib/cn'
import { NAV_LINKS } from '@/lib/constants'

export default function Navbar() {
  const pathname = usePathname()
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => setMenuOpen(false), [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) {
      document.body.classList.remove('overflow-hidden')
      return
    }
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.body.classList.add('overflow-hidden')
    window.addEventListener('keydown', onEsc)
    return () => {
      document.body.classList.remove('overflow-hidden')
      window.removeEventListener('keydown', onEsc)
    }
  }, [menuOpen])

  const isHeroPage = pathname === '/'

  const textColor   = scrolled || !isHeroPage ? 'var(--brand-text)'   : 'var(--hero-text)'
  const mutedColor  = scrolled || !isHeroPage ? 'var(--brand-muted)'  : 'var(--hero-muted)'
  const borderColor = scrolled || !isHeroPage ? 'var(--brand-hairline)' : 'transparent'

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-[80] transition-all duration-500"
        style={{
          background: scrolled
            ? 'rgba(242, 235, 221, 0.94)'
            : isHeroPage
              ? 'transparent'
              : 'var(--brand-bg)',
          backdropFilter: scrolled ? 'blur(18px)' : 'none',
          borderBottom: `1px solid ${scrolled ? 'var(--brand-hairline)' : isHeroPage ? 'transparent' : 'var(--brand-hairline)'}`,
        }}
      >
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-6 lg:px-10">

          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 flex-shrink-0">
            <span className="relative block h-[22px] w-[22px]">
              <Image
                src="/assets/logo.png"
                alt="GLB"
                fill
                sizes="22px"
                className="object-contain"
                priority
              />
            </span>
            <span
              className="font-display text-[1rem] uppercase tracking-[0.22em] transition-colors duration-300"
              style={{ color: textColor }}
            >
              Give Love Back
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.filter((l) => l.href !== '/').map((item) => {
              const active = pathname?.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[0.62rem] font-medium uppercase tracking-[0.24em] transition-all duration-200 hover:opacity-100"
                  style={{ color: active ? textColor : mutedColor }}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-5">
            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              aria-label={`Cart — ${count} item${count !== 1 ? 's' : ''}`}
              className="relative flex items-center gap-1.5 transition-opacity hover:opacity-60"
            >
              <svg
                width="19" height="19" viewBox="0 0 24 24" fill="none"
                style={{ color: textColor }}
                className="transition-colors duration-300"
              >
                <path
                  d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              {count > 0 && (
                <span
                  className="text-[0.58rem] font-semibold tabular-nums transition-colors duration-300"
                  style={{ color: textColor }}
                >
                  {count}
                </span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="text-[0.62rem] font-medium uppercase tracking-[0.24em] transition-opacity hover:opacity-60 md:hidden"
              style={{ color: textColor }}
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-over */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-[85] md:hidden"
            style={{ background: 'rgba(12, 10, 8, 0.35)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.32, ease: [0.17, 0.67, 0.36, 0.99] }}
              className="ml-auto h-full w-[78vw] max-w-sm p-8"
              style={{
                background: 'var(--brand-bg)',
                borderLeft: '1px solid var(--brand-hairline)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between pb-7"
                style={{ borderBottom: '1px solid var(--brand-hairline)' }}
              >
                <span
                  className="text-[0.58rem] uppercase tracking-[0.3em]"
                  style={{ color: 'var(--brand-muted)' }}
                >
                  Navigation
                </span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="text-[0.6rem] uppercase tracking-[0.24em] transition-opacity hover:opacity-50"
                  style={{ color: 'var(--brand-text)' }}
                >
                  Close
                </button>
              </div>

              <nav className="mt-10 space-y-1">
                {NAV_LINKS.map((item) => {
                  const active =
                    item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="block py-4 font-display text-3xl uppercase tracking-[0.04em] transition-opacity hover:opacity-50"
                      style={{
                        color: 'var(--brand-text)',
                        opacity: active ? 1 : 0.45,
                        borderBottom: '1px solid var(--brand-hairline)',
                      }}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-10">
                <button
                  onClick={() => { setMenuOpen(false); setCartOpen(true) }}
                  className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.24em] transition-opacity hover:opacity-60"
                  style={{ color: 'var(--brand-text)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"
                      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                  Bag {count > 0 && `(${count})`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
