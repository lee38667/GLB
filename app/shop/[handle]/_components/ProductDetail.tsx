'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Price } from '@/components/ui/Price'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { useCart } from '@/state/CartContext'
import { cn } from '@/lib/cn'
import type { PublicProduct } from '@/server/products'

type Props = { product: PublicProduct }

const pillBase =
  'border px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] transition'
const pillIdle =
  'border-hairline text-graphite hover:text-ink hover:border-ink'
const pillActive = 'border-ink bg-ink text-paper'

export function ProductDetail({ product: p }: Props) {
  const { add } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [qty, setQty] = useState(1)

  const availableSizes = useMemo(
    () => [...new Set(p.variants.filter((v) => v.isActive).map((v) => v.size))],
    [p.variants],
  )
  const availableColors = useMemo(
    () => [...new Set(p.variants.filter((v) => v.isActive).map((v) => v.color))],
    [p.variants],
  )

  const [selectedSize, setSelectedSize] = useState(availableSizes[0] ?? '')
  const [selectedColor, setSelectedColor] = useState(availableColors[0] ?? '')

  const selectedVariant = useMemo(
    () =>
      p.variants.find(
        (v) => v.isActive && v.size === selectedSize && v.color === selectedColor,
      ) ?? p.variants.find((v) => v.isActive),
    [p.variants, selectedSize, selectedColor],
  )

  const handleAddToCart = () => {
    add(p.id)
    toast.success('Sealed into parcel', {
      description: `${p.title} — ${selectedSize}, ${selectedColor}`,
    })
  }

  return (
    <main className="bg-paper text-ink">
      <Container className="pb-24 pt-32">
        <Breadcrumbs
          items={[
            { href: '/', label: 'Home' },
            { href: '/shop', label: 'Catalogue' },
            { label: p.title },
          ]}
          className="mb-10"
        />

        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          {/* IMAGES — tearsheet */}
          <div className="space-y-4">
            <figure className="relative aspect-[4/5] overflow-hidden border border-ink bg-paper-warm">
              {p.images[selectedImage] ? (
                <Image
                  src={p.images[selectedImage]!.url}
                  alt={p.images[selectedImage]!.alt || p.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-mono text-graphite uppercase tracking-[0.2em] text-xs">
                  No frame
                </div>
              )}
              <figcaption className="absolute bottom-3 left-3 right-3 flex justify-between glb-caption text-paper-warm bg-ink/85 px-3 py-2">
                <span>Plate {String(selectedImage + 1).padStart(2, '0')} — {p.title}</span>
                <span className="text-vermillion">{p.collection}</span>
              </figcaption>
            </figure>

            {p.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {p.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'relative h-20 w-20 shrink-0 overflow-hidden border transition',
                      i === selectedImage
                        ? 'border-vermillion'
                        : 'border-hairline hover:border-ink',
                    )}
                    style={
                      i === selectedImage
                        ? { boxShadow: '3px 3px 0 0 var(--ink)' }
                        : undefined
                    }
                  >
                    <Image src={img.url} alt={img.alt} fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT META — letterpress */}
          <div className="flex flex-col gap-7 lg:sticky lg:top-28 lg:self-start">
            <div>
              <p className="font-mono text-vermillion text-[0.66rem] tracking-[0.22em] uppercase">
                {p.collection}
              </p>
              <h1 className="glb-display mt-3 text-[clamp(2rem,4vw,3.4rem)] leading-[0.95]">
                {p.title}
              </h1>
            </div>

            <div className="flex items-baseline gap-4 border-y border-ink py-4">
              {selectedVariant && (
                <Price
                  amount={selectedVariant.priceNAD}
                  compareAt={selectedVariant.compareAtPriceNAD}
                  size="lg"
                />
              )}
              {!p.inStock && (
                <span className="font-mono text-[0.6rem] tracking-[0.22em] uppercase border border-vermillion text-vermillion px-2 py-1">
                  Sold out
                </span>
              )}
            </div>

            {availableSizes.length > 1 && (
              <div>
                <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-graphite">
                  Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((s) => {
                    const variantForSize = p.variants.find(
                      (v) => v.isActive && v.size === s && v.color === selectedColor,
                    )
                    const oos = !variantForSize || variantForSize.stock <= 0
                    return (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        disabled={oos}
                        className={cn(
                          'flex h-11 min-w-11 items-center justify-center border font-mono text-[0.7rem] tracking-[0.12em] uppercase transition px-4',
                          selectedSize === s
                            ? 'border-ink bg-ink text-paper'
                            : 'border-hairline text-graphite hover:text-ink hover:border-ink',
                          oos && 'cursor-not-allowed opacity-40 line-through',
                        )}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {availableColors.length > 1 && (
              <div>
                <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-graphite">
                  Colour
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={cn(pillBase, selectedColor === c ? pillActive : pillIdle)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 border-t border-ink pt-6">
              <QuantityStepper
                value={qty}
                onChange={setQty}
                min={1}
                max={selectedVariant ? selectedVariant.stock : 10}
              />
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={!p.inStock || !selectedVariant}
                onClick={handleAddToCart}
              >
                {p.inStock ? 'Seal into parcel' : 'Sold out'}
              </Button>
            </div>

            {p.description && (
              <div className="border-t border-hairline pt-6">
                <p className="font-mono text-vermillion text-[0.62rem] tracking-[0.22em] uppercase">
                  № — Note
                </p>
                <p className="mt-3 glb-lede text-[0.95rem]">{p.description}</p>
              </div>
            )}

            <div className="border-t border-hairline pt-6 space-y-3">
              <p className="font-mono text-vermillion text-[0.62rem] tracking-[0.22em] uppercase">
                Post & returns
              </p>
              <p className="text-sm leading-relaxed text-ink-soft">
                Free post on orders over N$ 500. Standard delivery 3–5 working days within Namibia.
              </p>
              <p className="text-sm leading-relaxed text-ink-soft">
                Returns within 14 days of delivery — unworn, with original tags.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  )
}
