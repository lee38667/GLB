import mongoose from 'mongoose'

// IMPORTANT: do NOT hard-code credentials in source. Provide the connection
// string via environment variables (Netlify Site settings -> Environment).
const rawMongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL

/**
 * Ensure the Mongo connection string includes a supported protocol prefix.
 * Some hosting dashboards trim the "mongodb://" portion; this normalises it.
 */
function normaliseMongoUri(uri) {
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable in your deployment environment')
  }

  const trimmed = uri.trim()

  if (/^mongodb(\+srv)?:\/\//i.test(trimmed)) {
    return trimmed
  }

  // Permit bare host strings for local development (e.g. localhost:27017/db)
  if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])[:/]/i.test(trimmed)) {
    return `mongodb://${trimmed}`
  }

  throw new Error(
    'Invalid MongoDB connection string. Ensure it begins with "mongodb://" or "mongodb+srv://".'
  )
}

const MONGODB_URI = normaliseMongoUri(rawMongoUri)

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect
