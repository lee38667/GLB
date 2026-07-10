import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'

export const SOCIAL_PLATFORMS = ['instagram', 'facebook', 'tiktok'] as const
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]

const MetricsSchema = new Schema(
  {
    followers: { type: Number, default: 0 },
    following: { type: Number },
    posts: { type: Number },
    reach28d: { type: Number },
    impressions28d: { type: Number },
    profileViews28d: { type: Number },
    engagement28d: { type: Number },
  },
  { _id: false },
)

const SocialAccountSchema = new Schema(
  {
    platform: { type: String, enum: SOCIAL_PLATFORMS, required: true, unique: true },
    handle: { type: String, required: true, trim: true },
    externalId: { type: String, required: true },
    accessToken: { type: String, required: true },
    tokenExpiresAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['connected', 'error', 'disconnected'],
      default: 'connected',
    },
    lastSyncedAt: { type: Date, default: null },
    lastError: { type: String, default: null },
    latest: { type: MetricsSchema, default: null },
  },
  { timestamps: true },
)

const SocialSnapshotSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: 'SocialAccount', required: true, index: true },
    platform: { type: String, enum: SOCIAL_PLATFORMS, required: true },
    capturedAt: { type: Date, default: () => new Date(), index: true },
    metrics: { type: MetricsSchema, required: true },
  },
  { timestamps: false },
)
SocialSnapshotSchema.index({ accountId: 1, capturedAt: -1 })

export type SocialMetrics = InferSchemaType<typeof MetricsSchema>
export type SocialAccountDoc = InferSchemaType<typeof SocialAccountSchema> & {
  _id: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}
export type SocialSnapshotDoc = InferSchemaType<typeof SocialSnapshotSchema> & {
  _id: mongoose.Types.ObjectId
}

type SocialAccountModel = Model<SocialAccountDoc>
type SocialSnapshotModel = Model<SocialSnapshotDoc>

const g = global as unknown as {
  __SocialAccountModel?: SocialAccountModel
  __SocialSnapshotModel?: SocialSnapshotModel
}

export const SocialAccount: SocialAccountModel =
  g.__SocialAccountModel ??
  ((mongoose.models.SocialAccount as SocialAccountModel | undefined) ??
    mongoose.model<SocialAccountDoc>('SocialAccount', SocialAccountSchema))

export const SocialSnapshot: SocialSnapshotModel =
  g.__SocialSnapshotModel ??
  ((mongoose.models.SocialSnapshot as SocialSnapshotModel | undefined) ??
    mongoose.model<SocialSnapshotDoc>('SocialSnapshot', SocialSnapshotSchema))

if (process.env.NODE_ENV !== 'production') {
  g.__SocialAccountModel = SocialAccount
  g.__SocialSnapshotModel = SocialSnapshot
}
