'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Price } from '@/components/ui/Price'
import { useCart } from '@/state/CartContext'
import { cn } from '@/lib/cn'

export type ProductCardData = {
  id: string
  handle: string
  title: string
  collection: string
  images: { url: string; alt: string }[]
  minPriceNAD: number
  maxPriceNAD: number
  inStock: boolean
  defaultVariantSku: string
  variants: { sku: string; compareAtPriceNAD: number | null; isActive: boolean }[]
}

type Props = {
  product: ProductCardData
  priority?: boolean
  className?: string
}

export function ProductCard({ product, priority = false, className }: Props) {
  const { add } = useCart()
  const img = product.images[0]
  const onSale = product.variants.some(
    (v) => v.isActive && typeof v.compareAtPriceNAD === 'number' && v.compareAtPriceNAD > product.minPriceNAD,
  )
  const compareAt = onSale
    ? Math.max(
        ...product.variants
          .filter((v) => v.isActive && typeof v.compareAtPriceNAD === 'number')
          .map((v) => v.compareAtPriceNAD!),
      )
    : undefined

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    add(product.id)
    toast.success('Sealed into parcel', { description: product.title })
  }

  return (
    <motion.article
      className={cn('group relative', className)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: [0.17, 0.67, 0.36, 0.99] }}
    >
      <Link href={`/shop/${product.handle}`} className="glb-tearsheet block h-full">
        <div className="glb-tearsheet-frame">
          {img ? (
            <Image
              src={img.url}
              alt={img.alt || product.title}
              fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              priority={priority}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-graphite font-mono text-xs uppercase tracking-[0.2em]">
              No frame
            </div>
          )}

          {/* status pill — top left */}
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
            {!product.inStock && (
              <span className="font-mono text-[0.58rem] tracking-[0.2em] uppercase bg-ink text-paper px-2 py-1">
                Sold out
              </span>
            )}
            {onSale && product.inStock && (
              <span className="font-mono text-[0.58rem] tracking-[0.2em] uppercase bg-vermillion text-paper-warm px-2 py-1">
                Final stamp
              </span>
            )}
          </div>

          {/* quick-add — circular ink button */}
          {product.inStock && (
            <button
              onClick={handleQuickAdd}
              className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ink text-paper opacity-0 transition duration-300 hover:bg-vermillion group-hover:opacity-100"
              aria-label={`Add ${product.title} to parcel`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        <div className="glb-tearsheet-meta">
          <div className="glb-cat-row">
            <span className="cat">{product.collection}</span>
            <span className="opacity-70">Plate</span>
          </div>
          <h3 className="glb-tearsheet-name">{product.title}</h3>
          <div className="flex items-center justify-between pt-1 border-t border-hairline">
            <Price amount={product.minPriceNAD} compareAt={compareAt} size="sm" />
            <span className="font-mono text-[0.58rem] tracking-[0.2em] uppercase text-graphite group-hover:text-vermillion transition-colors">
              Read →
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
