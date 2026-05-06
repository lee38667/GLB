'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type CartLine = {
  /** Legacy item id (Phase 0/1) — will be replaced with variantSku in Phase 2. */
  id: string
  /** Future variant identifier (populated in Phase 2 PDP rewrite). */
  variantSku?: string
  qty: number
}

export type CartApi = {
  cart: CartLine[]
  add: (id: string) => void
  remove: (id: string) => void
  change: (id: string, delta: number) => void
  clear: () => void
  count: number
}

const CartContext = createContext<CartApi | null>(null)
const CART_KEY = 'glbecom_cart_v1'

function readCart(): CartLine[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (line): line is CartLine =>
        typeof line === 'object' &&
        line !== null &&
        typeof (line as CartLine).id === 'string' &&
        typeof (line as CartLine).qty === 'number',
    )
  } catch (error) {
    console.error('Failed to read cart from storage', error)
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>(() => readCart())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setCart(readCart())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart, hydrated])

  const api = useMemo<CartApi>(
    () => ({
      cart,
      count: cart.reduce((sum, line) => sum + line.qty, 0),
      add: (id) => {
        setCart((prev) => {
          const found = prev.find((p) => p.id === id)
          if (found) {
            return prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p))
          }
          return [...prev, { id, qty: 1 }]
        })
      },
      remove: (id) => setCart((prev) => prev.filter((p) => p.id !== id)),
      change: (id, delta) => {
        setCart((prev) =>
          prev
            .map((p) => (p.id === id ? { ...p, qty: Math.max(0, p.qty + delta) } : p))
            .filter((p) => p.qty > 0),
        )
      },
      clear: () => setCart([]),
    }),
    [cart],
  )

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within <CartProvider>')
  return ctx
}
