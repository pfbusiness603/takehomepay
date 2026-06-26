import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { FEDERAL_BRACKETS, FEDERAL_STANDARD_DEDUCTION, FICA } from '@/lib/tax-config'

export const metadata: Metadata = {
  title: 'How We Calculate Your Paycheck — TakeHomePay Methodology',
  description:
    'A transparent explanation of how TakeHomePay calculates federal income tax, state income tax, Social Security, Medicare, and net pay using 2026 IRS tax rates.',
  alternates: { canonical: '/how-we-calculate' },
}

function pct(rate: number) {
  const val = rate * 100
  return val % 1 === 0 ? `${val.toFixed(0)}%` : `${val.toFixed(2).replace(/\.?0+$/, '')}%`
}

export default function HowWeCalculatePage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-600">How We Calculate</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">How We Calculate Your Paycheck</h1>
        <p className="text-gray-500 mb-10">
          A full explanation of our methodology — every formula, every rate, every data source. We believe in
          showing our work.
        </p>

        <div className="space-y-10 text-sm text-gray-600 leading-relaxed">

          {/* Step 1 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Step 1: Annualize Your Gross Pay</h2>
            <p>
              You enter your gross pay per paycheck (or an hourly rate and hours per week). We convert it to an
              annual figure by multiplying by the number of pay periods per year:
            </p>
            <div className="bg-gray-50 rounded-xl p-4 my-3 font-mono text-xs text-gray-700 space-y-1">
              <p>Weekly → × 52</p>
              <p>Bi-Weekly → × 26</p>
              <p>Semi-Monthly → × 24</p>
              <p>Monthly → × 12</p>
            </div>
            <p>
              Pre-tax deductions (401k, health insurance) are also annualized the same way and subtracted before
              calculating taxable income.
            </p>
          </section>

          {/* Step 2 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Step 2: Calculate Federal Income Tax</h2>
            <p>
              We apply the 2026 federal tax brackets using a marginal rate system — only the income within each
              bracket is taxed at that bracket&apos;s rate. First, we subtract the standard deduction:
            </p>
            <div className="bg-gray-50 rounded-xl p-4 my-3 space-y-1 text-xs font-mono text-gray-700">
              <p>Single standard deduction: ${FEDERAL_STANDARD_DEDUCTION.single.toLocaleString()}</p>
              <p>Married filing jointly: ${FEDERAL_STANDARD_DEDUCTION.married.toLocaleString()}</p>
            </div>
            <p className="mb-3">Then we apply the 2026 federal brackets to the remaining taxable income:</p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-100 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Income Range (Single)</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-gray-700">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {FEDERAL_BRACKETS.single.map((b, i) => (
                    <tr key={i} className="bg-white">
                      <td className="px-4 py-2.5 text-gray-700">
                        {b.max
                          ? `$${b.min.toLocaleString()} – $${b.max.toLocaleString()}`
                          : `Over $${b.min.toLocaleString()}`}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium">{pct(b.rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3">
              <strong>Example:</strong> A single filer with $60,000 in taxable income pays 10% on the first
              $11,925, 12% on income from $11,925 to $48,475, and 22% on income from $48,475 to $60,000. The
              effective (average) federal rate is well below the 22% marginal rate.
            </p>
          </section>

          {/* Step 3 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Step 3: Calculate State Income Tax</h2>
            <p>
              We apply the same bracket logic using each state&apos;s 2026 rates and deductions. States vary
              significantly: nine states have no income tax at all (Alaska, Florida, Nevada, New Hampshire, South
              Dakota, Tennessee, Texas, Washington, Wyoming), some use flat rates (e.g., Illinois at 4.95%,
              Pennsylvania at 3.07%), and others use graduated brackets similar to the federal system.
            </p>
            <p className="mt-2">
              State standard deductions and personal exemptions are applied before calculating state taxable income.
              Visit any{' '}
              <Link href="/calculator/california" className="text-emerald-600 hover:underline">state page</Link>{' '}
              to see the full bracket table for that state.
            </p>
          </section>

          {/* Step 4 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Step 4: Calculate FICA (Social Security & Medicare)</h2>
            <p>
              For W-2 employees, FICA taxes are calculated on gross wages (after 401k deductions, but before income
              tax deductions):
            </p>
            <div className="bg-gray-50 rounded-xl p-4 my-3 space-y-2 text-xs font-mono text-gray-700">
              <p>Social Security: {pct(FICA.socialSecurityRate)} on wages up to ${FICA.socialSecurityWageCap.toLocaleString()}</p>
              <p>Medicare: {pct(FICA.medicareRate)} on all wages</p>
              <p>Additional Medicare: {pct(FICA.additionalMedicareRate)} on wages above $200,000 (single) / $250,000 (married)</p>
            </div>
            <p>
              Once you hit the Social Security wage cap (${FICA.socialSecurityWageCap.toLocaleString()} in 2026), Social
              Security withholding stops for the rest of the year. This is why high-income earners see more
              take-home pay in late November and December.
            </p>
          </section>

          {/* Step 5 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Step 5: Self-Employment Tax (1099 Workers)</h2>
            <p>
              For 1099 independent contractors, there is no employer to pay the other half of FICA. Instead, you
              pay Self-Employment (SE) tax at a combined rate that covers both halves:
            </p>
            <div className="bg-gray-50 rounded-xl p-4 my-3 space-y-1.5 text-xs font-mono text-gray-700">
              <p>SE tax base: net income × 92.35%</p>
              <p>  (the 0.9235 factor accounts for the deductible employer half)</p>
              <p>Social Security: 12.4% on SE base up to $184,500</p>
              <p>Medicare: 2.9% on all SE base</p>
              <p>Combined SE tax rate: 15.3%</p>
              <p>Deduction: half of SE tax is deductible from federal income</p>
            </div>
          </section>

          {/* Step 6 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Step 6: Net Pay</h2>
            <p>Net pay is what actually lands in your bank account each pay period:</p>
            <div className="bg-gray-50 rounded-xl p-4 my-3 text-xs font-mono text-gray-700 space-y-1">
              <p>Gross Pay</p>
              <p>− Pre-tax deductions (401k, health insurance)</p>
              <p>− Federal income tax</p>
              <p>− State income tax</p>
              <p>− Social Security</p>
              <p>− Medicare</p>
              <p className="border-t border-gray-200 pt-1 mt-1 font-bold">= Net (take-home) Pay</p>
            </div>
            <p>
              We divide the annual tax totals by your number of pay periods to get the per-paycheck deductions.
              The effective tax rate shown is total taxes (all categories) divided by annual gross pay.
            </p>
          </section>

          {/* Data sources */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Data Sources & Accuracy</h2>
            <ul className="space-y-2">
              {[
                'Federal brackets: IRS Rev. Proc. 2025 estimates with ~2.8% inflation adjustment for 2026',
                'FICA rates: IRS Publication 15 (Circular E) for 2026',
                'Social Security wage cap: $184,500 for 2026 (confirmed by SSA)',
                'State income tax rates: sourced from each state\'s Department of Revenue or official tax authority',
                'State standard deductions and exemptions: same official state sources, updated annually',
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="text-emerald-500 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              <strong className="text-gray-700">Important:</strong> This calculator estimates withholding for
              planning purposes. Actual employer withholding is governed by your W-4 elections and IRS Publication
              15-T. For precise payroll calculations, consult your employer&apos;s payroll department or a licensed CPA.
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm"
            >
              Try the Calculator
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800 px-5 py-2.5 rounded-xl font-medium transition-colors text-sm"
            >
              Report a Data Issue
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
