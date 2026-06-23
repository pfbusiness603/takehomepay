import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Calculator from '@/components/Calculator'
import AdUnit from '@/components/AdUnit'
import JsonLd, { webAppSchema, breadcrumbSchema } from '@/components/JsonLd'
import { STATES, stateBySlug } from '@/lib/states'
import { JOB_TYPES, jobBySlug } from '@/lib/job-types'
import Link from 'next/link'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://takehomepay.app'

interface Props {
  params: { state: string; jobtype: string }
}

export async function generateStaticParams() {
  const params: { state: string; jobtype: string }[] = []
  for (const state of STATES) {
    for (const job of JOB_TYPES) {
      params.push({ state: state.slug, jobtype: job.slug })
    }
  }
  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const st = stateBySlug(params.state)
  const job = jobBySlug(params.jobtype)
  if (!st || !job) return {}
  const title = `${st.name} ${job.label} Paycheck Calculator 2026`
  const description = `${job.description} Calculated with ${st.name} state taxes and 2026 federal tax brackets.`
  const url = `${SITE_URL}/calculator/${params.state}/${params.jobtype}`
  return {
    title,
    description,
    alternates: { canonical: `/calculator/${params.state}/${params.jobtype}` },
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

export default function StateJobCalculatorPage({ params }: Props) {
  const st = stateBySlug(params.state)
  const job = jobBySlug(params.jobtype)
  if (!st || !job) notFound()

  const pageUrl = `${SITE_URL}/calculator/${params.state}/${params.jobtype}`
  const pageTitle = `${st.name} ${job.label} Paycheck Calculator 2026`
  const pageDesc = `${job.description} Calculated with ${st.name} state taxes and 2026 federal tax brackets.`

  const crumbs = [
    { name: 'Home', url: SITE_URL },
    { name: `${st.name} Calculator`, url: `${SITE_URL}/calculator/${params.state}` },
    { name: job.label, url: pageUrl },
  ]

  return (
    <>
      <JsonLd data={webAppSchema(pageTitle, pageDesc, pageUrl)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/calculator/${params.state}`} className="hover:text-emerald-600 transition-colors">{st.name}</Link>
          <span>/</span>
          <span className="text-gray-600">{job.label}</span>
        </nav>

        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            {st.name} {job.title} Paycheck Calculator
          </h1>
          <p className="mt-3 text-gray-500">{job.description} Updated for 2026 {st.name} tax rates.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="bg-white rounded-2xl border border-gray-100 p-6 h-96 animate-pulse" />}>
              <Calculator
                defaultState={st.code}
                defaultGross={job.defaultGross}
                jobLabel={job.title}
              />
            </Suspense>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <AdUnit slot="5555555555" format="rectangle" className="rounded-xl bg-gray-50 border border-dashed border-gray-200 min-h-[250px]" />

              {/* Other job types in same state */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Other {st.name} Calculators</h3>
                <ul className="space-y-1.5">
                  {JOB_TYPES.filter((j) => j.slug !== job.slug).map((j) => (
                    <li key={j.slug}>
                      <Link
                        href={`/calculator/${params.state}/${j.slug}`}
                        className="text-sm text-gray-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5"
                      >
                        <span className="text-gray-300">→</span>
                        {j.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {/* Salary context */}
        <section className="mt-12 max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {job.title} Salary in {st.name}
          </h2>
          <p className="text-sm text-gray-600">
            The calculator above is pre-loaded with a typical {job.label.toLowerCase()} bi-weekly gross pay of{' '}
            <strong>${job.defaultGross.toLocaleString()}</strong> (approximately{' '}
            <strong>${(job.defaultGross * 26).toLocaleString()}/year</strong>). Adjust the gross pay to match your actual paycheck. The results reflect 2026 {st.name} state tax rates and federal brackets.
          </p>
        </section>

        <div className="mt-10">
          <AdUnit slot="6666666666" format="horizontal" className="rounded-xl bg-gray-50 border border-dashed border-gray-200 min-h-[90px]" />
        </div>
      </main>
      <Footer />
    </>
  )
}
