/**
 * Seed script: migrates the 7 hardcoded products from src/data/products.js
 * into MongoDB with generated variant matrices.
 *
 * Run:  pnpm seed:products
 * (Requires MONGODB_URI in .env.local)
 */

import 'dotenv/config'
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set. Add it to .env.local.')
  process.exit(1)
}

const ImageSchema = new mongoose.Schema(
  { url: String, publicId: String, alt: { type: String, default: '' }, position: { type: Number, default: 0 } },
  { _id: false },
)
const VariantSchema = new mongoose.Schema(
  {
    sku: String,
    size: String,
    color: String,
    priceNAD: Number,
    compareAtPriceNAD: { type: Number, default: null },
    stock: { type: Number, default: 0 },
    weightGrams: Number,
    barcode: String,
    isActive: { type: Boolean, default: true },
  },
  { _id: false },
)
const SeoSchema = new mongoose.Schema(
  { title: String, description: String, ogImage: String },
  { _id: false },
)
const StatsSchema = new mongoose.Schema(
  { views: { type: Number, default: 0 }, addsToCart: { type: Number, default: 0 }, purchases: { type: Number, default: 0 } },
  { _id: false },
)
const ProductSchema = new mongoose.Schema(
  {
    handle: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    collection: { type: String, default: '', index: true },
    categories: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    images: { type: [ImageSchema], default: [] },
    variants: { type: [VariantSchema] },
    defaultVariantSku: { type: String, required: true },
    seo: { type: SeoSchema, default: () => ({}) },
    stats: { type: StatsSchema, default: () => ({}) },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'active', index: true },
    publishedAt: { type: Date },
  },
  { timestamps: true },
)
ProductSchema.index({ status: 1, publishedAt: -1 })

const Product = mongoose.model('Product', ProductSchema)

type LegacySpec = { label: string; value: string }
type LegacyProduct = {
  id: string
  name: string
  collection: string
  price: number
  file: string
  description: string
  specs: LegacySpec[]
}

const LEGACY: LegacyProduct[] = [
  {
    id: 'bestipink',
    name: 'GLB Classic Tee — Pink',
    collection: 'GLB Classic',
    price: 250,
    file: 'bestipink.jpg',
    description: 'Part of the GLB Classic range seen in the catalogue — bold colours that spell out Give. Love. Back. on ultra-soft cotton.',
    specs: [
      { label: 'Collection', value: 'GLB Classic' },
      { label: 'Material', value: '100% Combed Ring-Spun Cotton (180gsm)' },
      { label: 'Fit', value: 'Unisex, Regular' },
      { label: 'Sizes', value: 'S, M, L, XL' },
      { label: 'Colors', value: 'Pink, Purple, Black, White, Blue' },
      { label: 'SKU', value: 'GLB-TEE-CLSC-PNK' },
    ],
  },
  {
    id: 'bestiepurple',
    name: 'GLB Classic Tee — Purple',
    collection: 'GLB Classic',
    price: 250,
    file: 'bestipurple.jpg',
    description: 'A premium tee inspired by the GLB Classic story — statement typography, saturated hues, and a reminder to give love back.',
    specs: [
      { label: 'Collection', value: 'GLB Classic' },
      { label: 'Material', value: '100% Combed Ring-Spun Cotton (180gsm)' },
      { label: 'Fit', value: 'Unisex, Regular' },
      { label: 'Sizes', value: 'S, M, L, XL' },
      { label: 'Colors', value: 'Pink, Purple, Black, White, Blue' },
      { label: 'SKU', value: 'GLB-TEE-CLSC-PUR' },
    ],
  },
  {
    id: 'classicblack',
    name: 'Embrace It Tee — Black',
    collection: 'Embrace It',
    price: 200,
    file: 'classicblack.jpg',
    description: 'From the Embrace It capsule — designed to "wear your truth" and keep love front and centre in everyday fits.',
    specs: [
      { label: 'Collection', value: 'Embrace It' },
      { label: 'Material', value: '100% Cotton (180gsm)' },
      { label: 'Fit', value: 'Unisex, Regular' },
      { label: 'Sizes', value: 'S, M, L, XL' },
      { label: 'Colors', value: 'Black, Brown, White, Purple, Green' },
      { label: 'SKU', value: 'GLB-TEE-EMB-BLK' },
    ],
  },
  {
    id: 'classicwhite',
    name: 'Embrace It Tee — White',
    collection: 'Embrace It',
    price: 200,
    file: 'classicwhite.jpg',
    description: 'Lightweight edition of the Embrace It drop — built for those who meet every moment head-on with compassion.',
    specs: [
      { label: 'Collection', value: 'Embrace It' },
      { label: 'Material', value: '100% Cotton (180gsm)' },
      { label: 'Fit', value: 'Unisex, Regular' },
      { label: 'Sizes', value: 'S, M, L, XL' },
      { label: 'Colors', value: 'Black, Brown, White, Purple, Green' },
      { label: 'SKU', value: 'GLB-TEE-EMB-WHT' },
    ],
  },
  {
    id: 'totebag',
    name: 'Give Love Back Tote',
    collection: 'Accessories',
    price: 180,
    file: 'totebag.jpg',
    description: 'As seen in the Accessories section — heavy-duty canvas that carries groceries, books, or creative tools with meaning.',
    specs: [
      { label: 'Collection', value: 'Accessories' },
      { label: 'Material', value: '100% Cotton Canvas (12oz)' },
      { label: 'Size', value: '38 × 42 cm (handles 66 cm)' },
      { label: 'Colors', value: 'Beige' },
      { label: 'SKU', value: 'GLB-TOTE-ACC' },
    ],
  },
  {
    id: 'truckerblack',
    name: 'Trucker Hat — Black',
    collection: 'Accessories',
    price: 200,
    file: 'truckerblack.jpg',
    description: 'Crowned in the Accessories spread — mesh-backed trucker with the GLB mantra, ready for block parties and pop-ups.',
    specs: [
      { label: 'Collection', value: 'Accessories' },
      { label: 'Crown', value: '5-panel, mid profile' },
      { label: 'Closure', value: 'Adjustable snapback' },
      { label: 'Colors', value: 'Black, Beige, Grey' },
      { label: 'SKU', value: 'GLB-CAP-ACC-BLK' },
    ],
  },
  {
    id: 'truckerwhite',
    name: 'Trucker Hat — Beige',
    collection: 'Accessories',
    price: 200,
    file: 'truckerwhite.jpg',
    description: 'A softer take on the GLB crown — same breathable build, finished in the beige colourway from the catalogue.',
    specs: [
      { label: 'Collection', value: 'Accessories' },
      { label: 'Crown', value: '5-panel, mid profile' },
      { label: 'Closure', value: 'Adjustable snapback' },
      { label: 'Colors', value: 'Black, Beige, Grey' },
      { label: 'SKU', value: 'GLB-CAP-ACC-BEG' },
    ],
  },
]

function parseSizes(specs: LegacySpec[]): string[] {
  const s = specs.find((sp) => sp.label === 'Sizes')?.value
  if (!s) return ['One Size']
  return s.split(',').map((v) => v.trim()).filter(Boolean)
}

function parseColors(specs: LegacySpec[]): string[] {
  const c = specs.find((sp) => sp.label === 'Colors')?.value
  if (!c) return ['Default']
  return c.split(',').map((v) => v.trim()).filter(Boolean)
}

function toHandle(id: string, name: string): string {
  return name
    .toLowerCase()
    .replace(/—/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || id
}

function skuFor(base: string, size: string, color: string) {
  const s = size.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
  const c = color.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
  return `${base}-${s}-${c}`
}

async function main() {
  console.log('Connecting to MongoDB…')
  await mongoose.connect(MONGODB_URI!)
  console.log('Connected.')

  for (const lp of LEGACY) {
    const handle = toHandle(lp.id, lp.name)
    const existing = await Product.findOne({ handle })
    if (existing) {
      console.log(`  ⏭  "${lp.name}" already exists (handle: ${handle})`)
      continue
    }

    const sizes = parseSizes(lp.specs)
    const colors = parseColors(lp.specs)
    const baseSku = lp.specs.find((sp) => sp.label === 'SKU')?.value ?? lp.id.toUpperCase()

    const variants = []
    for (const size of sizes) {
      for (const color of colors) {
        variants.push({
          sku: skuFor(baseSku, size, color),
          size,
          color,
          priceNAD: lp.price,
          compareAtPriceNAD: null,
          stock: 10,
          isActive: true,
        })
      }
    }

    const categories: string[] = []
    const collection = lp.collection
    if (collection === 'GLB Classic' || collection === 'Embrace It') categories.push('Tees')
    if (collection === 'Accessories') {
      if (lp.name.toLowerCase().includes('tote')) categories.push('Bags')
      else if (lp.name.toLowerCase().includes('hat') || lp.name.toLowerCase().includes('trucker'))
        categories.push('Hats')
    }

    await Product.create({
      handle,
      title: lp.name,
      description: lp.description,
      collection,
      categories,
      tags: ['seed', collection.toLowerCase().replace(/\s/g, '-')],
      images: [{ url: `/assets/${lp.file}`, alt: lp.name, position: 0 }],
      variants,
      defaultVariantSku: variants[0]!.sku,
      status: 'active',
      publishedAt: new Date(),
    })

    console.log(`  ✓  Seeded "${lp.name}" (${variants.length} variants)`)
  }

  const count = await Product.countDocuments()
  console.log(`\nDone. ${count} total products in DB.`)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
