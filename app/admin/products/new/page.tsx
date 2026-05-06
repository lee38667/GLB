'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/AdminShell'
import { ProductForm, type ProductFormData } from '../_components/ProductForm'

export default function NewProductPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleSave = async (data: ProductFormData) => {
    setSaving(true)
    try {
      const key = window.localStorage.getItem('glb_admin_key') ?? ''
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(key ? { 'x-admin-key': key } : {}),
        },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to create')
      toast.success('Product created')
      router.push('/admin/products')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminShell title="New Product">
      <ProductForm onSave={handleSave} saving={saving} />
    </AdminShell>
  )
}
