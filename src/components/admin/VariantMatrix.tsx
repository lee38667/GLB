'use client'

import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { SIZE_OPTIONS } from '@/lib/constants'

export type VariantRow = {
  sku: string
  size: string
  color: string
  priceNAD: number
  compareAtPriceNAD: number | null
  stock: number
  isActive: boolean
}

type Props = {
  variants: VariantRow[]
  setVariants: Dispatch<SetStateAction<VariantRow[]>>
  handle: string
}

function skuFor(handle: string, size: string, color: string) {
  const h = handle.toUpperCase().replace(/-/g, '-').slice(0, 16)
  const s = size.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
  const c = color.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
  return `${h}-${s}-${c}`
}

export function VariantMatrix({ variants, setVariants, handle }: Props) {
  const [newColor, setNewColor] = useState('')
  const [newSize, setNewSize] = useState('')

  const existingSizes = useMemo(
    () => [...new Set(variants.map((v) => v.size))].sort((a, b) => {
      const ia = SIZE_OPTIONS.indexOf(a as typeof SIZE_OPTIONS[number])
      const ib = SIZE_OPTIONS.indexOf(b as typeof SIZE_OPTIONS[number])
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
    }),
    [variants],
  )
  const existingColors = useMemo(() => [...new Set(variants.map((v) => v.color))].sort(), [variants])

  const addSizeColor = (sizes: string[], colors: string[]) => {
    setVariants((prev) => {
      const existing = new Set(prev.map((v) => `${v.size}::${v.color}`))
      const toAdd: VariantRow[] = []
      const price = prev[0]?.priceNAD ?? 0
      for (const size of sizes) {
        for (const color of colors) {
          const key = `${size}::${color}`
          if (!existing.has(key)) {
            toAdd.push({
              sku: skuFor(handle, size, color),
              size,
              color,
              priceNAD: price,
              compareAtPriceNAD: null,
              stock: 0,
              isActive: true,
            })
          }
        }
      }
      return [...prev, ...toAdd]
    })
  }

  const addSizeRow = () => {
    const s = newSize.trim()
    if (!s) return
    addSizeColor([s], existingColors.length ? existingColors : ['Default'])
    setNewSize('')
  }

  const addColorColumn = () => {
    const c = newColor.trim()
    if (!c) return
    addSizeColor(existingSizes.length ? existingSizes : ['One Size'], [c])
    setNewColor('')
  }

  const generateFromPresets = () => {
    const sizes = ['S', 'M', 'L', 'XL']
    const colors = existingColors.length > 0 ? existingColors : ['Default']
    addSizeColor(sizes, colors)
  }

  const updateField = (idx: number, field: keyof VariantRow, value: unknown) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v)),
    )
  }

  const removeVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx))
  }

  const bulkSetPrice = (price: number) => {
    setVariants((prev) => prev.map((v) => ({ ...v, priceNAD: price })))
  }

  const bulkSetStock = (stock: number) => {
    setVariants((prev) => prev.map((v) => ({ ...v, stock })))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex gap-2">
          <Input
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            placeholder="e.g. S, M, XL"
            label="Add size"
            containerClassName="w-36"
          />
          <Button type="button" variant="secondary" size="sm" onClick={addSizeRow} className="self-end">
            + Size
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            placeholder="e.g. Black, Pink"
            label="Add color"
            containerClassName="w-36"
          />
          <Button type="button" variant="secondary" size="sm" onClick={addColorColumn} className="self-end">
            + Color
          </Button>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={generateFromPresets} className="self-end">
          Auto-fill S/M/L/XL
        </Button>
      </div>

      {variants.length > 1 && (
        <div className="flex flex-wrap gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <span className="self-center text-[0.65rem] uppercase tracking-[0.25em] text-tide">Bulk:</span>
          <button
            type="button"
            className="text-xs text-clay underline hover:text-sand"
            onClick={() => {
              const val = prompt('Set price for all variants')
              if (val && Number.isFinite(Number(val))) bulkSetPrice(Number(val))
            }}
          >
            Set all prices
          </button>
          <button
            type="button"
            className="text-xs text-clay underline hover:text-sand"
            onClick={() => {
              const val = prompt('Set stock for all variants')
              if (val && Number.isFinite(Number(val))) bulkSetStock(Number(val))
            }}
          >
            Set all stock
          </button>
        </div>
      )}

      {variants.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-clay">
          No variants yet. Add sizes/colors above, or click &ldquo;Auto-fill S/M/L/XL&rdquo;.
        </div>
      )}

      {variants.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[660px] text-left text-sm">
            <thead className="bg-white/5 text-[0.6rem] uppercase tracking-[0.22em] text-tide">
              <tr>
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2">Size</th>
                <th className="px-3 py-2">Color</th>
                <th className="px-3 py-2">Price (N$)</th>
                <th className="px-3 py-2">Compare</th>
                <th className="px-3 py-2">Stock</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {variants.map((v, i) => (
                <tr key={`${v.sku}-${i}`} className="hover:bg-white/[0.02]">
                  <td className="px-3 py-2 font-mono text-xs text-clay">{v.sku}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline">{v.size}</Badge>
                  </td>
                  <td className="px-3 py-2">{v.color}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={v.priceNAD}
                      onChange={(e) => updateField(i, 'priceNAD', Number(e.target.value))}
                      className="w-24 rounded-lg border border-white/10 bg-transparent px-2 py-1 text-sm text-sand tabular-nums focus:border-ivory focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={v.compareAtPriceNAD ?? ''}
                      placeholder="—"
                      onChange={(e) =>
                        updateField(
                          i,
                          'compareAtPriceNAD',
                          e.target.value === '' ? null : Number(e.target.value),
                        )
                      }
                      className="w-24 rounded-lg border border-white/10 bg-transparent px-2 py-1 text-sm text-sand tabular-nums focus:border-ivory focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={v.stock}
                      onChange={(e) => updateField(i, 'stock', Number(e.target.value))}
                      className="w-20 rounded-lg border border-white/10 bg-transparent px-2 py-1 text-sm text-sand tabular-nums focus:border-ivory focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={v.isActive}
                      onChange={(e) => updateField(i, 'isActive', e.target.checked)}
                      className="h-4 w-4 cursor-pointer accent-ivory"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
