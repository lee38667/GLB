import { v2 as cloudinary } from 'cloudinary'

let configured = false

function ensureConfigured() {
  if (configured) return
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME
  const api_key = process.env.CLOUDINARY_API_KEY
  const api_secret = process.env.CLOUDINARY_API_SECRET
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      'Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.local.',
    )
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true })
  configured = true
}

export type CloudinarySignature = {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
  folder: string
}

export function signUpload(folder = 'glb/products'): CloudinarySignature {
  ensureConfigured()
  const timestamp = Math.round(Date.now() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!,
  )
  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    folder,
  }
}

export async function destroyAsset(publicId: string): Promise<void> {
  ensureConfigured()
  await cloudinary.uploader.destroy(publicId)
}

export function cldUrl(publicId: string, transforms = 'f_auto,q_auto'): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME
  if (!cloud) return publicId
  return `https://res.cloudinary.com/${cloud}/image/upload/${transforms}/${publicId}`
}
