import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { STATES } from '@/lib/states'

export const metadata: Metadata = {
  title: 'Paycheck Calculator by State | TakeHomePay',
  description: 'Calculate your take-home pay for all 50 states. Select your state for a detailed paycheck breakdown including federal and state taxes.',
}

export default function StatesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Paycheck Calculator by State</h1>
            <p className="text-gray-600 text-lg">Select your state to calculate your exact take-home pay including all state and federal taxes.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {STATES.map((state) => (
              <Link
                key={state.code}
                href={`/calculator/${state.slug}`}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-sm transition-all group"
              >
                <span className="text-xs font-bold text-gray-400 group-hover:text-emerald-600 mb-1">{state.code}</span>
                <span className="text-sm font-medium text-gray-800 group-hover:text-emerald-700 text-center leading-tight">{state.name}</span>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">All calculations use 2026 federal and state tax rates.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
