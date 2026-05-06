export type { ProductInput, VariantInput, ImageInput } from '@/lib/validators/product'
export type { Address, LineItem, OrderInput } from '@/lib/validators/order'
export type { CheckoutInput } from '@/lib/validators/checkout'
export type { Size, OrderStatus, ProductStatus } from '@/lib/constants'

export type Id<T extends string = string> = T & { readonly __brand: 'Id' }

export type Paginated<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type ApiError = { error: string; fields?: Record<string, string[]> }
export type ApiResult<T> = { data: T } | ApiError
