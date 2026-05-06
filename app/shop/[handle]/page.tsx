import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductByHandle, listAllHandles } from '@/server/products'
import { ProductDetail } from './_components/ProductDetail'

type Props = { params: Promise<{ handle: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const p = await getProductByHandle(handle)
  if (!p) return {}
  return {
    title: p.title,
    description: p.seo?.description ?? p.description.slice(0, 155),
    openGraph: {
      images: p.images[0] ? [{ url: p.images[0].url }] : [],
      type: 'website',
    },
    alternates: { canonical: `/shop/${p.handle}` },
  }
}

export async function generateStaticParams() {
  try {
    const handles = await listAllHandles()
    return handles.map((handle) => ({ handle }))
  } catch {
    return []
  }
}

export const revalidate = 300

export default async function ProductPage({ params }: Props) {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) notFound()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.title,
            description: product.description,
            image: product.images.map((i) => i.url),
            sku: product.defaultVariantSku,
            brand: { '@type': 'Brand', name: 'Give Love Back' },
            offers: product.variants
              .filter((v) => v.isActive)
              .map((v) => ({
                '@type': 'Offer',
                sku: v.sku,
                price: v.priceNAD,
                priceCurrency: 'NAD',
                availability: v.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              })),
          }),
        }}
      />
      <ProductDetail product={product} />
    </>
  )
}
