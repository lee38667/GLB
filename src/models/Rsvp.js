import mongoose from 'mongoose'

const RsvpSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
    },
    eventTitle: {
      type: String,
      required: [true, 'Event title is required'],
    },
    eventDate: {
      type: String,
      required: [true, 'Event date is required'],
    },
    guests: {
      type: Number,
      default: 1,
      min: [1, 'Must have at least 1 guest'],
      max: [10, 'Maximum 10 guests allowed'],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot be more than 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
)

// Prevent model recompilation in development
export default mongoose.models.Rsvp || mongoose.model('Rsvp', RsvpSchema)
