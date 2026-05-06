import mongoose, { type Mongoose } from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

type Cache = { conn: Mongoose | null; promise: Promise<Mongoose> | null }
const globalForMongo = global as unknown as { __mongoose?: Cache }
const cache: Cache = globalForMongo.__mongoose ?? { conn: null, promise: null }
if (!globalForMongo.__mongoose) globalForMongo.__mongoose = cache

export async function connectDb(): Promise<Mongoose> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Add it to .env.local.')
  }
  if (cache.conn) return cache.conn
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }
  cache.conn = await cache.promise
  return cache.conn
}
