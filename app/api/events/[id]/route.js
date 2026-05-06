import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/mongodb'
import Event from '../../../../src/models/Event'
import { ensureAdminAccess } from '../../../../lib/apiAuth'

export async function GET(request, { params }) {
  try {
    await dbConnect()

    const { id } = await params
    const event = await Event.findById(id)

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: event,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  const unauthorizedResponse = ensureAdminAccess(request)
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    await dbConnect()

    const { id } = await params
    const body = await request.json()

    const event = await Event.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: event,
        message: 'Event updated successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  const unauthorizedResponse = ensureAdminAccess(request)
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    await dbConnect()

    const { id } = await params
    const event = await Event.findByIdAndDelete(id)

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Event deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
