import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { insertStubRecord } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia' as const,
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta = session.metadata ?? {}

    let results: Record<string, number> = {}
    try {
      results = JSON.parse(meta.resultsJson ?? '{}')
    } catch {}

    // Store stub record in Supabase (no-op if env vars not set)
    await insertStubRecord({
      session_id:      session.id,
      employer_name:   meta.employerName ?? '',
      employee_name:   meta.employeeName ?? '',
      pay_period_start: meta.payPeriodStart ?? '',
      pay_period_end:   meta.payPeriodEnd   ?? '',
      pay_frequency:   meta.payFrequency   ?? '',
      filing_status:   meta.filingStatus   ?? '',
      state:           meta.state          ?? '',
      gross_pay:       results.grossPay    ?? 0,
      net_pay:         results.netPay      ?? 0,
      federal_tax:     results.federalTax  ?? 0,
      state_tax:       results.stateTax    ?? 0,
      social_security: results.socialSecurity ?? 0,
      medicare:        results.medicare    ?? 0,
    })

    console.log('Stub stored:', { sessionId: session.id, employee: meta.employeeName })
  }

  return NextResponse.json({ received: true })
}
