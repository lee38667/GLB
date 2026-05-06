import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/mongodb'
import Rsvp from '../../../../src/models/Rsvp'
import { ensureAdminAccess } from '../../../../lib/apiAuth'

export async function PATCH(request, { params }) {
  const unauthorizedResponse = ensureAdminAccess(request)
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    await dbConnect()

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    const rsvp = await Rsvp.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )

    if (!rsvp) {
      return NextResponse.json(
        { success: false, error: 'RSVP not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: rsvp,
        message: 'RSVP updated successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating RSVP:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update RSVP' },
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

    const rsvp = await Rsvp.findByIdAndDelete(id)

    if (!rsvp) {
      return NextResponse.json(
        { success: false, error: 'RSVP not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'RSVP deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting RSVP:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete RSVP' },
      { status: 500 }
    )
  }
}
