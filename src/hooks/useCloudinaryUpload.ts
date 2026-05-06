'use client'

import { useState, useCallback } from 'react'

type CloudinaryUploadResult = {
  secure_url: string
  public_id: string
  width: number
  height: number
}

type UploadState = { uploading: boolean; progress: number; error: string | null }

function adminHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {}
  const key = window.localStorage.getItem('glb_admin_key') ?? ''
  return key ? { 'x-admin-key': key, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

export function useCloudinaryUpload(folder = 'glb/products') {
  const [state, setState] = useState<UploadState>({ uploading: false, progress: 0, error: null })

  const upload = useCallback(
    async (file: File): Promise<CloudinaryUploadResult | null> => {
      setState({ uploading: true, progress: 0, error: null })
      try {
        const signRes = await fetch('/api/admin/cloudinary-sign', {
          method: 'POST',
          headers: adminHeaders(),
          body: JSON.stringify({ folder }),
        })
        if (!signRes.ok) throw new Error('Failed to get upload signature')
        const { data: sig } = await signRes.json()

        const fd = new FormData()
        fd.append('file', file)
        fd.append('timestamp', String(sig.timestamp))
        fd.append('signature', sig.signature)
        fd.append('api_key', sig.apiKey)
        fd.append('folder', sig.folder)

        const xhr = new XMLHttpRequest()
        const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              setState((s) => ({ ...s, progress: Math.round((e.loaded / e.total) * 100) }))
            }
          })
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText) as CloudinaryUploadResult)
            } else {
              reject(new Error('Upload failed'))
            }
          })
          xhr.addEventListener('error', () => reject(new Error('Upload failed')))
          xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`)
          xhr.send(fd)
        })

        setState({ uploading: false, progress: 100, error: null })
        return result
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setState({ uploading: false, progress: 0, error: msg })
        return null
      }
    },
    [folder],
  )

  return { ...state, upload }
}
