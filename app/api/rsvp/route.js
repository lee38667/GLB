import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import Rsvp from '../../../src/models/Rsvp'
import { sendRsvpConfirmation, notifyAdminNewRsvp } from '../../../lib/email'
import { ensureAdminAccess } from '../../../lib/apiAuth'

export async function POST(request) {
  try {
    // Connect to database
    await dbConnect()

    // Parse request body
    const body = await request.json()
    const { name, email, phone, eventTitle, eventDate, guests, message } = body

    // Validate required fields
    if (!name || !email || !eventTitle || !eventDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create RSVP
    const rsvp = await Rsvp.create({
      name,
      email,
      phone: phone || '',
      eventTitle,
      eventDate,
      guests: guests || 1,
      message: message || '',
      status: 'pending',
    })

    // Send confirmation email to user (async, don't block response)
    try {
      await sendRsvpConfirmation({ name, email, eventTitle, eventDate, guests: guests || 1 })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the RSVP if email fails
    }

    // Notify admin (async, don't block response)
    try {
      await notifyAdminNewRsvp({ name, email, phone, eventTitle, eventDate, guests: guests || 1, message })
    } catch (emailError) {
      console.error('Failed to notify admin:', emailError)
      // Don't fail the RSVP if email fails
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: rsvp._id,
          name: rsvp.name,
          email: rsvp.email,
          eventTitle: rsvp.eventTitle,
          eventDate: rsvp.eventDate,
        },
        message: 'RSVP submitted successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('RSVP submission error:', error)

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message)
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      )
    }

    // Handle duplicate entries (if email index exists)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "You have already RSVP'd for this event" },
        { status: 409 }
      )
    }

    // Generic error
    return NextResponse.json(
      { success: false, error: 'Failed to submit RSVP. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  const unauthorizedResponse = ensureAdminAccess(request)
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    await dbConnect()

    const rsvps = await Rsvp.find({}).sort({ createdAt: -1 }).limit(100)

    return NextResponse.json(
      {
        success: true,
        count: rsvps.length,
        data: rsvps,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching RSVPs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch RSVPs' },
      { status: 500 }
    )
  }
}
