'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ImageUploader, type ImageItem } from '@/components/admin/ImageUploader'
import { VariantMatrix, type VariantRow } from '@/components/admin/VariantMatrix'

export type ProductFormData = {
  handle: string
  title: string
  description: string
  collection: string
  categories: string[]
  tags: string[]
  images: ImageItem[]
  variants: VariantRow[]
  defaultVariantSku: string
  status: 'draft' | 'active' | 'archived'
  seo?: { title?: string; description?: string }
}

type Props = {
  initial?: Partial<ProductFormData>
  onSave: (data: ProductFormData) => Promise<void>
  saving: boolean
}

function toHandle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function ProductForm({ initial, onSave, saving }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [handle, setHandle] = useState(initial?.handle ?? '')
  const [handleDirty, setHandleDirty] = useState(!!initial?.handle)
  const [description, setDescription] = useState(initial?.description ?? '')
  const [collection, setCollection] = useState(initial?.collection ?? '')
  const [categories, setCategories] = useState(initial?.categories?.join(', ') ?? '')
  const [tags, setTags] = useState(initial?.tags?.join(', ') ?? '')
  const [status, setStatus] = useState<'draft' | 'active' | 'archived'>(initial?.status ?? 'draft')
  const [images, setImages] = useState<ImageItem[]>(initial?.images ?? [])
  const [variants, setVariants] = useState<VariantRow[]>(initial?.variants ?? [])
  const [seoTitle, setSeoTitle] = useState(initial?.seo?.title ?? '')
  const [seoDesc, setSeoDesc] = useState(initial?.seo?.description ?? '')

  const currentHandle = handleDirty ? handle : toHandle(title)

  const defaultVariantSku = useMemo(() => {
    if (!variants.length) return ''
    const active = variants.find((v) => v.isActive)
    return active?.sku ?? variants[0]!.sku
  }, [variants])

  const errors: string[] = []
  if (!title.trim()) errors.push('Title required')
  if (!currentHandle.trim()) errors.push('Handle required')
  if (variants.length === 0) errors.push('At least one variant required')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (errors.length > 0) return

    const csv = (s: string) =>
      s
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)

    await onSave({
      handle: currentHandle,
      title: title.trim(),
      description: description.trim(),
      collection: collection.trim(),
      categories: csv(categories),
      tags: csv(tags),
      images,
      variants,
      defaultVariantSku,
      status,
      seo: seoTitle || seoDesc ? { title: seoTitle || undefined, description: seoDesc || undefined } : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-10">
      <section className="space-y-4">
        <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-tide">
          Basic info
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Title"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (!handleDirty) setHandle(toHandle(e.target.value))
            }}
            placeholder="GLB Classic Tee — Pink"
          />
          <Input
            label="Handle (URL slug)"
            required
            value={currentHandle}
            onChange={(e) => {
              setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
              setHandleDirty(true)
            }}
            hint="/shop/this-value"
            placeholder="glb-classic-tee-pink"
          />
        </div>
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Part of the GLB Classic range…"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Collection"
            value={collection}
            onChange={(e) => setCollection(e.target.value)}
            placeholder="GLB Classic"
          />
          <Input
            label="Categories"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            hint="Comma-separated"
            placeholder="Tees, Unisex"
          />
          <Input
            label="Tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            hint="Comma-separated"
            placeholder="new, bestseller"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-tide">
          Images
        </h3>
        <ImageUploader images={images} setImages={setImages} />
      </section>

      <section className="space-y-4">
        <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-tide">
          Variants
        </h3>
        <VariantMatrix variants={variants} setVariants={setVariants} handle={currentHandle} />
      </section>

      <section className="space-y-4">
        <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-tide">
          SEO (optional)
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="SEO title"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            hint="Max 70 chars"
            maxLength={70}
          />
          <Input
            label="SEO description"
            value={seoDesc}
            onChange={(e) => setSeoDesc(e.target.value)}
            hint="Max 200 chars"
            maxLength={200}
          />
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-6">
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'active', label: 'Active (published)' },
            { value: 'archived', label: 'Archived' },
          ]}
          className="w-48"
        />
        <div className="ml-auto flex gap-3">
          <Button href="/admin/products" variant="ghost">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            disabled={errors.length > 0}
          >
            {initial ? 'Save changes' : 'Create product'}
          </Button>
        </div>
      </section>

      {errors.length > 0 && (
        <ul className="text-xs text-red-400">
          {errors.map((e) => (
            <li key={e}>• {e}</li>
          ))}
        </ul>
      )}
    </form>
  )
}
