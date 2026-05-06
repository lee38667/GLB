import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'

const AddressSchema = new Schema(
  {
    name: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    region: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, minlength: 2, maxlength: 2 },
    phone: { type: String, required: true },
  },
  { _id: false },
)

const LineItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    variantSku: { type: String, required: true },
    title: { type: String, required: true },
    priceNAD: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    image: { type: String },
  },
  { _id: false },
)

const OrderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: { type: String, default: null },
    guestEmail: { type: String, default: null },
    lineItems: {
      type: [LineItemSchema],
      validate: [
        (v: unknown[]) => Array.isArray(v) && v.length > 0,
        'At least one line item is required',
      ],
    },
    subtotalNAD: { type: Number, required: true, min: 0 },
    shippingNAD: { type: Number, default: 0, min: 0 },
    taxNAD: { type: Number, default: 0, min: 0 },
    totalNAD: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'NAD' },
    shippingAddress: { type: AddressSchema, required: true },
    billingAddress: { type: AddressSchema },
    status: {
      type: String,
      enum: ['pending', 'paid', 'fulfilled', 'shipped', 'delivered', 'refunded', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentProvider: { type: String, default: 'paystack' },
    paymentReference: { type: String, index: true },
    paidAt: { type: Date },
    trackingNumber: { type: String },
    notes: { type: String },
  },
  { timestamps: true },
)

OrderSchema.index({ userId: 1, createdAt: -1 })
OrderSchema.index({ guestEmail: 1, createdAt: -1 })
OrderSchema.index({ status: 1, createdAt: -1 })

export type OrderDoc = InferSchemaType<typeof OrderSchema> & {
  _id: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

type OrderModel = Model<OrderDoc>

const globalForOrder = global as unknown as { __OrderModel?: OrderModel }

export const Order: OrderModel =
  globalForOrder.__OrderModel ??
  ((mongoose.models.Order as OrderModel | undefined) ??
    mongoose.model<OrderDoc>('Order', OrderSchema))

if (process.env.NODE_ENV !== 'production') {
  globalForOrder.__OrderModel = Order
}

export default Order
