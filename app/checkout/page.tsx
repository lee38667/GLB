'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { useCart } from '@/state/CartContext'
import { formatPrice } from '@/lib/pricing'
import { PRODUCTS as LEGACY_PRODUCTS } from '@/data/products'

const SHIPPING_METHODS = [
  { value: 'standard', label: 'Standard post · free' },
  { value: 'express', label: 'Express post · N$ 150.00' },
]

const COUNTRY_OPTIONS = [
  { value: 'NA', label: 'Namibia' },
  { value: 'ZA', label: 'South Africa' },
]

type FormErrors = Record<string, string>

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, clear } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState('')

  const [form, setForm] = useState({
    email: '',
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    region: '',
    postalCode: '',
    country: 'NA',
    shippingMethod: 'standard' as 'standard' | 'express',
    notes: '',
  })

  const lines = cart.map((line) => {
    const product = LEGACY_PRODUCTS.find((p: { id: string }) => p.id === line.id)
    return { ...line, product }
  })

  const subtotal = lines.reduce((s, l) => {
    if (!l.product) return s
    return s + (l.product as { price: number }).price * l.qty
  }, 0)

  const shippingCost = form.shippingMethod === 'express' ? 150 : 0
  const total = subtotal + shippingCost

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function validate(): FormErrors {
    const e: FormErrors = {}
    if (!form.email.includes('@')) e.email = 'A valid email, please'
    if (!form.name.trim()) e.name = 'We need a name to address this to'
    if (!form.phone.trim() || form.phone.length < 6) e.phone = 'A reachable number'
    if (!form.line1.trim()) e.line1 = 'A street address'
    if (!form.city.trim()) e.city = 'City required'
    if (!form.region.trim()) e.region = 'Region required'
    if (!form.postalCode.trim()) e.postalCode = 'Postal code required'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError('')

    const validationErrors = validate()
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)

    try {
      const items = cart.map((line) => ({
        productId: line.id,
        variantSku: line.variantSku ?? `${line.id}-default`,
        qty: line.qty,
      }))

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          checkout: {
            email: form.email,
            shippingAddress: {
              name: form.name,
              line1: form.line1,
              line2: form.line2 || undefined,
              city: form.city,
              region: form.region,
              postalCode: form.postalCode,
              country: form.country,
              phone: form.phone,
            },
            shippingMethod: form.shippingMethod,
            notes: form.notes || undefined,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setServerError(data.error || 'Checkout failed. Please try again.')
        setSubmitting(false)
        return
      }

      clear()
      window.location.href = data.data.authorizationUrl
    } catch {
      setServerError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (cart.length === 0 && !submitting) {
    return (
      <main className="bg-paper text-ink">
        <Container className="pb-24 pt-32">
          <div className="border border-ink bg-paper-warm py-20 px-6 flex flex-col items-center text-center gap-6">
            <span className="glb-stamp">
              No <br /> parcel
            </span>
            <p className="font-display italic text-3xl mt-2">Your parcel is empty.</p>
            <Link href="/shop" className="glb-btn glb-btn-ink">
              Browse the catalogue
            </Link>
          </div>
        </Container>
      </main>
    )
  }

  const sectionTitle = (n: string, label: string) => (
    <h2 className="border-b border-ink pb-3 mb-6 flex items-baseline justify-between">
      <span className="font-mono text-vermillion text-[0.66rem] tracking-[0.22em] uppercase">
        № {n}
      </span>
      <span className="font-display text-2xl tracking-tight">{label}</span>
    </h2>
  )

  return (
    <main className="bg-paper text-ink">
      <section className="glb-hero pb-0">
        <div className="glb-shell">
          <div className="flex items-center justify-between border-b border-ink pb-4">
            <span className="glb-caption uppercase tracking-[0.22em]">
              Letter № 08 · Sealing
            </span>
            <span className="glb-eyebrow-stamp">Secured</span>
          </div>

          <div className="mt-10">
            <p className="glb-num">Address an envelope, seal a parcel</p>
            <h1 className="glb-display mt-4 text-[clamp(2.4rem,7vw,5.5rem)]">
              Sealing <em>your parcel.</em>
            </h1>
          </div>

          <Breadcrumbs
            items={[
              { href: '/', label: 'Home' },
              { href: '/cart', label: 'Cart' },
              { label: 'Checkout' },
            ]}
            className="mt-8"
          />
        </div>
      </section>

      <Container className="pb-24 pt-12">
        <form onSubmit={handleSubmit} className="grid gap-12 lg:grid-cols-[1fr_400px]">
          <div className="space-y-12">
            <section>
              {sectionTitle('01', 'Contact')}
              <Input
                label="Email"
                type="email"
                required
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                error={errors.email}
                placeholder="you@somewhere.world"
              />
            </section>

            <section>
              {sectionTitle('02', 'Address')}
              <div className="grid gap-5">
                <Input
                  label="Full name"
                  required
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  error={errors.name}
                />
                <Input
                  label="Phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  error={errors.phone}
                />
                <Input
                  label="Street"
                  required
                  value={form.line1}
                  onChange={(e) => set('line1', e.target.value)}
                  error={errors.line1}
                />
                <Input
                  label="Apartment / unit (optional)"
                  value={form.line2}
                  onChange={(e) => set('line2', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-5">
                  <Input
                    label="City"
                    required
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    error={errors.city}
                  />
                  <Input
                    label="Region"
                    required
                    value={form.region}
                    onChange={(e) => set('region', e.target.value)}
                    error={errors.region}
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <Input
                    label="Postal code"
                    required
                    value={form.postalCode}
                    onChange={(e) => set('postalCode', e.target.value)}
                    error={errors.postalCode}
                  />
                  <Select
                    label="Country"
                    required
                    options={COUNTRY_OPTIONS}
                    value={form.country}
                    onChange={(e) => set('country', e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section>
              {sectionTitle('03', 'Post')}
              <div className="space-y-3">
                {SHIPPING_METHODS.map((m) => (
                  <label
                    key={m.value}
                    className={`flex cursor-pointer items-center gap-4 border p-5 transition ${
                      form.shippingMethod === m.value
                        ? 'border-ink bg-paper-warm'
                        : 'border-hairline hover:border-ink'
                    }`}
                    style={
                      form.shippingMethod === m.value
                        ? { boxShadow: '4px 4px 0 0 var(--vermillion)' }
                        : undefined
                    }
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={m.value}
                      checked={form.shippingMethod === m.value}
                      onChange={() => set('shippingMethod', m.value)}
                      className="accent-vermillion h-4 w-4"
                    />
                    <span className="font-display text-lg tracking-tight">{m.label}</span>
                  </label>
                ))}
              </div>
            </section>

            <section>
              {sectionTitle('04', 'A note')}
              <Textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Anything we should know? (optional)"
                className="min-h-[100px]"
              />
            </section>
          </div>

          {/* RECEIPT */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div
              className="border border-ink bg-paper-warm relative"
              style={{ boxShadow: '8px 8px 0 0 var(--vermillion)' }}
            >
              <div className="p-7">
                <p className="font-mono text-vermillion text-[0.62rem] tracking-[0.22em] uppercase">
                  № 09 — Receipt
                </p>
                <h2 className="font-display text-3xl tracking-tight mt-3">
                  In your parcel
                </h2>
              </div>

              <div className="glb-perforated" style={{ background: 'var(--paper-warm)' }} />

              <ul className="px-7 divide-y divide-hairline">
                {lines.map((line) => {
                  if (!line.product) return null
                  const p = line.product as {
                    id: string
                    name: string
                    price: number
                    file: string
                  }
                  return (
                    <li key={line.id} className="flex gap-3 py-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-ink bg-paper">
                        <Image
                          src={`/assets/${p.file}`}
                          alt={p.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-base tracking-tight truncate">{p.name}</p>
                        <p className="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-graphite mt-1">
                          × {line.qty}
                        </p>
                      </div>
                      <p className="font-mono text-sm tabular-nums self-center">
                        {formatPrice(p.price * line.qty)}
                      </p>
                    </li>
                  )
                })}
              </ul>

              <div className="px-7 pt-4 mt-2 space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-graphite tracking-[0.04em]">Subtotal</span>
                  <span className="tabular-nums">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-graphite tracking-[0.04em]">Post</span>
                  <span className="tabular-nums">
                    {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-ink pt-3 mt-3 items-baseline">
                  <span className="font-display text-lg tracking-tight not-italic">Total</span>
                  <span className="font-display text-2xl tabular-nums text-vermillion">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <div className="p-7">
                {serverError && (
                  <p className="mb-4 border border-vermillion bg-paper p-3 font-mono text-[0.7rem] text-vermillion tracking-wide">
                    {serverError}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={submitting}
                  disabled={submitting}
                >
                  {submitting ? 'Sealing…' : `Seal · pay ${formatPrice(total)}`}
                </Button>

                <p className="mt-4 text-center font-mono text-[0.6rem] tracking-[0.18em] uppercase text-graphite">
                  Redirected to Paystack — secured.
                </p>
              </div>
            </div>
          </aside>
        </form>
      </Container>
    </main>
  )
}
