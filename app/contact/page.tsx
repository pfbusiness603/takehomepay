import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact TakeHomePay',
  description:
    'Get in touch with the TakeHomePay team. Report a tax rate issue, suggest a feature, or ask a question.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-600">Contact</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Contact Us</h1>
        <p className="text-gray-500 mb-10">
          We&apos;re a small independent team. We read every message and typically respond within 1–2 business days.
        </p>

        <div className="space-y-8">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Email Us</h2>
            <p className="text-sm text-gray-500 mb-3">
              For any questions, feedback, or to report an issue with the calculator or tax rates:
            </p>
            <a
              href="mailto:paulflanagan603@gmail.com"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              paulflanagan603@gmail.com
            </a>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Common Questions</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-800">I noticed a tax rate that looks wrong.</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Email us with the state and the specific rate you believe is incorrect — include a source if you have one.
                  We update rates annually but appreciate the heads up on any discrepancies.
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">I have a question about my specific paycheck.</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Our calculator provides estimates for general planning purposes. For questions about your specific
                  withholding, please contact your employer&apos;s payroll department or a qualified CPA.
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">I have a problem with my PDF pay stub purchase.</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Email us with your purchase details and we&apos;ll resolve it promptly. Stripe sends a receipt to
                  the email provided at checkout — check that for the download link first.
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">I have a feature idea.</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  We love hearing from users about what would make the calculator more useful. Send us an email
                  describing what you&apos;d like to see.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-500">
            <strong className="text-gray-700">Disclaimer:</strong> TakeHomePay is not a licensed tax advisor,
            CPA firm, or financial institution. The calculator is provided for estimation and educational purposes
            only. Always consult a qualified tax professional for advice specific to your situation.
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
