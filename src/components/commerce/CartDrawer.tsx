'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { useCart } from '@/state/CartContext'
import { formatPrice } from '@/lib/pricing'
import { PRODUCTS as LEGACY_PRODUCTS } from '@/data/products'

type CartDrawerProps = {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, change, remove, count } = useCart()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const lines = cart.map((line) => {
    const product = LEGACY_PRODUCTS.find((p: { id: string }) => p.id === line.id)
    return { ...line, product }
  })

  const subtotal = lines.reduce((s, l) => {
    if (!l.product) return s
    return s + (l.product as { price: number }).price * l.qty
  }, 0)

  if (!mounted) return null

  return (
    <Drawer open={open} onClose={onClose} title="Parcel" side="right">
      <div className="flex h-full flex-col bg-paper text-ink">
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
              <span className="glb-stamp">
                Empty
                <br />· awaiting ·
              </span>
              <p className="font-display italic text-2xl">Your parcel is empty.</p>
              <Button href="/shop" variant="primary" size="sm" onClick={onClose}>
                Browse the catalogue
              </Button>
            </div>
          )}

          <ul className="divide-y divide-hairline">
            {lines.map((line) => {
              if (!line.product) return null
              const p = line.product as {
                id: string
                name: string
                price: number
                file: string
                collection?: string
              }
              return (
                <li key={line.id} className="flex gap-4 py-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden border border-ink bg-paper-warm">
                    <Image
                      src={`/assets/${p.file}`}
                      alt={p.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-2">
                    <div>
                      {p.collection && (
                        <p className="font-mono text-[0.55rem] tracking-[0.22em] uppercase text-vermillion">
                          {p.collection}
                        </p>
                      )}
                      <p className="font-display text-base tracking-tight">{p.name}</p>
                      <p className="font-mono text-xs tabular-nums text-graphite">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <QuantityStepper
                        value={line.qty}
                        onChange={(v) => change(line.id, v - line.qty)}
                        min={1}
                        max={10}
                      />
                      <button
                        onClick={() => remove(line.id)}
                        className="font-mono text-[0.6rem] tracking-[0.22em] uppercase text-vermillion underline-offset-4 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="self-start font-display text-base tabular-nums">
                    {formatPrice(p.price * line.qty)}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>

        {cart.length > 0 && (
          <div className="border-t border-ink bg-paper-warm px-6 py-5">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-graphite">
                {count} {count === 1 ? 'item' : 'items'}
              </span>
              <span className="font-display text-2xl tabular-nums text-vermillion">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="mt-1 font-mono text-[0.6rem] tracking-[0.18em] uppercase text-graphite">
              Post calc. at checkout
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Button href="/checkout" variant="primary" onClick={onClose}>
                Seal & checkout
              </Button>
              <Button href="/cart" variant="secondary" onClick={onClose}>
                View parcel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}
