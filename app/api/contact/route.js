import { NextResponse } from 'next/server'

import { sendContactMessage, sendNewsletterSignup } from '../../../lib/email'

function normalize(input) {
    return String(input || '').trim()
}

function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request) {
    try {
        const body = await request.json()
        const type = normalize(body?.type || 'contact')

        if (type === 'newsletter') {
            const email = normalize(body?.email).toLowerCase()

            if (!email || !validEmail(email)) {
                return NextResponse.json(
                    { success: false, error: 'A valid email is required.' },
                    { status: 400 },
                )
            }

            await sendNewsletterSignup({ email })

            return NextResponse.json(
                { success: true, message: 'Signup received.' },
                { status: 201 },
            )
        }

        const name = normalize(body?.name)
        const email = normalize(body?.email).toLowerCase()
        const message = normalize(body?.message)

        if (!name || !email || !message) {
            return NextResponse.json(
                { success: false, error: 'Name, email, and message are required.' },
                { status: 400 },
            )
        }

        if (!validEmail(email)) {
            return NextResponse.json(
                { success: false, error: 'A valid email is required.' },
                { status: 400 },
            )
        }

        await sendContactMessage({ name, email, message })

        return NextResponse.json(
            { success: true, message: 'Message sent successfully.' },
            { status: 201 },
        )
    } catch (error) {
        console.error('Contact API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to submit message. Please try again.' },
            { status: 500 },
        )
    }
}
