import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import Gallery from '../../../src/models/Gallery'

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const eventId = searchParams.get('event')
    const featured = searchParams.get('featured')

    let query = {}
    if (type) query.type = type
    if (eventId) query.event = eventId
    if (featured === 'true') query.featured = true

    const gallery = await Gallery.find(query).sort({ order: 1, createdAt: -1 }).populate('event')

    return NextResponse.json(
      {
        success: true,
        count: gallery.length,
        data: gallery,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gallery' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    await dbConnect()

    const body = await request.json()
    const galleryItem = await Gallery.create(body)

    return NextResponse.json(
      {
        success: true,
        data: galleryItem,
        message: 'Gallery item created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Gallery creation error:', error)

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message)
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create gallery item' },
      { status: 500 }
    )
  }
}
