import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Calculator from '@/components/Calculator'
import AdUnit from '@/components/AdUnit'
import JsonLd, { webAppSchema, breadcrumbSchema, faqSchema } from '@/components/JsonLd'
import { STATES, stateBySlug } from '@/lib/states'
import { JOB_TYPES } from '@/lib/job-types'
import { STATE_TAX_CONFIGS } from '@/lib/tax-config'
import { calculate } from '@/lib/calculator'
import Link from 'next/link'
import StateSwitcher from '@/components/StateSwitcher'
import CompareSelect from '@/components/CompareSelect'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://takehomepaycalculator.dev'

// State-specific additional payroll deductions (SDI, PFML, etc.)
const STATE_EXTRA_NOTES: Record<string, string[]> = {
  CA: [
    'California State Disability Insurance (SDI): employees pay 1.1% on all wages — this is withheld in addition to state income tax.',
    'Los Angeles and San Francisco have no city income tax.',
    'California has one of the highest top marginal income tax rates in the country at 12.3%, plus a 1% Mental Health Services Tax on income above $1 million.',
  ],
  NY: [
    'New York Paid Family Leave (PFL): employees pay 0.373% on wages up to $400,124 per year.',
    'New York City residents pay an additional city income tax of 3.078%–3.876% depending on income — a significant addition to state taxes.',
    'Yonkers residents pay an additional surcharge of approximately 1.96%.',
    'New York State Disability Insurance (DBL): $0.60 per week maximum employee contribution.',
  ],
  NJ: [
    'New Jersey Family Leave Insurance (FLI): 0.06% on all wages, funds paid family leave benefits.',
    'Temporary Disability Insurance (TDI): 0.14% on wages up to $161,400.',
    'Unemployment Insurance (UI): 0.425% on wages up to $43,300.',
    'New Jersey has no city income taxes — only state-level income tax applies.',
  ],
  WA: [
    'Washington Paid Family & Medical Leave (PFML): employees pay approximately 0.53% of gross wages.',
    'Washington has no state income tax — one of just 9 states that does not tax earned income.',
    'Note: Washington does have a capital gains tax on gains above $270,000.',
  ],
  OR: [
    'Oregon Paid Leave: employees pay 60% of a 1% combined premium (approximately 0.6% of wages).',
    'Portland and Multnomah County residents may owe Metro and Multnomah County local income taxes.',
    'Statewide Transit Tax (STT): 0.1% on wages — very small but withheld automatically.',
  ],
  MA: [
    'Massachusetts Paid Family & Medical Leave (PFML): employees pay up to 0.46% of wages.',
    'Most Massachusetts income is taxed at a flat 5% rate — simple and predictable.',
  ],
  CO: [
    'Colorado Family & Medical Leave Insurance (FAMLI): employees pay 0.45% of gross wages.',
  ],
  HI: [
    'Hawaii Temporary Disability Insurance (TDI): 0.5% on wages, capped at $1,254.66 per week.',
    'Hawaii has no city or county income taxes beyond the state rate.',
  ],
  RI: [
    'Rhode Island Temporary Caregiver Insurance (TCI): 1.3% on wages up to $84,000.',
  ],
  CT: [
    'Connecticut Paid Family & Medical Leave: 0.5% on wages up to the Social Security wage cap ($184,500).',
  ],
  PA: [
    'Pennsylvania has a flat 3.07% income tax — one of the lowest flat rates in the country.',
    'Many Pennsylvania municipalities charge a local earned income tax (EIT), typically 1%–3.9%. Philadelphia residents pay a 3.75% city wage tax.',
  ],
  IL: [
    'Illinois has a flat 4.95% income tax rate — it does not have graduated brackets.',
    'Chicago residents pay no city income tax, but Illinois has relatively high property taxes.',
  ],
  TX: [
    'Texas has no state income tax — one of just 9 states with no personal income tax.',
    'Texas funds its government primarily through property taxes and a state sales tax.',
  ],
  FL: [
    'Florida has no state income tax — a major draw for workers and retirees.',
    'Florida has no local income taxes in any county or city.',
  ],
  AK: [
    'Alaska has no state income tax and no statewide sales tax.',
    'Alaska Permanent Fund Dividend: eligible residents receive an annual dividend payment from oil revenues.',
  ],
  NV: [
    'Nevada has no state income tax.',
    'Nevada has no city or local income taxes.',
  ],
  NH: [
    'New Hampshire has no income tax on wages — though interest and dividends income was previously taxed, that tax was eliminated as of January 2025.',
  ],
  SD: [
    'South Dakota has no state income tax.',
    'South Dakota has no local income taxes.',
  ],
  TN: [
    'Tennessee has no income tax on wages. The Hall Income Tax (on dividends and interest) was fully eliminated in 2021.',
  ],
  WY: [
    'Wyoming has no state income tax.',
    'Wyoming has no local income taxes and relatively low overall tax burden.',
  ],
  MD: [
    'Maryland counties charge a local income tax on top of the state rate, ranging from 2.25% to 3.2% depending on where you live.',
    'Baltimore City residents pay an additional 3.2% city income tax.',
  ],
  MO: [
    'Kansas City and St. Louis charge a local earnings tax of 1% on wages earned within the city.',
  ],
  OH: [
    'Many Ohio municipalities charge a city income tax of 1%–3%. Columbus charges 2.5%, Cleveland 2%, Cincinnati 1.8%.',
    'Ohio has no tax on the first $26,050 of income for individuals.',
  ],
  KY: [
    'Many Kentucky cities and counties charge a local occupational tax. Louisville charges 2.2% on wages.',
  ],
  IN: [
    'Indiana counties charge a local income tax ranging from 0.5% to 2.9% depending on county of residence.',
  ],
  MI: [
    'Several Michigan cities charge a city income tax. Detroit charges 2.4% for residents (1.2% for non-residents).',
  ],
}

const EXAMPLE_SALARIES = [50_000, 75_000, 100_000, 150_000]

interface Props {
  params: { state: string }
}

export async function generateStaticParams() {
  return STATES.map((s) => ({ state: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const st = stateBySlug(params.state)
  if (!st) return {}
  const title = `${st.name} Paycheck Calculator 2026 — Take-Home Pay`
  const description = `Calculate your ${st.name} take-home pay after federal and state income tax, Social Security, and Medicare. Free ${st.name} paycheck calculator updated for 2026.`
  const url = `${SITE_URL}/calculator/${params.state}`
  return {
    title,
    description,
    alternates: { canonical: `/calculator/${params.state}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: 'TakeHomePay',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

function pct(rate: number) {
  const val = rate * 100
  return val % 1 === 0 ? `${val.toFixed(0)}%` : `${val.toFixed(2).replace(/\.?0+$/, '')}%`
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function StateCalculatorPage({ params }: Props) {
  const st = stateBySlug(params.state)
  if (!st) notFound()

  const taxConfig = STATE_TAX_CONFIGS[st.code]
  const hasStateTax = taxConfig.brackets.single.some((b) => b.rate > 0)
  const extraNotes = STATE_EXTRA_NOTES[st.code] ?? []

  // Compute 4 salary examples server-side (runs at build time)
  const examples = EXAMPLE_SALARIES.map((annual) => {
    const r = calculate({
      grossPay: annual / 26,
      payFrequency: 'biweekly',
      filingStatus: 'single',
      state: st.code,
      allowances: 0,
      employmentType: 'w2',
      preTaxDeductions: { retirement401k: 0, healthInsurance: 0 },
    })
    return {
      annual,
      federal: r.annualFederalTax,
      state: r.annualStateTax,
      fica: r.annualSocialSecurity + r.annualMedicare,
      net: r.annualNetPay,
      effectiveRate: r.effectiveTotalRate,
    }
  })

  // State-specific FAQs
  const nonZeroBrackets = taxConfig.brackets.single.filter((b) => b.rate > 0)
  const maxRate = taxConfig.brackets.single.reduce((m, b) => Math.max(m, b.rate), 0)
  const stdDed = taxConfig.standardDeduction.single

  const faqs = hasStateTax
    ? [
        {
          q: `What are the ${st.name} income tax rates for 2026?`,
          a: nonZeroBrackets.length === 1
            ? `${st.name} has a flat income tax rate of ${pct(maxRate)} on all taxable income. This applies to all filers regardless of income level.`
            : `${st.name} uses a graduated income tax with rates from ${pct(nonZeroBrackets[0].rate)} to ${pct(maxRate)} for single filers in 2026. Higher income pushes more of your earnings into higher brackets, but only the income within each bracket is taxed at that bracket's rate.`,
        },
        {
          q: `What is the ${st.name} standard deduction in 2026?`,
          a: stdDed > 0
            ? `The ${st.name} standard deduction is $${stdDed.toLocaleString()} for single filers and $${taxConfig.standardDeduction.married.toLocaleString()} for married filers filing jointly. This amount is subtracted from your income before calculating state tax, reducing your taxable income.`
            : `${st.name} does not have a standard deduction for state income tax purposes.${taxConfig.personalExemption.single > 0 ? ` However, a personal exemption of $${taxConfig.personalExemption.single.toLocaleString()} is available for single filers.` : ''}`,
        },
        {
          q: `Does ${st.name} tax Social Security benefits?`,
          a: `Most states either fully exempt Social Security retirement benefits from state income tax or provide partial exemptions for lower-income retirees. ${st.name} residents should verify the current rules with the ${st.name} Department of Revenue, as these rules can change with new legislation.`,
        },
        {
          q: `How can I lower my ${st.name} state income tax?`,
          a: `The most effective way to reduce ${st.name} state income tax is to maximize pre-tax retirement contributions — 401(k), 403(b), or IRA contributions reduce your federal taxable income, and most states follow the federal treatment. Health Savings Account (HSA) contributions and flexible spending accounts (FSAs) may also reduce your ${st.name} taxable income. Consult a CPA familiar with ${st.name} tax law for personalized advice.`,
        },
        {
          q: `Is ${st.name} a high-tax or low-tax state?`,
          a: `${st.name}'s top income tax rate of ${pct(maxRate)} puts it ${maxRate > 0.07 ? 'among the higher-tax states nationally' : maxRate > 0.04 ? 'in the middle of the pack nationally' : 'among the lower-tax states nationally'}. Your overall tax burden also depends on property taxes, sales taxes, and any local income taxes in your city or county.`,
        },
      ]
    : [
        {
          q: `Does ${st.name} have a state income tax?`,
          a: `No. ${st.name} is one of only 9 states with no state income tax on wages. Residents still pay federal income tax (10%–37%), Social Security (6.2% on wages up to $184,500), and Medicare (1.45% on all wages).`,
        },
        {
          q: `How much more do I take home in ${st.name} compared to a high-tax state?`,
          a: `At a $75,000 salary as a single filer, a ${st.name} resident takes home approximately $3,000–$6,000 more per year compared to a resident of California (top rate 12.3%) or New York (top rate 9.65%). The exact savings depend on your income level.`,
        },
        {
          q: `What taxes do ${st.name} residents still pay?`,
          a: `${st.name} residents pay federal income tax using the standard 2026 brackets (10%–37%), Social Security tax (6.2% on wages up to $184,500), and Medicare (1.45% on all wages, plus 0.9% additional Medicare on wages above $200,000 for single filers). State and local sales taxes may also apply.`,
        },
        {
          q: `Does living in ${st.name} mean no taxes at all?`,
          a: `No — ${st.name} residents still owe federal income taxes, FICA payroll taxes (Social Security and Medicare), and potentially local taxes depending on the city. The savings come entirely from the absence of state income tax withholding on wages.`,
        },
      ]

  const pageUrl = `${SITE_URL}/calculator/${params.state}`
  const pageTitle = `${st.name} Paycheck Calculator 2026`
  const pageDesc = `Calculate your ${st.name} take-home pay after federal and state income tax. Free ${st.name} paycheck calculator updated for 2026.`

  const crumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'Paycheck Calculator', url: `${SITE_URL}/calculator/california` },
    { name: `${st.name} Calculator`, url: pageUrl },
  ]

  return (
    <>
      <JsonLd data={webAppSchema(pageTitle, pageDesc, pageUrl)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd data={faqSchema(faqs.map((f) => ({ q: f.q, a: f.a })))} />
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/states" className="hover:text-emerald-600 transition-colors">By State</Link>
          <span>/</span>
          <span className="text-gray-600">{st.name}</span>
        </nav>

        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            {st.name} Paycheck Calculator
          </h1>
          <p className="mt-3 text-gray-500">
            Calculate your {st.name} take-home pay after all federal and state taxes.{' '}
            {hasStateTax
              ? `${st.name} has a state income tax — see how much comes out of each paycheck.`
              : `${st.name} has no state income tax, so you keep more of every paycheck.`}
          </p>
          <StateSwitcher currentSlug={params.state} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="bg-white rounded-2xl border border-gray-100 p-6 h-96 animate-pulse" />}>
              <Calculator defaultState={st.code} />
            </Suspense>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <AdUnit slot="3333333333" format="rectangle" className="rounded-xl bg-gray-50 border border-dashed border-gray-200 min-h-[250px]" />

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">{st.name} by Job Type</h3>
                <ul className="space-y-1.5">
                  {JOB_TYPES.map((job) => (
                    <li key={job.slug}>
                      <Link
                        href={`/calculator/${params.state}/${job.slug}`}
                        className="text-sm text-gray-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5"
                      >
                        <span className="text-gray-300">→</span>
                        {job.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {/* Compare with another state */}
        <div className="mt-6 max-w-2xl">
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-sm text-gray-600 flex-1">
              Wondering how {st.name} compares to another state?
            </p>
            <CompareSelect currentSlug={params.state} />
          </div>
        </div>

        {/* ── 2026 State Tax Brackets ─────────────────────────────────────── */}
        <section className="mt-14 max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            2026 {st.name} State Income Tax Brackets
          </h2>

          {hasStateTax ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {taxConfig.brackets.single.filter(b => b.rate > 0).length === 1
                  ? `${st.name} uses a flat income tax — all taxable income is taxed at a single rate of ${pct(maxRate)}.`
                  : `${st.name} uses a graduated income tax system. Only the income that falls within each bracket is taxed at that bracket's rate — not your entire income.`}
                {stdDed > 0 && ` Single filers subtract a $${stdDed.toLocaleString()} standard deduction before calculating tax.`}
                {taxConfig.personalExemption.single > 0 && ` A personal exemption of $${taxConfig.personalExemption.single.toLocaleString()} also applies.`}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Taxable Income (Single)</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700">Tax Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {taxConfig.brackets.single.map((b, i) => (
                      <tr key={i} className="bg-white hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-700">
                          {b.max
                            ? `$${b.min.toLocaleString()} – $${b.max.toLocaleString()}`
                            : `Over $${b.min.toLocaleString()}`}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">{pct(b.rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {taxConfig.brackets.married[taxConfig.brackets.married.length - 1]?.max !==
               taxConfig.brackets.single[taxConfig.brackets.single.length - 1]?.max && (
                <p className="text-xs text-gray-400">
                  Married filing jointly uses different bracket thresholds. Use the calculator above to see your specific situation.
                </p>
              )}
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
              <p className="text-sm text-emerald-800 font-medium mb-2">
                {st.name} has no state income tax.
              </p>
              <p className="text-sm text-emerald-700">
                Residents only pay federal income tax, Social Security (6.2%), and Medicare (1.45%).
                At a $75,000 salary, this means keeping roughly $3,000–$5,000 more per year compared to living in a state like California or New York.
              </p>
            </div>
          )}
        </section>

        {/* ── What You Actually Keep — Salary Examples ───────────────────── */}
        <section className="mt-12 max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            What Workers Actually Take Home in {st.name}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Estimates for a single filer, W-2 employee, standard deduction, no additional withholding or pre-tax deductions. Federal tax uses 2026 brackets.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Annual Salary</th>
                  <th className="text-right px-3 py-3 font-semibold text-gray-700">Federal Tax</th>
                  <th className="text-right px-3 py-3 font-semibold text-gray-700">State Tax</th>
                  <th className="text-right px-3 py-3 font-semibold text-gray-700">FICA</th>
                  <th className="text-right px-4 py-3 font-semibold text-emerald-700">Take-Home</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {examples.map((ex) => (
                  <tr key={ex.annual} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{fmt(ex.annual)}</td>
                    <td className="px-3 py-3 text-right text-gray-600">{fmt(ex.federal)}</td>
                    <td className="px-3 py-3 text-right text-gray-600">{fmt(ex.state)}</td>
                    <td className="px-3 py-3 text-right text-gray-600">{fmt(ex.fica)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">{fmt(ex.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            These are estimates — actual withholding may vary based on your W-4, deductions, and local taxes.
          </p>
        </section>

        {/* ── State-Specific Additional Deductions ───────────────────────── */}
        {extraNotes.length > 0 && (
          <section className="mt-10 max-w-3xl">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Other {st.name} Payroll Considerations
            </h2>
            <ul className="space-y-2">
              {extraNotes.map((note, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-gray-600">
                  <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <section className="mt-10 max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            {st.name} Paycheck Calculator FAQ
          </h2>
          <dl className="space-y-6">
            {faqs.map(({ q, a }) => (
              <div key={q}>
                <dt className="font-semibold text-gray-900">{q}</dt>
                <dd className="mt-1.5 text-sm text-gray-600 leading-relaxed">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Mobile job type links */}
        <section className="mt-10 lg:hidden">
          <h3 className="font-semibold text-gray-900 mb-3">{st.name} Calculator by Job</h3>
          <div className="flex flex-wrap gap-2">
            {JOB_TYPES.map((job) => (
              <Link
                key={job.slug}
                href={`/calculator/${params.state}/${job.slug}`}
                className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
              >
                {job.label}
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-10">
          <AdUnit slot="4444444444" format="horizontal" className="rounded-xl bg-gray-50 border border-dashed border-gray-200 min-h-[90px]" />
        </div>
      </main>
      <Footer />
    </>
  )
}
