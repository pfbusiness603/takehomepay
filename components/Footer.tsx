import Link from 'next/link'
import { STATES } from '@/lib/states'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <p className="font-bold text-gray-900 mb-1">💵 TakeHomePay</p>
            <p className="text-sm text-gray-500">
              Free paycheck calculator for all 50 states. 2026 tax rates. Generate professional PDF pay stubs instantly.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Popular States</p>
            <ul className="space-y-1 text-sm text-gray-500">
              {['california', 'texas', 'new-york', 'florida', 'illinois'].map((slug) => {
                const st = STATES.find((s) => s.slug === slug)
                return st ? (
                  <li key={slug}>
                    <Link href={`/calculator/${slug}`} className="hover:text-emerald-600 transition-colors">
                      {st.name} Paycheck Calculator
                    </Link>
                  </li>
                ) : null
              })}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Tools</p>
            <ul className="space-y-1 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-emerald-600 transition-colors">Paycheck Calculator</Link></li>
              <li><Link href="/#generate-stub" className="hover:text-emerald-600 transition-colors">PDF Pay Stub — $5.99</Link></li>
              <li><Link href="/how-we-calculate" className="hover:text-emerald-600 transition-colors">How We Calculate</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Company</p>
            <ul className="space-y-1 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-emerald-600 transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-emerald-600 transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* State links for SEO */}
        <div className="border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">Calculate by State</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {STATES.map((s) => (
              <Link
                key={s.code}
                href={`/calculator/${s.slug}`}
                className="text-xs text-gray-400 hover:text-emerald-600 transition-colors"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 mt-6 pt-6 text-xs text-gray-400 space-y-2">
          <p>
            <strong className="text-gray-500">Disclaimer:</strong> TakeHomePay is provided for informational and estimation purposes only.
            Results are not guaranteed to reflect your actual paycheck and do not constitute tax, legal, or financial advice.
            Tax laws change frequently — always verify with your employer, payroll provider, or a qualified CPA.
            PDF pay stubs are generated for personal record-keeping only and should not be used to misrepresent income.
          </p>
          <div className="flex flex-col sm:flex-row justify-between gap-1">
            <p>© {new Date().getFullYear()} TakeHomePay. All rights reserved.</p>
            <p>Tax rates updated for 2026.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
