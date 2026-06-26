import type { Metadata } from 'next'
import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Calculator from '@/components/Calculator'
import AdUnit from '@/components/AdUnit'
import JsonLd, { webAppSchema, faqSchema } from '@/components/JsonLd'
import { STATES } from '@/lib/states'
import Link from 'next/link'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://takehomepaycalculator.dev'

const FAQS = [
  {
    q: 'What is gross pay vs. net pay?',
    a: 'Gross pay is your salary or hourly wage before any deductions. Net pay (take-home pay) is what you actually receive after federal taxes, state taxes, FICA, and benefit deductions.',
  },
  {
    q: 'Does this calculator use 2026 tax rates?',
    a: 'Yes. This calculator uses the 2026 federal income tax brackets and FICA rates. The Social Security wage cap is $184,500 for 2026. State tax rates reflect the latest available rates.',
  },
  {
    q: 'What is FICA?',
    a: 'FICA taxes fund Social Security and Medicare. Employees pay 6.2% for Social Security (on wages up to $184,500) and 1.45% for Medicare on all wages.',
  },
  {
    q: 'How do pre-tax deductions reduce my taxes?',
    a: '401(k) contributions and employer health insurance premiums are deducted from your gross pay before federal and state taxes are calculated, lowering your taxable income and tax bill.',
  },
  {
    q: 'What does the PDF pay stub include?',
    a: 'Your generated pay stub includes employer name, employee name, pay period dates, itemized earnings, all tax deductions, pre-tax benefit deductions, net pay, and year-to-date totals — for just $5.99 via secure Stripe checkout. For personal record-keeping purposes only.',
  },
]

export const metadata: Metadata = {
  title: 'Free Paycheck Calculator 2026 — All 50 States',
  description:
    'Calculate your exact take-home pay after federal tax, state tax, Social Security, and Medicare. Free for all 50 states. Generate a professional PDF pay stub for just $5.99.',
  openGraph: {
    title: 'Free Paycheck Calculator 2026 — All 50 States',
    description: 'Calculate your exact take-home pay after federal tax, state tax, Social Security, and Medicare. Free for all 50 states.',
    type: 'website',
    url: SITE_URL,
    siteName: 'TakeHomePay',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Paycheck Calculator 2026 — All 50 States',
    description: 'Calculate your exact take-home pay after federal tax, state tax, Social Security, and Medicare. Free for all 50 states.',
  },
}

const POPULAR_SLUGS = ['california', 'texas', 'new-york', 'florida', 'new-jersey', 'illinois', 'washington', 'georgia', 'ohio', 'pennsylvania']

export default function HomePage() {
  const popular = STATES.filter((s) => POPULAR_SLUGS.includes(s.slug))

  return (
    <>
      <JsonLd data={webAppSchema('TakeHomePay Paycheck Calculator', metadata.description as string, SITE_URL)} />
      <JsonLd data={faqSchema(FAQS)} />
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        {/* Hero */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            What&apos;s Your{' '}
            <span className="text-emerald-600">Real Take-Home Pay?</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Free paycheck calculator for all 50 states. Instantly see your net pay after federal tax, state tax, Social Security, and Medicare — updated for 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main calculator */}
          <div className="lg:col-span-2" id="generate-stub">
            <Suspense fallback={<div className="bg-white rounded-2xl border border-gray-100 p-6 h-96 animate-pulse" />}>
              <Calculator />
            </Suspense>
          </div>

          {/* Sidebar — desktop only, non-intrusive */}
          <aside className="hidden lg:block space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Sidebar ad */}
              <AdUnit
                slot="1111111111"
                format="rectangle"
                className="rounded-xl bg-gray-50 border border-dashed border-gray-200 min-h-[250px] flex items-center justify-center"
              />

              {/* State links */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Popular State Calculators</h3>
                <ul className="space-y-1.5">
                  {popular.map((s) => (
                    <li key={s.code}>
                      <Link
                        href={`/calculator/${s.slug}`}
                        className="text-sm text-gray-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5"
                      >
                        <span className="text-gray-300">→</span>
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* PDF CTA card */}
              <div className="bg-indigo-600 rounded-2xl p-5 text-white text-center">
                <p className="font-bold text-lg">PDF Pay Stub</p>
                <p className="text-sm opacity-80 mt-1">Professional format · YTD totals</p>
                <p className="text-3xl font-bold mt-3">$5.99</p>
                <p className="text-xs opacity-60 mt-1">One-time · Instant download</p>
              </div>
            </div>
          </aside>
        </div>

        {/* How it works */}
        <section className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How the Paycheck Calculator Works</h2>
          <div className="text-gray-600 space-y-3 text-sm leading-relaxed">
            <p>
              Enter your gross (pre-tax) pay per paycheck and select your pay frequency, filing status, and state. The calculator applies the <strong>2026 federal income tax brackets</strong>, your state&apos;s tax rates, FICA (Social Security 6.2% + Medicare 1.45%), and any pre-tax deductions like 401(k) contributions or health insurance premiums.
            </p>
            <p>
              The result is your <strong>actual net take-home pay</strong> — what gets deposited into your bank account each pay period.
            </p>
          </div>
        </section>

        {/* FAQ — reuses FAQS constant defined at top (also used for JSON-LD) */}
        <section className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <dl className="space-y-6">
            {FAQS.map(({ q, a }) => (
              <div key={q}>
                <dt className="font-semibold text-gray-900">{q}</dt>
                <dd className="mt-1 text-sm text-gray-600">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Below-fold ad â€” horizontal banner */}
        <div className="mt-12">
          <AdUnit
            slot="2222222222"
            format="horizontal"
            className="rounded-xl bg-gray-50 border border-dashed border-gray-200 min-h-[90px]"
          />
        </div>
      </main>
      <Footer />
    </>
  )
}

