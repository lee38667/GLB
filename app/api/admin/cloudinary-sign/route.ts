import { NextResponse, type NextRequest } from 'next/server'
import { isAuthorizedAdmin } from '@/lib/admin-auth'
import { signUpload } from '@/lib/cloudinary'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const folder =
    typeof body?.folder === 'string' && /^[a-z0-9/_-]+$/i.test(body.folder)
      ? body.folder
      : 'glb/products'
  try {
    const signed = signUpload(folder)
    return NextResponse.json({ data: signed })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cloudinary sign failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
