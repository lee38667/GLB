'use client'

import Image from 'next/image'
import { useRef, type Dispatch, type SetStateAction } from 'react'
import { toast } from 'sonner'
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload'
import { cn } from '@/lib/cn'

export type ImageItem = {
  url: string
  publicId?: string
  alt: string
  position: number
}

type Props = {
  images: ImageItem[]
  setImages: Dispatch<SetStateAction<ImageItem[]>>
  folder?: string
  maxImages?: number
}

export function ImageUploader({ images, setImages, folder, maxImages = 10 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { uploading, progress, upload } = useCloudinaryUpload(folder)

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    const toUpload = Array.from(files).slice(0, maxImages - images.length)
    if (toUpload.length === 0) {
      toast.error(`Maximum ${maxImages} images`)
      return
    }

    for (const file of toUpload) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`)
        continue
      }
      const result = await upload(file)
      if (result) {
        setImages((prev) => [
          ...prev,
          {
            url: result.secure_url,
            publicId: result.public_id,
            alt: '',
            position: prev.length,
          },
        ])
      }
    }
  }

  const remove = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx).map((img, i) => ({ ...img, position: i })))
  }

  const moveUp = (idx: number) => {
    if (idx === 0) return
    setImages((prev) => {
      const next = [...prev]
      ;[next[idx - 1]!, next[idx]!] = [next[idx]!, next[idx - 1]!]
      return next.map((img, i) => ({ ...img, position: i }))
    })
  }

  const updateAlt = (idx: number, alt: string) => {
    setImages((prev) => prev.map((img, i) => (i === idx ? { ...img, alt } : img)))
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex flex-wrap gap-3">
        {images.map((img, idx) => (
          <div
            key={`${img.url}-${idx}`}
            className="group relative h-32 w-32 overflow-hidden rounded-xl border border-white/10 bg-white/5"
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              sizes="128px"
              className="object-cover"
            />
            {idx === 0 && (
              <span className="absolute left-1 top-1 rounded-md bg-ivory/90 px-1.5 py-0.5 text-[0.55rem] font-bold uppercase text-ink">
                Main
              </span>
            )}
            <div className="absolute inset-0 flex items-end gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => moveUp(idx)}
                  className="rounded bg-white/20 px-1.5 py-0.5 text-[0.6rem] text-sand backdrop-blur hover:bg-white/40"
                >
                  ←
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(idx)}
                className="rounded bg-red-500/50 px-1.5 py-0.5 text-[0.6rem] text-white backdrop-blur hover:bg-red-500"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              'flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 text-clay transition hover:border-ivory hover:text-sand',
              uploading && 'opacity-50',
            )}
          >
            {uploading ? (
              <>
                <span className="text-sm">{progress}%</span>
                <span className="text-[0.6rem]">Uploading…</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-[0.6rem] uppercase tracking-[0.2em]">Upload</span>
              </>
            )}
          </button>
        )}
      </div>

      {images.length > 0 && (
        <div className="space-y-2">
          {images.map((img, idx) => (
            <div key={`alt-${idx}`} className="flex items-center gap-2 text-xs">
              <span className="w-20 shrink-0 truncate text-tide">{idx === 0 ? 'Main' : `Image ${idx + 1}`}</span>
              <input
                type="text"
                value={img.alt}
                onChange={(e) => updateAlt(idx, e.target.value)}
                placeholder="Alt text (accessibility)"
                className="flex-1 rounded-lg border border-white/10 bg-transparent px-2 py-1 text-sm text-sand focus:border-ivory focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
