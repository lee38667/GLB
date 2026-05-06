# Phase 3 Completion — Cart Upgrade + Admin Orders

**Date:** 2026-04-18
**Scope:** Finish Phase 3 (Checkout & Orders) by upgrading CartContext to variant-aware v2, removing all LEGACY_PRODUCTS references from cart/checkout, and building the admin orders list + detail pages.

---

## 1. CartContext — CartLine v2

### Problem
CartContext is still in Phase 0 mode: `CartLine = { id, qty }`. Cart and checkout pages resolve product display data (name, price, image) from a hardcoded `LEGACY_PRODUCTS` array. MongoDB-backed products added via the Phase 2 shop will never resolve correctly.

### Solution: Snapshot on add
Capture display data at add-to-cart time. Standard e-commerce practice (Shopify, etc.). No API calls on cart render. Acceptable staleness risk for a small clothing brand.

### New CartLine type
```ts
type CartLine = {
  productId: string    // MongoDB _id
  variantSku: string   // globally unique — used as the cart item key
  qty: number
  title: string        // product title, e.g. "Oversized Tee"
  variantLabel: string // e.g. "M / Black"
  priceNAD: number     // snapshotted at add time
  image?: string       // Cloudinary URL (may be absent for legacy products)
  handle: string       // for /shop/[handle] links
}
```

### CartApi changes
- `add(line: Omit<CartLine, 'qty'>, qty?: number)` — replaces `add(id: string)`
- `remove(variantSku: string)` — was `remove(id: string)`
- `change(variantSku: string, delta: number)` — was `change(id: string, delta: number)`
- Deduplication: if same `variantSku` is added again, increment qty
- Storage key: `glbecom_cart_v2` (v1 silently abandoned — incompatible shape)
- `CartLine` no longer has `id` field

---

## 2. ProductDetail update

**File:** `app/shop/[handle]/_components/ProductDetail.tsx`

- `handleAddToCart` passes full snapshot:
  ```ts
  add({
    productId: p.id,
    variantSku: selectedVariant.sku,
    variantLabel: `${selectedSize} / ${selectedColor}`,
    title: p.title,
    priceNAD: selectedVariant.priceNAD,
    image: p.images[0]?.url,
    handle: p.handle,
  }, qty)
  ```
- Add guard: disable "Add to Cart" button if `selectedVariant` is null or `selectedVariant.stock < 1`

---

## 3. Cart page update

**File:** `app/cart/page.tsx`

- Remove `LEGACY_PRODUCTS` import
- Render directly from `CartLine` fields: `title`, `priceNAD`, `image`, `variantLabel`
- Product image: uses `line.image` (Cloudinary URL); show a placeholder div if absent
- Product name renders as a link to `/shop/${line.handle}`
- `remove` / `change` key on `line.variantSku`
- Subtotal: `line.priceNAD * line.qty` (no lookup needed)

---

## 4. Checkout page update

**File:** `app/checkout/page.tsx`

- Remove `LEGACY_PRODUCTS` import (two occurrences in order summary + handleSubmit)
- Order summary sidebar: render from `CartLine` fields directly
- `handleSubmit` items already maps correctly once `LEGACY_PRODUCTS` lookup is removed:
  ```ts
  const items = cart.map((line) => ({
    productId: line.productId,
    variantSku: line.variantSku,
    qty: line.qty,
  }))
  ```

---

## 5. Admin Orders pages

### 5a. Orders list — `app/admin/orders/page.tsx`

**Data:** `GET /api/admin/orders?status=&page=&pageSize=20`

**UI:**
- Filter bar: status dropdown (all / pending / paid / fulfilled / shipped / delivered / refunded / cancelled) + text search input (filters by order number prefix or email)
- Table columns: Order #, Customer email, Date, Items (count), Total (N$), Status badge, View link
- Status badge colours: pending=amber, paid/delivered=green, fulfilled/shipped=blue, refunded=orange, cancelled=red
- Pagination: previous / next controls, shows "Page X of Y"
- Empty state: "No orders found" with clear-filter link if filters are active
- TypeScript `.tsx`, follows existing admin dark-theme visual style

### 5b. Order detail — `app/admin/orders/[id]/page.tsx`

**Data:**
- `GET /api/admin/orders/[id]` on mount
- `PATCH /api/admin/orders/[id]` for status/tracking updates
- `POST /api/admin/orders/[id]/resend-email` for email resend

**Sections:**
1. **Header** — order number, status badge, created date
2. **Status updater** — dropdown of all valid statuses + Save button; shows tracking number input when status is `shipped` or `delivered`
3. **Resend email** — button "Resend confirmation" that calls the resend endpoint; shows success/error toast
4. **Line items table** — thumbnail (60×60), title + variant label, qty, unit price (N$), line total (N$)
5. **Totals** — subtotal, shipping, total in N$
6. **Shipping address card** — name, address lines, city/region/postal, country, phone
7. **Payment info card** — reference (monospace), provider, paid-at timestamp (or "Unpaid")

**New API route needed:** `POST /api/admin/orders/[id]/resend-email`
- Auth-guarded (isAuthorizedAdmin)
- Calls `sendOrderConfirmation(order)` from `src/lib/email/order-confirmation.ts`
- Returns `{ success: true }` or error

### 5c. Navigation

Add Orders link to `app/admin/page.js` dashboard alongside existing Products/Events/RSVP entries.

---

## Out of scope

- Full Phase 5 admin analytics rebuild (orders dashboard with charts, finance view) — deferred
- Auth.js user accounts (Phase 4)
- Inventory alerts or low-stock warnings — Phase 5
