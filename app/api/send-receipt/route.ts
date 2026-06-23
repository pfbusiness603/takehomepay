import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://takehomepay.app'

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email sending not configured' }, { status: 501 })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 501 })
  }

  let sessionId: string, email: string
  try {
    const body = await req.json()
    sessionId = body.sessionId
    email = body.email
    if (!sessionId || !email) throw new Error('missing fields')
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-05-27.dahlia' as const,
  })

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Payment not completed' }, { status: 402 })
  }

  const downloadUrl = `${SITE_URL}/api/generate-pdf?session_id=${sessionId}`

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: 'TakeHomePay <receipts@takehomepay.app>',
    to: [email],
    subject: 'Your Pay Stub PDF is Ready',
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #111;">
        <h1 style="color: #059669; font-size: 24px; margin-bottom: 8px;">Your Pay Stub PDF is Ready</h1>
        <p style="color: #6b7280; margin-bottom: 24px;">Thank you for your purchase. Click the button below to download your professional pay stub.</p>
        <a href="${downloadUrl}"
           style="display: inline-block; background: #059669; color: #fff; font-weight: 600; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-size: 16px;">
          Download Pay Stub PDF
        </a>
        <p style="margin-top: 24px; font-size: 13px; color: #9ca3af;">
          This link expires after 24 hours. If you have any issues, reply to this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #d1d5db;">TakeHomePay.app &mdash; Free paycheck calculator</p>
      </div>
    `,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
