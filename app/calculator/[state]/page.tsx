import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Calculator from '@/components/Calculator'
import AdUnit from '@/components/AdUnit'
import JsonLd, { webAppSchema, breadcrumbSchema } from '@/components/JsonLd'
import { STATES, stateBySlug } from '@/lib/states'
import { JOB_TYPES } from '@/lib/job-types'
import { STATE_TAX_CONFIGS } from '@/lib/tax-config'
import Link from 'next/link'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://takehomepay.app'

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

export default function StateCalculatorPage({ params }: Props) {
  const st = stateBySlug(params.state)
  if (!st) notFound()

  const taxConfig = STATE_TAX_CONFIGS[st.code]
  const hasStateTax = taxConfig.brackets.single.some((b) => b.rate > 0)

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
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/calculator/california" className="hover:text-emerald-600 transition-colors">Calculator</Link>
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

              {/* Job type links */}
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

        {/* State tax info */}
        <section className="mt-12 max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-3">{st.name} State Income Tax (2026)</h2>
          <div className="text-sm text-gray-600 space-y-2">
            {hasStateTax ? (
              <>
                <p>
                  {st.name} taxes wages at rates ranging from{' '}
                  <strong>{(Math.min(...taxConfig.brackets.single.map((b) => b.rate)) * 100).toFixed(1)}%</strong> to{' '}
                  <strong>{(Math.max(...taxConfig.brackets.single.map((b) => b.rate)) * 100).toFixed(1)}%</strong>.
                </p>
                <p>
                  The standard deduction for single filers is{' '}
                  <strong>${taxConfig.standardDeduction.single.toLocaleString()}</strong> and for married filers is{' '}
                  <strong>${taxConfig.standardDeduction.married.toLocaleString()}</strong>.
                </p>
              </>
            ) : (
              <p>
                <strong>{st.name} does not have a state income tax.</strong> Residents only pay federal income taxes, Social Security, and Medicare, resulting in higher take-home pay compared to most other states.
              </p>
            )}
          </div>
        </section>

        {/* Mobile job type links */}
        <section className="mt-8 lg:hidden">
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
