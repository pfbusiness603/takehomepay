import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Calculator from '@/components/Calculator'
import AdUnit from '@/components/AdUnit'
import JsonLd, { breadcrumbSchema } from '@/components/JsonLd'
import { STATES, stateBySlug } from '@/lib/states'
import { calculate } from '@/lib/calculator'
import { SALARY_AMOUNTS } from '@/lib/salary-amounts'
import { FICA } from '@/lib/tax-config'
import Link from 'next/link'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://takehomepaycalculator.dev'

interface Props {
  params: { state: string; amount: string }
}

export async function generateStaticParams() {
  return STATES.flatMap((s) =>
    SALARY_AMOUNTS.map((a) => ({ state: s.slug, amount: String(a) }))
  )
}

function computeResults(stateCode: string, annualSalary: number) {
  return calculate({
    grossPay: annualSalary / 26,
    payFrequency: 'biweekly',
    filingStatus: 'single',
    state: stateCode,
    allowances: 0,
    employmentType: 'w2',
    preTaxDeductions: { retirement401k: 0, healthInsurance: 0 },
  })
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function fmtFull(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const st = stateBySlug(params.state)
  const amount = parseInt(params.amount)
  if (!st || !SALARY_AMOUNTS.includes(amount)) return {}

  const r = computeResults(st.code, amount)
  const biweeklyNet = fmtFull(r.netPay)
  const annualNet = fmt(r.annualNetPay)

  const title = `$${amount.toLocaleString()} Salary in ${st.name} — Take-Home Pay After Taxes (2026)`
  const description = `How much is $${amount.toLocaleString()} after taxes in ${st.name}? Take home ${biweeklyNet} biweekly (${annualNet}/year) after federal tax, state tax, Social Security, and Medicare. Free calculator.`
  const url = `${SITE_URL}/calculator/${params.state}/salary/${params.amount}`

  return {
    title,
    description,
    alternates: { canonical: `/calculator/${params.state}/salary/${params.amount}` },
    openGraph: { title, description, type: 'website', url, siteName: 'TakeHomePay' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default function SalaryPage({ params }: Props) {
  const st = stateBySlug(params.state)
  const amount = parseInt(params.amount)
  if (!st || !SALARY_AMOUNTS.includes(amount)) notFound()

  const r = computeResults(st.code, amount)

  // Biweekly → Annual, Monthly, Weekly conversions
  const biweeklyGross = amount / 26
  const monthlyGross  = amount / 12
  const weeklyGross   = amount / 52

  const annualNet   = r.annualNetPay
  const monthlyNet  = annualNet / 12
  const biweeklyNet = r.netPay
  const weeklyNet   = annualNet / 52

  // Adjacent salary links
  const idx = SALARY_AMOUNTS.indexOf(amount)
  const prevSalary = idx > 0 ? SALARY_AMOUNTS[idx - 1] : null
  const nextSalary = idx < SALARY_AMOUNTS.length - 1 ? SALARY_AMOUNTS[idx + 1] : null

  // Comparable state links (popular high-traffic states)
  const COMPARE_STATES = ['california', 'texas', 'new-york', 'florida', 'washington', 'illinois']
  const otherStates = COMPARE_STATES.filter((s) => s !== params.state).slice(0, 4)

  const pageUrl = `${SITE_URL}/calculator/${params.state}/salary/${amount}`
  const crumbs = [
    { name: 'Home', url: SITE_URL },
    { name: `${st.name} Calculator`, url: `${SITE_URL}/calculator/${params.state}` },
    { name: `$${amount.toLocaleString()} Salary`, url: pageUrl },
  ]

  const hasSdi = r.additionalTaxDetails.length > 0

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 lg:py-12">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/calculator/${params.state}`} className="hover:text-emerald-600 transition-colors">{st.name}</Link>
          <span>/</span>
          <span className="text-gray-600">${amount.toLocaleString()} Salary</span>
        </nav>

        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            ${amount.toLocaleString()} Salary in {st.name}
            <span className="block text-emerald-600 text-2xl sm:text-3xl mt-1">
              Take-Home Pay After Taxes
            </span>
          </h1>
          <p className="mt-3 text-gray-500">
            Biweekly take-home on a ${amount.toLocaleString()} {st.name} salary:{' '}
            <strong className="text-gray-800">{fmtFull(biweeklyNet)}</strong> per paycheck
            ({fmt(annualNet)}/year). Estimates for a single filer, W-2 employee, standard deduction, 2026 tax rates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="bg-white rounded-2xl border border-gray-100 p-6 h-96 animate-pulse" />}>
              <Calculator defaultState={st.code} defaultGross={biweeklyGross} />
            </Suspense>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <AdUnit slot="7777777777" format="rectangle" className="rounded-xl bg-gray-50 border border-dashed border-gray-200 min-h-[250px]" />

              {/* Same salary, other states */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">${amount.toLocaleString()} in Other States</h3>
                <ul className="space-y-1.5">
                  {otherStates.map((slug) => {
                    const otherState = STATES.find((s) => s.slug === slug)
                    if (!otherState) return null
                    const otherR = computeResults(otherState.code, amount)
                    return (
                      <li key={slug}>
                        <Link
                          href={`/calculator/${slug}/salary/${amount}`}
                          className="text-sm text-gray-600 hover:text-emerald-600 transition-colors flex justify-between items-center"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="text-gray-300">→</span>
                            {otherState.name}
                          </span>
                          <span className="text-xs text-emerald-600 font-medium">{fmtFull(otherR.netPay)}/pp</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {/* Written breakdown */}
        <section className="mt-12 max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Where Your ${amount.toLocaleString()} {st.name} Salary Goes
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            On a ${amount.toLocaleString()} salary in {st.name}, a single W-2 filer pays approximately{' '}
            <strong>{fmt(r.annualFederalTax)}</strong> in federal income tax (effective rate{' '}
            {(r.effectiveFederalRate * 100).toFixed(1)}%),{' '}
            {r.annualStateTax > 0
              ? <><strong>{fmt(r.annualStateTax)}</strong> in {st.name} state income tax (effective rate {(r.effectiveStateRate * 100).toFixed(1)}%), </>
              : <>{st.name} has no state income tax, </>
            }
            <strong>{fmt(r.annualSocialSecurity)}</strong> in Social Security (6.2% up to $184,500), and{' '}
            <strong>{fmt(r.annualMedicare)}</strong> in Medicare (1.45%).
            {hasSdi && (
              <> Additional {st.name} payroll taxes ({r.additionalTaxDetails.map(t => t.shortName).join(', ')}) total <strong>{fmt(r.annualAdditionalTaxes)}</strong>.</>
            )}{' '}
            That leaves you with <strong>{fmt(annualNet)}/year</strong> — or{' '}
            <strong>{fmtFull(biweeklyNet)}</strong> per biweekly paycheck.
          </p>
        </section>

        {/* Take-home by pay period */}
        <section className="mt-8 max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            ${amount.toLocaleString()} Salary — Take-Home by Pay Period
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Pay Period</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Gross Pay</th>
                  <th className="text-right px-4 py-3 font-semibold text-emerald-700">Take-Home</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500">Eff. Tax Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {[
                  { label: 'Annual',     gross: amount,          net: annualNet },
                  { label: 'Monthly',    gross: monthlyGross,    net: monthlyNet },
                  { label: 'Bi-Weekly (26×)', gross: biweeklyGross, net: biweeklyNet },
                  { label: 'Weekly',     gross: weeklyGross,     net: weeklyNet },
                ].map(({ label, gross, net }) => (
                  <tr key={label}>
                    <td className="px-4 py-3 text-gray-700 font-medium">{label}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{fmtFull(gross)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">{fmtFull(net)}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{(r.effectiveTotalRate * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Single filer · W-2 · Standard deduction · No additional withholding or pre-tax deductions · 2026 rates
          </p>
        </section>

        {/* Tax breakdown table */}
        <section className="mt-8 max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Annual Tax Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Tax</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Annual Amount</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Effective Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                <tr>
                  <td className="px-4 py-3 text-gray-700">Federal Income Tax</td>
                  <td className="px-4 py-3 text-right text-gray-900">{fmt(r.annualFederalTax)}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{(r.effectiveFederalRate * 100).toFixed(2)}%</td>
                </tr>
                {r.annualStateTax > 0 && (
                  <tr>
                    <td className="px-4 py-3 text-gray-700">{st.name} State Tax</td>
                    <td className="px-4 py-3 text-right text-gray-900">{fmt(r.annualStateTax)}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{(r.effectiveStateRate * 100).toFixed(2)}%</td>
                  </tr>
                )}
                <tr>
                  <td className="px-4 py-3 text-gray-700">Social Security (6.2%)</td>
                  <td className="px-4 py-3 text-right text-gray-900">{fmt(r.annualSocialSecurity)}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{amount > FICA.socialSecurityWageCap ? `${((FICA.socialSecurityWageCap * FICA.socialSecurityRate) / amount * 100).toFixed(2)}%` : '6.20%'}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700">Medicare (1.45%)</td>
                  <td className="px-4 py-3 text-right text-gray-900">{fmt(r.annualMedicare)}</td>
                  <td className="px-4 py-3 text-right text-gray-500">1.45%</td>
                </tr>
                {r.additionalTaxDetails.map((tax) => (
                  <tr key={tax.name}>
                    <td className="px-4 py-3 text-gray-700">{tax.name}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{fmt(tax.annualAmount)}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{(tax.annualAmount / amount * 100).toFixed(2)}%</td>
                  </tr>
                ))}
                <tr className="bg-emerald-50">
                  <td className="px-4 py-3 font-bold text-gray-900">Total Take-Home</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">{fmt(annualNet)}</td>
                  <td className="px-4 py-3 text-right text-emerald-600">{(100 - r.effectiveTotalRate * 100).toFixed(1)}% kept</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Adjacent salary links */}
        <section className="mt-8 max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Compare Nearby Salaries in {st.name}</h2>
          <div className="flex flex-wrap gap-2">
            {prevSalary && (
              <Link
                href={`/calculator/${params.state}/salary/${prevSalary}`}
                className="text-sm bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
              >
                ← ${prevSalary.toLocaleString()}
              </Link>
            )}
            {nextSalary && (
              <Link
                href={`/calculator/${params.state}/salary/${nextSalary}`}
                className="text-sm bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
              >
                ${nextSalary.toLocaleString()} →
              </Link>
            )}
          </div>
          <div className="mt-4">
            <Link
              href={`/calculator/${params.state}`}
              className="text-sm text-emerald-600 hover:underline"
            >
              ← Back to {st.name} Paycheck Calculator
            </Link>
          </div>
        </section>

        <div className="mt-10">
          <AdUnit slot="8888888888" format="horizontal" className="rounded-xl bg-gray-50 border border-dashed border-gray-200 min-h-[90px]" />
        </div>
      </main>
      <Footer />
    </>
  )
}
