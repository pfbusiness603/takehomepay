import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About TakeHomePay — Free Paycheck Calculator for All 50 States',
  description:
    'Learn about TakeHomePay — a free paycheck calculator built to show exactly where every dollar goes after federal tax, state tax, Social Security, and Medicare.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-600">About</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">About TakeHomePay</h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Why We Built This</h2>
            <p>
              Most paycheck calculators require a sign-up, hide results behind ads, or give vague estimates without
              showing the math. TakeHomePay was built to fix that — no account required, no hidden fees, just a
              fast and transparent calculator that shows exactly where your money goes.
            </p>
            <p>
              Enter your pay, select your state, and you instantly see a line-by-line breakdown: gross pay, federal
              income tax, state income tax, Social Security, Medicare, any pre-tax deductions you&apos;ve set up, and
              your final take-home amount. No guessing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">What the Calculator Covers</h2>
            <ul className="space-y-2 list-none pl-0">
              {[
                'All 50 U.S. states — every state has its own income tax page with current 2026 rates',
                '2026 federal income tax brackets (IRS Rev. Proc. estimates, updated annually)',
                'FICA: Social Security at 6.2% on wages up to $176,100 and Medicare at 1.45% on all wages',
                'W-2 employees and 1099 independent contractors (self-employment tax: 15.3% on 92.35% of net income)',
                'Salary and hourly input modes — enter an hourly rate and hours per week for automatic conversion',
                'Pre-tax deductions: 401(k)/retirement contributions and health insurance premiums',
                'Filing status: single or married filing jointly — affects both federal and state brackets',
                'Annual and per-paycheck views, with a state comparison tool to see how your net pay differs by location',
              ].map((item) => (
                <li key={item} className="flex gap-2.5 text-sm">
                  <span className="text-emerald-500 shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">The PDF Pay Stub</h2>
            <p>
              For $4.99, TakeHomePay generates a professional PDF pay stub that includes your employer and employee
              information, pay period dates, an itemized earnings and deductions breakdown, and year-to-date totals.
              It&apos;s designed for freelancers, self-employed workers, and W-2 employees who need quick documentation
              of their income for landlords, lenders, or personal records.
            </p>
            <p>
              Pay stubs are generated on-demand via Stripe&apos;s secure checkout. No subscription required — pay once,
              download immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Our Tax Data</h2>
            <p>
              All tax rates are updated annually. For 2026, we use IRS Rev. Proc. estimates for federal brackets,
              the confirmed Social Security wage cap of $176,100, and the latest published rates for all 50 states.
              State rates are sourced from each state&apos;s Department of Revenue or equivalent agency.
            </p>
            <p>
              TakeHomePay is designed for estimation and planning — not for filing taxes or determining exact
              employer withholding. Actual paychecks may differ based on your W-4 elections, employer-specific
              benefits, local taxes, and other factors. We always recommend verifying important figures with your
              payroll department or a qualified CPA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Questions or Feedback?</h2>
            <p>
              We&apos;re a small team and we read every message. If you notice a tax rate that looks off, have a
              suggestion for a new feature, or just want to say hi, reach out on our{' '}
              <Link href="/contact" className="text-emerald-600 hover:underline">contact page</Link>.
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm"
            >
              Try the Calculator
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
