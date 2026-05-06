import crypto from 'node:crypto'

const PAYSTACK_API = 'https://api.paystack.co'

type InitPayload = {
  email: string
  amountKobo: number
  currency?: 'NGN' | 'GHS' | 'ZAR' | 'USD' | 'KES'
  reference: string
  callbackUrl: string
  metadata?: Record<string, unknown>
}

type InitResponse = {
  status: boolean
  message: string
  data: { authorization_url: string; access_code: string; reference: string }
}

type VerifyResponse = {
  status: boolean
  data: {
    status: 'success' | 'failed' | 'abandoned'
    reference: string
    amount: number
    currency: string
    paid_at: string
    customer: { email: string }
    metadata?: Record<string, unknown>
  }
}

function secret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new Error('PAYSTACK_SECRET_KEY not configured')
  return key
}

export async function initTransaction(payload: InitPayload): Promise<InitResponse['data']> {
  const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: payload.email,
      amount: payload.amountKobo,
      currency: payload.currency ?? process.env.PAYSTACK_CURRENCY ?? 'ZAR',
      reference: payload.reference,
      callback_url: payload.callbackUrl,
      metadata: payload.metadata,
    }),
    cache: 'no-store',
  })
  const json = (await res.json()) as InitResponse
  if (!res.ok || !json.status) throw new Error(json.message || 'Paystack init failed')
  return json.data
}

export async function verifyTransaction(reference: string): Promise<VerifyResponse['data']> {
  const res = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret()}` },
    cache: 'no-store',
  })
  const json = (await res.json()) as VerifyResponse
  if (!res.ok || !json.status) throw new Error('Paystack verification failed')
  return json.data
}

export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false
  const expected = crypto.createHmac('sha512', secret()).update(rawBody).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader))
  } catch {
    return false
  }
}

export function newReference(prefix = 'GLB'): string {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
}
