'use client'

import { useState } from 'react'
import Link from 'next/link'
import { STATES } from '@/lib/states'

const POPULAR_SLUGS = ['california', 'texas', 'new-york', 'florida', 'illinois', 'washington', 'georgia', 'ohio']

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const popular = STATES.filter((s) => POPULAR_SLUGS.includes(s.slug))

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="font-bold text-gray-900">💵 TakeHomePay</span>
              <button onClick={() => setOpen(false)} className="text-gray-400 text-2xl leading-none">&times;</button>
            </div>

            <nav className="flex-1 overflow-y-auto p-5 space-y-6">
              <div>
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="block text-base font-semibold text-gray-900 py-2"
                >
                  Paycheck Calculator
                </Link>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Tools</p>
                <ul className="space-y-2">
                  <li>
                    <Link href="/calculator/1099-vs-w2" onClick={() => setOpen(false)} className="block text-sm text-gray-700 hover:text-emerald-600 py-1 transition-colors">
                      1099 vs W-2 Calculator
                    </Link>
                  </li>
                  <li>
                    <Link href="/compare/california-vs-texas" onClick={() => setOpen(false)} className="block text-sm text-gray-700 hover:text-emerald-600 py-1 transition-colors">
                      Compare States
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Popular States</p>
                <ul className="space-y-2">
                  {popular.map((s) => (
                    <li key={s.code}>
                      <Link
                        href={`/calculator/${s.slug}`}
                        onClick={() => setOpen(false)}
                        className="block text-sm text-gray-700 hover:text-emerald-600 py-1 transition-colors"
                      >
                        {s.name} Calculator
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            <div className="p-5 border-t border-gray-100">
              <Link
                href="/#generate-stub"
                onClick={() => setOpen(false)}
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                PDF Pay Stub — $5.99
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
