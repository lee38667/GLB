import mongoose from 'mongoose'

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide event title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide event description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    date: {
      type: String,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    entrance: {
      type: String,
    },
    capacity: {
      type: Number,
      min: [1, 'Capacity must be at least 1'],
    },
    tags: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rsvpCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Generate slug before saving
EventSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  next()
})

export default mongoose.models.Event || mongoose.model('Event', EventSchema)
