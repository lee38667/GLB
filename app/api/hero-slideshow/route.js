import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'])

export async function GET() {
  try {
    const baseDir = path.join(process.cwd(), 'public', 'hero-slideshow')

    let stat
    try {
      stat = await fs.stat(baseDir)
    } catch {
      return NextResponse.json({ success: true, data: [] }, { status: 200 })
    }

    if (!stat.isDirectory()) {
      return NextResponse.json(
        { success: false, error: 'hero-slideshow is not a directory' },
        { status: 400 }
      )
    }

    const entries = await fs.readdir(baseDir, { withFileTypes: true })

    const images = entries
      .filter((entry) => entry.isFile() && IMAGE_EXTS.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => `/hero-slideshow/${entry.name}`)
      .sort((a, b) => a.localeCompare(b))

    return NextResponse.json({ success: true, data: images }, { status: 200 })
  } catch (error) {
    console.error('Error loading hero slideshow:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load hero slideshow images' },
      { status: 500 }
    )
  }
}
