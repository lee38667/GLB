'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/AdminShell'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProductForm, type ProductFormData } from '../_components/ProductForm'
import type { PublicProduct } from '@/server/products'

function adminHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {}
  const key = window.localStorage.getItem('glb_admin_key') ?? ''
  return key ? { 'x-admin-key': key, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<PublicProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}`, { headers: adminHeaders() })
        if (!res.ok) throw new Error('Not found')
        const json = await res.json()
        setProduct(json.data)
      } catch {
        toast.error('Product not found')
        router.push('/admin/products')
      } finally {
        setLoading(false)
      }
    })()
  }, [id, router])

  const handleSave = async (data: ProductFormData) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to save')
      toast.success('Product updated')
      setProduct(json.data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminShell title="Edit Product">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AdminShell>
    )
  }

  if (!product) return null

  return (
    <AdminShell title={`Edit: ${product.title}`}>
      <ProductForm
        initial={{
          handle: product.handle,
          title: product.title,
          description: product.description,
          collection: product.collection,
          categories: product.categories,
          tags: product.tags,
          images: product.images.map((img) => ({ ...img, publicId: '' })),
          variants: product.variants.map((v) => ({
            ...v,
            compareAtPriceNAD: v.compareAtPriceNAD ?? null,
          })),
          defaultVariantSku: product.defaultVariantSku,
          status: product.status,
          seo: undefined,
        }}
        onSave={handleSave}
        saving={saving}
      />
    </AdminShell>
  )
}
