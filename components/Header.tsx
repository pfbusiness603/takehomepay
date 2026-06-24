import Link from 'next/link'
import MobileNav from './MobileNav'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">💵</span>
          <span className="font-bold text-gray-900 text-lg">TakeHomePay</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Calculator</Link>
          <Link href="/calculator/california" className="hover:text-emerald-600 transition-colors">By State</Link>
          <a
            href="/#generate-stub"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            PDF Pay Stub — $4.99
          </a>
        </nav>

        {/* Mobile hamburger */}
        <MobileNav />
      </div>
    </header>
  )
}
