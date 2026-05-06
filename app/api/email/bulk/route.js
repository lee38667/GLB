import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/mongodb'
import Rsvp from '../../../../src/models/Rsvp'
import { sendBulkEmail } from '../../../../lib/email'
import { ensureAdminAccess } from '../../../../lib/apiAuth'

export async function POST(request) {
  const unauthorizedResponse = ensureAdminAccess(request)
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    await dbConnect()

    const body = await request.json()
    const { eventTitle, subject, message, recipientFilter } = body

    // Validate required fields
    if (!subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Subject and message are required' },
        { status: 400 }
      )
    }

    // Build query
    let query = {}
    if (eventTitle) {
      query.eventTitle = eventTitle
    }
    if (recipientFilter) {
      query.status = recipientFilter // e.g., 'confirmed', 'pending'
    }

    // Get recipients
    const rsvps = await Rsvp.find(query).select('email')
    const recipients = rsvps.map((rsvp) => rsvp.email)

    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No recipients found' },
        { status: 404 }
      )
    }

    // Send bulk email
    await sendBulkEmail({
      recipients,
      subject,
      message,
      eventTitle: eventTitle || 'GLB Event Update',
    })

    return NextResponse.json(
      {
        success: true,
        message: `Email sent to ${recipients.length} recipients`,
        count: recipients.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Bulk email error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send bulk email' },
      { status: 500 }
    )
  }
}
