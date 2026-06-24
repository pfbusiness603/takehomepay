import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    keyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) ?? 'none',
    keyLength: process.env.STRIPE_SECRET_KEY?.length ?? 0,
  })
}
