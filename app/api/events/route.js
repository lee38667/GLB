import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import Event from '../../../src/models/Event'
import { ensureAdminAccess } from '../../../lib/apiAuth'

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')

    let query = {}
    if (status) query.status = status
    if (featured === 'true') query.featured = true

    const events = await Event.find(query).sort({ createdAt: -1 })

    return NextResponse.json(
      {
        success: true,
        count: events.length,
        data: events,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  const unauthorizedResponse = ensureAdminAccess(request)
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    await dbConnect()

    const body = await request.json()
    const event = await Event.create(body)

    return NextResponse.json(
      {
        success: true,
        data: event,
        message: 'Event created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Event creation error:', error)

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message)
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
