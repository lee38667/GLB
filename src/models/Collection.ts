import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'

const CollectionSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only'],
    },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, default: '' },
    heroImage: { type: String },
    position: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    seo: {
      title: { type: String, maxlength: 70 },
      description: { type: String, maxlength: 200 },
    },
  },
  { timestamps: true },
)

export type CollectionDoc = InferSchemaType<typeof CollectionSchema> & {
  _id: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

type CollectionModel = Model<CollectionDoc>

export const Collection: CollectionModel =
  (mongoose.models.Collection as CollectionModel | undefined) ??
  mongoose.model<CollectionDoc>('Collection', CollectionSchema)

export default Collection
