import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdUnit from '@/components/AdUnit'
import JsonLd, { faqSchema } from '@/components/JsonLd'
import Link from 'next/link'
import W2vs1099Calc from './W2vs1099Calc'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://takehomepaycalculator.dev'

export const metadata: Metadata = {
  title: '1099 vs W-2 Calculator 2026 — How Much More Do You Need as a Contractor?',
  description:
    'Calculate the exact 1099 contractor rate you need to match your W-2 salary. Accounts for self-employment tax, health insurance, and lost benefits. Free 2026 calculator.',
  alternates: { canonical: '/calculator/1099-vs-w2' },
  openGraph: {
    title: '1099 vs W-2 Calculator 2026',
    description: 'Find the contractor rate that truly matches your employee salary after SE tax, health insurance, and benefits.',
    type: 'website',
    url: `${SITE_URL}/calculator/1099-vs-w2`,
    siteName: 'TakeHomePay',
  },
}

const FAQS = [
  {
    q: 'What is self-employment tax?',
    a: 'Self-employment (SE) tax covers Social Security and Medicare for independent contractors. W-2 employees split these 50/50 with their employer — each pays 7.65%. As a 1099 contractor, you pay the full 15.3% on 92.35% of your net self-employment income (the 0.9235 factor accounts for the deductible "employer half" of SE tax).',
  },
  {
    q: 'Can I deduct half of self-employment tax?',
    a: 'Yes. The IRS allows you to deduct 50% of your SE tax from your gross income before calculating federal income tax. This partially offsets the double-FICA burden, but the net effect is still that contractors pay more in taxes than equivalent W-2 employees at the same gross income.',
  },
  {
    q: 'What business expenses can reduce my 1099 tax bill?',
    a: 'Legitimate business deductions lower your net self-employment income, reducing both SE tax and income tax. Common deductions include home office, business equipment, software subscriptions, professional development, health insurance premiums (deductible above the line), and a self-employed 401(k) or SEP-IRA contribution (up to 25% of net earnings or $69,000 in 2026, whichever is less).',
  },
  {
    q: 'Should I form an S-Corp to reduce SE tax?',
    a: 'At roughly $80,000+ in annual net profit, an S-Corp election can make financial sense. As an S-Corp owner-employee, you pay yourself a "reasonable salary" (subject to FICA) and take additional profit as distributions (not subject to SE tax). The tax savings on distributions can offset the additional accounting and payroll costs. Consult a CPA to run the numbers for your specific situation.',
  },
  {
    q: 'Does the 1099 vs W-2 comparison change by state?',
    a: 'Yes. State income tax rates affect both W-2 and 1099 income differently. High-tax states like California and New York increase the required 1099 rate significantly. States with no income tax (Texas, Florida, Washington, etc.) reduce the gap between W-2 and 1099 compensation. Use the calculator above and select your state to see state-specific numbers.',
  },
  {
    q: 'What about quarterly estimated taxes as a 1099 contractor?',
    a: 'As a 1099 contractor, no taxes are withheld from your income. You must pay estimated taxes quarterly (April 15, June 15, September 15, January 15) to avoid underpayment penalties. The IRS safe harbor is to pay at least 90% of your current year tax or 100% of last year\'s tax liability (110% if AGI exceeded $150,000).',
  },
]

export default function Page1099vsW2() {
  return (
    <>
      <JsonLd data={faqSchema(FAQS)} />
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8 lg:py-12">

        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-600">1099 vs W-2</span>
        </nav>

        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            1099 vs W-2 Calculator
            <span className="block text-indigo-600 text-xl sm:text-2xl mt-1 font-semibold">
              How Much More Do You Need as a Contractor?
            </span>
          </h1>
          <p className="mt-3 text-gray-500">
            Find the exact 1099 rate you need to truly match your W-2 salary — after self-employment tax,
            health insurance, and lost employer benefits. Enter your W-2 salary and state below.
          </p>
        </div>

        <W2vs1099Calc />

        <AdUnit slot="1111122222" format="horizontal" className="rounded-xl bg-gray-50 border border-dashed border-gray-200 min-h-[90px] mt-8" />

        {/* How the math works */}
        <section className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How the 1099 vs W-2 Math Works</h2>
          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <p>
              At first glance, $80,000 as a W-2 employee and $80,000 as a 1099 contractor look identical.
              In practice, the contractor takes home <strong>significantly less</strong> at the same gross income.
            </p>
            <p>
              <strong>The self-employment tax gap:</strong> W-2 employees pay 7.65% FICA (6.2% Social Security +
              1.45% Medicare). Their employer pays another 7.65%. As a 1099 contractor, you pay both halves —
              the combined 15.3% self-employment tax on 92.35% of your net income. (The 0.9235 factor accounts
              for the deductible employer-equivalent portion of SE tax.)
            </p>
            <p>
              <strong>The benefits gap:</strong> W-2 employees typically receive employer-sponsored health
              insurance (often subsidized) and 401(k) matching contributions. Contractors must fund these entirely
              out of pocket. At average costs, this can add $8,000–$15,000/year to the contractor&apos;s true
              cost of matching W-2 compensation.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 font-mono text-xs text-gray-700 space-y-1">
              <p className="font-bold text-gray-900 mb-2">Break-even formula (simplified):</p>
              <p>1099 Equivalent ≈ W-2 Salary + SE Tax Overage + Health Cost + Benefits Lost</p>
              <p className="text-gray-400 mt-1">SE Tax Overage ≈ W-2 Salary × 7.65% (the extra employer half)</p>
            </div>
            <p>
              The calculator above solves this exactly using binary search — finding the 1099 gross income that
              produces the same after-tax take-home as your W-2 salary after accounting for all costs.
            </p>
          </div>
        </section>

        {/* S-Corp callout */}
        <section className="mt-8 max-w-3xl">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
            <h3 className="font-bold text-indigo-900 mb-2">High-income contractor? Consider an S-Corp.</h3>
            <p className="text-sm text-indigo-800">
              At approximately $80,000+ in annual net profit, electing S-Corp status can meaningfully reduce
              self-employment taxes. You pay yourself a reasonable W-2 salary (subject to FICA) and take
              additional profit as distributions exempt from SE tax. The savings can be $5,000–$15,000+/year,
              more than offsetting payroll service and CPA costs. Consult a CPA before electing.
            </p>
          </div>
        </section>

        {/* Pay stub CTA */}
        <section className="mt-8 max-w-3xl">
          <div className="bg-emerald-600 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-bold text-lg">Need an official contractor pay stub?</h3>
              <p className="text-emerald-100 text-sm mt-1">Generate a professional PDF pay stub for $5.99 — accepted by landlords, lenders, and banks.</p>
            </div>
            <Link
              href="/#generate-stub"
              className="shrink-0 bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
            >
              Generate Pay Stub — $5.99
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <dl className="space-y-6">
            {FAQS.map(({ q, a }) => (
              <div key={q}>
                <dt className="font-semibold text-gray-900">{q}</dt>
                <dd className="mt-1.5 text-sm text-gray-600 leading-relaxed">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Related links */}
        <section className="mt-10 max-w-3xl">
          <h3 className="font-semibold text-gray-900 mb-3">Related Calculators</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/', label: 'Paycheck Calculator' },
              { href: '/calculator/california', label: 'California Calculator' },
              { href: '/calculator/texas', label: 'Texas Calculator' },
              { href: '/calculator/new-york', label: 'New York Calculator' },
              { href: '/calculator/california/salary/80000', label: '$80k in California' },
              { href: '/compare/california-vs-texas', label: 'California vs Texas' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
