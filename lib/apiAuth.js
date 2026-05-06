import { NextResponse } from 'next/server'

function getExpectedKey() {
    return process.env.ADMIN_API_KEY || ''
}

export function ensureAdminAccess(request) {
    const expectedKey = getExpectedKey()

    // Keep local/dev workflows working if no admin key is configured yet.
    if (!expectedKey) {
        return null
    }

    const headerKey = request.headers.get('x-admin-key') || ''
    const authHeader = request.headers.get('authorization') || ''
    const bearerKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

    if (headerKey === expectedKey || bearerKey === expectedKey) {
        return null
    }

    return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
    )
}
