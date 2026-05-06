'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { useCart } from '@/state/CartContext'
import { formatPrice } from '@/lib/pricing'
import { PRODUCTS as LEGACY_PRODUCTS } from '@/data/products'

export default function CartPage() {
  const { cart, change, remove, clear, count } = useCart()

  const lines = cart.map((line) => {
    const product = LEGACY_PRODUCTS.find((p: { id: string }) => p.id === line.id)
    return { ...line, product }
  })

  const subtotal = lines.reduce((s, l) => {
    if (!l.product) return s
    return s + (l.product as { price: number }).price * l.qty
  }, 0)

  return (
    <main className="bg-paper text-ink">
      <section className="glb-hero pb-0">
        <div className="glb-shell">
          <div className="flex items-center justify-between border-b border-ink pb-4">
            <span className="glb-caption uppercase tracking-[0.22em]">
              Letter № 07 · Your bundle
            </span>
            <span className="glb-eyebrow-stamp">{count} item{count === 1 ? '' : 's'}</span>
          </div>

          <div className="mt-10">
            <p className="glb-num">Pieces, queued for sealing</p>
            <h1 className="glb-display mt-4 text-[clamp(2.4rem,7vw,5.5rem)]">
              Your <em>parcel.</em>
            </h1>
          </div>

          <Breadcrumbs
            items={[{ href: '/', label: 'Home' }, { label: 'Cart' }]}
            className="mt-8"
          />
        </div>
      </section>

      <Container className="pb-24 pt-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          <div>
            <div className="flex items-center justify-between border-b border-ink pb-4">
              <p className="font-mono text-[0.66rem] tracking-[0.22em] uppercase text-graphite">
                {cart.length} line{cart.length === 1 ? '' : 's'}
              </p>
              {cart.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Empty the parcel?')) clear()
                  }}
                  className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-vermillion underline underline-offset-4 hover:text-ink"
                >
                  Empty parcel
                </button>
              )}
            </div>

            {cart.length === 0 && (
              <div className="mt-16 flex flex-col items-center gap-6 text-center border border-ink bg-paper-warm py-20 px-6">
                <span className="glb-stamp" style={{ transform: 'rotate(-8deg)' }}>
                  Empty
                  <br />· awaiting ·
                </span>
                <p className="font-display text-3xl italic mt-2">
                  Your parcel is empty.
                </p>
                <p className="glb-caption normal-case">
                  Pick something out from the catalogue.
                </p>
                <Link href="/shop" className="glb-btn glb-btn-ink mt-2">
                  Browse the catalogue
                </Link>
              </div>
            )}

            {cart.length > 0 && (
              <ul className="mt-2 divide-y divide-hairline">
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
                    <li key={line.id} className="flex gap-5 py-7">
                      <div className="relative h-32 w-32 shrink-0 overflow-hidden border border-ink bg-paper-warm">
                        <Image
                          src={`/assets/${p.file}`}
                          alt={p.name}
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between gap-3">
                        <div>
                          {p.collection && (
                            <p className="font-mono text-[0.6rem] tracking-[0.22em] uppercase text-vermillion">
                              {p.collection}
                            </p>
                          )}
                          <h3 className="font-display text-xl tracking-tight mt-1">
                            {p.name}
                          </h3>
                          <p className="mt-1 font-mono text-sm tabular-nums text-graphite">
                            {formatPrice(p.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-5">
                          <QuantityStepper
                            value={line.qty}
                            onChange={(v) => change(line.id, v - line.qty)}
                            min={1}
                            max={10}
                          />
                          <button
                            onClick={() => remove(line.id)}
                            className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-vermillion underline-offset-4 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <p className="self-start font-display text-xl tabular-nums">
                        {formatPrice(p.price * line.qty)}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {cart.length > 0 && (
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div
                className="border border-ink bg-paper-warm p-7 relative"
                style={{ boxShadow: '8px 8px 0 0 var(--vermillion)' }}
              >
                <p className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-vermillion">
                  № 08 — Receipt
                </p>
                <h2 className="font-display text-3xl tracking-tight mt-3">
                  Order summary
                </h2>

                <dl className="mt-7 space-y-3 text-sm font-mono">
                  <div className="flex justify-between">
                    <dt className="text-graphite tracking-[0.04em]">
                      Subtotal · {count} item{count === 1 ? '' : 's'}
                    </dt>
                    <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-graphite tracking-[0.04em]">Shipping</dt>
                    <dd className="text-graphite italic">Calc. at checkout</dd>
                  </div>
                  <div className="border-t border-ink pt-4 mt-4 flex justify-between items-baseline">
                    <dt className="font-display text-lg tracking-tight">Total</dt>
                    <dd className="font-display text-2xl tabular-nums text-vermillion">
                      {formatPrice(subtotal)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-7 space-y-3">
                  <Link href="/checkout" className="glb-btn glb-btn-ink w-full justify-center">
                    Seal & checkout
                  </Link>
                  <Link href="/shop" className="glb-btn glb-btn-ghost w-full justify-center">
                    Continue browsing
                  </Link>
                </div>
              </div>
            </aside>
          )}
        </div>
      </Container>
    </main>
  )
}
