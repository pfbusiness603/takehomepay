import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia' as const,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { stubData } = body

    if (!stubData) {
      return NextResponse.json({ error: 'Missing stub data' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Professional PDF Pay Stub',
              description: `Pay stub for ${stubData.employeeName ?? 'Employee'} — ${stubData.payPeriodStart} to ${stubData.payPeriodEnd}`,
            },
            unit_amount: 499, // $4.99
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/`,
      metadata: {
        // Stripe metadata values must be strings, max 500 chars each
        employerName:    stubData.employerName   ?? '',
        employeeName:    stubData.employeeName   ?? '',
        payPeriodStart:  stubData.payPeriodStart ?? '',
        payPeriodEnd:    stubData.payPeriodEnd   ?? '',
        payFrequency:    stubData.payFrequency   ?? '',
        filingStatus:    stubData.filingStatus   ?? '',
        state:           stubData.state          ?? '',
        // Store results as JSON string (truncated to fit Stripe 500-char limit)
        resultsJson: JSON.stringify(stubData.results ?? {}).slice(0, 490),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
