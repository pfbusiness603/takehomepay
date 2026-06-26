import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Calculator from '@/components/Calculator'
import AdUnit from '@/components/AdUnit'
import JsonLd, { breadcrumbSchema } from '@/components/JsonLd'
import { stateBySlug } from '@/lib/states'
import { calculate } from '@/lib/calculator'
import Link from 'next/link'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://takehomepaycalculator.dev'

// High-traffic comparison pairs — add more as needed
const COMPARISON_PAIRS = [
  'california-vs-texas',
  'new-york-vs-florida',
  'california-vs-nevada',
  'new-york-vs-texas',
  'washington-vs-california',
  'florida-vs-new-york',
  'texas-vs-florida',
] as const

const EXAMPLE_SALARIES = [50_000, 75_000, 100_000, 150_000]

interface Props {
  params: { slug: string }
}

function parsePair(slug: string): [string, string] | null {
  const parts = slug.split('-vs-')
  if (parts.length !== 2) return null
  return [parts[0], parts[1]]
}

export async function generateStaticParams() {
  return COMPARISON_PAIRS.map((slug) => ({ slug }))
}

export const dynamicParams = true

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pair = parsePair(params.slug)
  if (!pair) return {}
  const [s1, s2] = [stateBySlug(pair[0]), stateBySlug(pair[1])]
  if (!s1 || !s2) return {}

  const title = `${s1.name} vs ${s2.name} Paycheck Calculator 2026 — Tax Comparison`
  const description = `Compare take-home pay in ${s1.name} vs ${s2.name}. Side-by-side breakdown for $50k–$150k salaries. See exactly how much more you keep in each state after federal and state taxes.`
  const url = `${SITE_URL}/compare/${params.slug}`

  return {
    title,
    description,
    alternates: { canonical: `/compare/${params.slug}` },
    openGraph: { title, description, type: 'website', url, siteName: 'TakeHomePay' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
function fmtFull(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function pct(r: number) {
  return (r * 100).toFixed(1) + '%'
}

export default function ComparisonPage({ params }: Props) {
  const pair = parsePair(params.slug)
  if (!pair) notFound()

  const [st1, st2] = [stateBySlug(pair[0]), stateBySlug(pair[1])]
  if (!st1 || !st2) notFound()

  // Compute results for all salary/state combinations
  const rows = EXAMPLE_SALARIES.map((annual) => {
    const r1 = calculate({
      grossPay: annual / 26,
      payFrequency: 'biweekly',
      filingStatus: 'single',
      state: st1.code,
      allowances: 0,
      employmentType: 'w2',
      preTaxDeductions: { retirement401k: 0, healthInsurance: 0 },
    })
    const r2 = calculate({
      grossPay: annual / 26,
      payFrequency: 'biweekly',
      filingStatus: 'single',
      state: st2.code,
      allowances: 0,
      employmentType: 'w2',
      preTaxDeductions: { retirement401k: 0, healthInsurance: 0 },
    })
    return { annual, r1, r2, diff: r1.annualNetPay - r2.annualNetPay }
  })

  const pageUrl = `${SITE_URL}/compare/${params.slug}`
  const crumbs = [
    { name: 'Home', url: SITE_URL },
    { name: `${st1.name} vs ${st2.name}`, url: pageUrl },
  ]

  // State-specific SDI/PFML notes for the explanation section
  const state1HasAddlTax = rows[0].r1.additionalTaxDetails.length > 0
  const state2HasAddlTax = rows[0].r2.additionalTaxDetails.length > 0

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8 lg:py-12">

        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-600">{st1.name} vs {st2.name}</span>
        </nav>

        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            {st1.name} vs {st2.name}
            <span className="block text-emerald-600 text-xl sm:text-2xl mt-1 font-semibold">
              Paycheck Comparison 2026
            </span>
          </h1>
          <p className="mt-3 text-gray-500">
            See exactly how much more (or less) you take home in {st1.name} vs {st2.name} at different salary levels.
            All calculations use 2026 tax rates, single filing status, standard deduction.
          </p>
        </div>

        {/* Side-by-side comparison table */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Annual Take-Home Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Salary</th>
                  <th className="text-right px-4 py-3 font-semibold text-blue-700">{st1.name}<br/><span className="font-normal text-gray-500">Biweekly · Annual</span></th>
                  <th className="text-right px-4 py-3 font-semibold text-indigo-700">{st2.name}<br/><span className="font-normal text-gray-500">Biweekly · Annual</span></th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Difference<br/><span className="font-normal text-gray-500">(annual)</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {rows.map(({ annual, r1, r2, diff }) => (
                  <tr key={annual} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{fmt(annual)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-blue-700 font-medium">{fmtFull(r1.netPay)}</span>
                      <span className="block text-xs text-gray-400">{fmt(r1.annualNetPay)}/yr</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-indigo-700 font-medium">{fmtFull(r2.netPay)}</span>
                      <span className="block text-xs text-gray-400">{fmt(r2.annualNetPay)}/yr</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${diff > 0 ? 'text-blue-600' : diff < 0 ? 'text-indigo-600' : 'text-gray-500'}`}>
                        {diff > 0 ? '+' : ''}{fmt(diff)}{' '}
                        <span className="text-xs font-normal">
                          {diff > 0 ? `(${st1.name} wins)` : diff < 0 ? `(${st2.name} wins)` : '(tied)'}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Single filer · W-2 · Standard deduction · No pre-tax deductions · 2026 federal and state rates
          </p>
        </section>

        {/* Effective tax rate comparison */}
        <section className="mb-12 max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Effective Tax Rate Comparison</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { state: st1, rows: rows.map((r) => r.r1), color: 'blue' },
              { state: st2, rows: rows.map((r) => r.r2), color: 'indigo' },
            ].map(({ state, rows: stRows, color }) => (
              <div key={state.code} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5`}>
                <p className={`font-bold text-lg ${color === 'blue' ? 'text-blue-700' : 'text-indigo-700'} mb-3`}>
                  {state.name}
                </p>
                <div className="space-y-2">
                  {stRows.map((r, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{fmt(EXAMPLE_SALARIES[i])}</span>
                      <span className="font-medium text-gray-900">
                        {pct(r.effectiveTotalRate)} total tax
                        <span className="text-gray-400 font-normal"> · keeps {pct(1 - r.effectiveTotalRate)}</span>
                      </span>
                    </div>
                  ))}
                </div>
                {state.code === 'CA' || state.code === 'WA' || state.code === 'NY' || state.code === 'NJ' ? (
                  <p className="text-xs text-amber-600 mt-3 bg-amber-50 rounded-lg p-2">
                    Includes {stRows[0].additionalTaxDetails.map(t => t.shortName).join(' + ')} in addition to income tax.
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* Why the difference exists */}
        <section className="mb-12 max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Why Take-Home Pay Differs</h2>
          <div className="text-sm text-gray-600 space-y-3 leading-relaxed">
            <p>
              Both states pay identical <strong>federal income tax</strong> (2026 brackets: 10%–37%) and{' '}
              <strong>FICA taxes</strong> (Social Security 6.2% + Medicare 1.45%). The difference comes entirely
              from state-level taxes.
            </p>

            {rows[0].r1.annualStateTax === 0 && rows[0].r2.annualStateTax === 0 ? (
              <p>
                Both <strong>{st1.name}</strong> and <strong>{st2.name}</strong> have no state income tax,
                so take-home pay is nearly identical between the two states at equivalent salaries.
                Any remaining difference comes from state-specific payroll taxes like paid leave programs.
              </p>
            ) : rows[0].r1.annualStateTax === 0 ? (
              <p>
                <strong>{st1.name} has no state income tax</strong>, so residents keep significantly more of
                each paycheck. {st2.name} charges state income tax at rates up to{' '}
                {pct(Math.max(...Object.values(rows[0].r2.additionalTaxDetails).length > 0 ? [rows[0].r2.effectiveStateRate] : [rows[0].r2.effectiveStateRate]))},
                which reduces take-home pay at every income level.
              </p>
            ) : rows[0].r2.annualStateTax === 0 ? (
              <p>
                <strong>{st2.name} has no state income tax</strong>, so residents keep more of each paycheck.
                {st1.name} charges state income tax, reducing take-home pay at every income level compared to {st2.name}.
              </p>
            ) : (
              <p>
                Both states charge state income tax, but at different rates. At a $100,000 salary, {st1.name} residents
                pay {fmt(rows[2].r1.annualStateTax)} in state tax (effective rate {pct(rows[2].r1.effectiveStateRate)}),
                while {st2.name} residents pay {fmt(rows[2].r2.annualStateTax)} (effective rate {pct(rows[2].r2.effectiveStateRate)}).
              </p>
            )}

            {(state1HasAddlTax || state2HasAddlTax) && (
              <p>
                {state1HasAddlTax && (
                  <><strong>{st1.name}</strong> also withholds {rows[0].r1.additionalTaxDetails.map(t => t.name).join(' and ')} from paychecks.{' '}</>
                )}
                {state2HasAddlTax && (
                  <><strong>{st2.name}</strong> also withholds {rows[0].r2.additionalTaxDetails.map(t => t.name).join(' and ')} from paychecks.</>
                )}
              </p>
            )}
          </div>
        </section>

        {/* Live calculator for custom salary */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Calculate Your Specific Salary</h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter your salary below to see your exact take-home pay in {st1.name}. Switch the state selector to {st2.name} to compare directly.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-2">{st1.name}</p>
              <Suspense fallback={<div className="bg-white rounded-2xl border border-gray-100 p-6 h-80 animate-pulse" />}>
                <Calculator defaultState={st1.code} />
              </Suspense>
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-700 mb-2">{st2.name}</p>
              <Suspense fallback={<div className="bg-white rounded-2xl border border-gray-100 p-6 h-80 animate-pulse" />}>
                <Calculator defaultState={st2.code} />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Related links */}
        <section className="mb-8 max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Related Calculators</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: `/calculator/${pair[0]}`, label: `${st1.name} Paycheck Calculator` },
              { href: `/calculator/${pair[1]}`, label: `${st2.name} Paycheck Calculator` },
              { href: `/calculator/${pair[0]}/salary/75000`, label: `$75k in ${st1.name}` },
              { href: `/calculator/${pair[1]}/salary/75000`, label: `$75k in ${st2.name}` },
              { href: `/calculator/${pair[0]}/salary/100000`, label: `$100k in ${st1.name}` },
              { href: `/calculator/${pair[1]}/salary/100000`, label: `$100k in ${st2.name}` },
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

        <AdUnit slot="9999999999" format="horizontal" className="rounded-xl bg-gray-50 border border-dashed border-gray-200 min-h-[90px]" />
      </main>
      <Footer />
    </>
  )
}
