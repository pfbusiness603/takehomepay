'use client'

import { useState, useMemo } from 'react'
import { STATES } from '@/lib/states'
import { calculate, formatCurrency, formatPercent } from '@/lib/calculator'
import { type PayFrequency, type FilingStatus } from '@/lib/tax-config'

interface StateCompareProps {
  grossPay: number
  payFrequency: PayFrequency
  filingStatus: FilingStatus
}

const DEFAULTS = ['CA', 'TX', 'NY']

export default function StateCompare({ grossPay, payFrequency, filingStatus }: StateCompareProps) {
  const [selected, setSelected] = useState<string[]>(DEFAULTS)
  const [open, setOpen] = useState(false)

  const results = useMemo(() =>
    selected.map((code) => {
      const st = STATES.find((s) => s.code === code)
      const res = calculate({
        grossPay,
        payFrequency,
        filingStatus,
        state: code,
        allowances: 0,
        employmentType: 'w2',
        preTaxDeductions: { retirement401k: 0, healthInsurance: 0 },
      })
      return { code, name: st?.name ?? code, netPay: res.netPay, effectiveTotalRate: res.effectiveTotalRate }
    }),
    [selected, grossPay, payFrequency, filingStatus]
  )

  function setSlot(index: number, code: string) {
    setSelected((prev) => prev.map((c, i) => (i === index ? code : c)))
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div>
          <p className="font-semibold text-gray-900 text-sm">Compare States</p>
          <p className="text-xs text-gray-500 mt-0.5">See how your take-home pay differs across states</p>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-50">
          <div className="grid grid-cols-3 gap-3 pt-4">
            {results.map((r, i) => (
              <div key={i} className="space-y-2">
                <select
                  value={r.code}
                  onChange={(e) => setSlot(i, e.target.value)}
                  className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white text-gray-700"
                >
                  {STATES.map((s) => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Take-Home</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(r.netPay)}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatPercent(r.effectiveTotalRate)} total tax</p>
                </div>
              </div>
            ))}
          </div>

          {/* Diff vs best */}
          {(() => {
            const best = Math.max(...results.map((r) => r.netPay))
            return (
              <div className="flex gap-3">
                {results.map((r, i) => {
                  const diff = r.netPay - best
                  return diff < 0 ? (
                    <div key={i} className="flex-1 text-center text-xs text-red-500">
                      {formatCurrency(diff)}/paycheck vs {results.find((x) => x.netPay === best)?.name}
                    </div>
                  ) : (
                    <div key={i} className="flex-1 text-center text-xs text-emerald-600 font-medium">
                      Best option
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
