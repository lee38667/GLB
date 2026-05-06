'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

type OrderData = {
  orderNumber: string
  totalNAD: number
  status: string
  guestEmail: string | null
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!reference) {
      setError('No payment reference found.')
      setLoading(false)
      return
    }

    let mounted = true

    async function verify() {
      try {
        const res = await fetch(`/api/checkout/verify?reference=${encodeURIComponent(reference!)}`)
        const data = await res.json()
        if (!mounted) return

        if (data.success && data.data) {
          setOrder(data.data)
        } else {
          setError(data.error || 'Could not verify your payment.')
        }
      } catch {
        if (mounted) setError('Failed to verify payment. Please contact support.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    verify()
    return () => {
      mounted = false
    }
  }, [reference])

  return (
    <main className="bg-paper text-ink">
      <Container className="pb-24 pt-32">
        <div className="mx-auto max-w-xl">
          {loading && (
            <div className="space-y-5">
              <Skeleton className="mx-auto h-24 w-24" />
              <Skeleton className="mx-auto h-10 w-64" />
              <Skeleton className="mx-auto h-4 w-48" />
            </div>
          )}

          {!loading && error && (
            <div className="text-center">
              <span className="glb-stamp inline-flex" style={{ borderColor: 'var(--ink)', color: 'var(--ink)' }}>
                Return to
                <br />
                sender
              </span>
              <h1 className="glb-display mt-8 text-[clamp(2.4rem,5vw,4rem)]">
                Letter <em>not delivered.</em>
              </h1>
              <p className="glb-lede mx-auto mt-4">{error}</p>
              <div className="mt-10 flex justify-center gap-3">
                <Button href="/cart" variant="primary">
                  Return to cart
                </Button>
                <Button href="/contact" variant="secondary">
                  Write to support
                </Button>
              </div>
            </div>
          )}

          {!loading && order && (
            <div>
              <div className="text-center">
                <span className="glb-stamp inline-flex anim-stamp">
                  Sealed
                  <br />
                  · MMXXVI ·
                </span>
                <p className="glb-num mt-8">№ — Confirmation</p>
                <h1 className="glb-display mt-3 text-[clamp(2.4rem,6vw,5rem)]">
                  Your parcel
                  <br />
                  is <em>on its way.</em>
                </h1>
                <p className="glb-lede mx-auto mt-5">
                  Thank you for choosing a piece of GLB. Order{' '}
                  <span className="font-mono text-vermillion">{order.orderNumber}</span> has
                  been received and sealed.
                </p>
                {order.guestEmail && (
                  <p className="glb-caption normal-case tracking-wide mt-3">
                    A confirmation has been sent to{' '}
                    <span className="text-ink underline underline-offset-4">
                      {order.guestEmail}
                    </span>
                    .
                  </p>
                )}
              </div>

              <div
                className="mt-12 border border-ink bg-paper-warm relative"
                style={{ boxShadow: '8px 8px 0 0 var(--vermillion)' }}
              >
                <div className="px-7 py-5 border-b border-ink flex items-center justify-between">
                  <span className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-vermillion">
                    Receipt of post
                  </span>
                  <span className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-graphite">
                    {new Date().toLocaleDateString('en-GB')}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-y-5 gap-x-6 px-7 py-6">
                  <div>
                    <dt className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-graphite">
                      Order
                    </dt>
                    <dd className="mt-1 font-display text-xl tracking-tight">
                      {order.orderNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-graphite">
                      Status
                    </dt>
                    <dd className="mt-1 font-display text-xl tracking-tight capitalize">
                      {order.status}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-graphite">
                      Reference
                    </dt>
                    <dd className="mt-1 font-mono text-xs text-graphite break-all">
                      {reference}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-graphite">
                      Total
                    </dt>
                    <dd className="mt-1 font-display text-2xl tracking-tight text-vermillion">
                      N$ {order.totalNAD.toFixed(2)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-12 flex justify-center gap-3">
                <Button href="/shop" variant="primary">
                  Read more letters
                </Button>
                <Button href="/" variant="secondary">
                  Back home
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </main>
  )
}
