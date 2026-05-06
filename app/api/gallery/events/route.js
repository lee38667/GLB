import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'])

function toTitle(str) {
  return str
    .replace(/[\-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function GET() {
  try {
    const baseDir = path.join(process.cwd(), 'public', 'eventFolder')

    let stat
    try {
      stat = await fs.stat(baseDir)
    } catch {
      // Folder doesn't exist yet
      return NextResponse.json({ success: true, data: { events: [] } }, { status: 200 })
    }

    if (!stat.isDirectory()) {
      return NextResponse.json(
        { success: false, error: 'eventFolder is not a directory' },
        { status: 400 }
      )
    }

    const entries = await fs.readdir(baseDir, { withFileTypes: true })
    const events = []

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const dirName = entry.name
      const eventDir = path.join(baseDir, dirName)
      const files = await fs.readdir(eventDir, { withFileTypes: true })

      const images = files
        .filter((f) => f.isFile() && IMAGE_EXTS.has(path.extname(f.name).toLowerCase()))
        .map((f) => ({
          title: path.parse(f.name).name,
          url: path.posix.join('/eventFolder', dirName.replace(/\\/g, '/'), f.name),
        }))

      events.push({
        slug: dirName,
        name: toTitle(dirName),
        images,
      })
    }

    // Sort events by name for stable UI
    events.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({ success: true, data: { events } }, { status: 200 })
  } catch (error) {
    console.error('Error reading event gallery:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load event gallery' },
      { status: 500 }
    )
  }
}
