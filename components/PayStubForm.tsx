'use client'

import { useState } from 'react'
import { type CalculatorResults, type CalculatorInputs } from '@/lib/calculator'
import { PAY_FREQUENCIES } from '@/lib/tax-config'

interface PayStubFormProps {
  results: CalculatorResults
  inputs: CalculatorInputs
  onClose: () => void
}

export default function PayStubForm({ results, inputs, onClose }: PayStubFormProps) {
  const [form, setForm] = useState({
    employerName: '',
    employeeName: '',
    payPeriodStart: '',
    payPeriodEnd: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function setField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleCheckout() {
    if (!form.employerName || !form.employeeName || !form.payPeriodStart || !form.payPeriodEnd) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stubData: {
            ...form,
            payFrequency: inputs.payFrequency,
            filingStatus: inputs.filingStatus,
            state: inputs.state,
            results,
          },
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const freq = PAY_FREQUENCIES[inputs.payFrequency].label

  const today = new Date()
  const maxDate = `${today.getFullYear() + 1}-12-31`
  const minDate = '2000-01-01'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">

        {/* Header — always visible */}
        <div className="flex justify-between items-start px-6 pt-6 pb-4 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Pay Stub Details</h2>
            <p className="text-sm text-gray-500 mt-0.5">{freq} • {results.stateName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Scrollable form area */}
        <div className="overflow-y-auto flex-1 px-6 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employer Name</label>
            <input
              type="text"
              value={form.employerName}
              onChange={(e) => setField('employerName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
            <input
              type="text"
              value={form.employeeName}
              onChange={(e) => setField('employeeName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Jane Smith"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period Start</label>
              <input
                type="date"
                value={form.payPeriodStart}
                min={minDate}
                max={maxDate}
                onChange={(e) => setField('payPeriodStart', e.target.value)}
                className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period End</label>
              <input
                type="date"
                value={form.payPeriodEnd}
                min={minDate}
                max={maxDate}
                onChange={(e) => setField('payPeriodEnd', e.target.value)}
                className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 space-y-1">
            <div className="flex justify-between"><span>Gross Pay</span><span className="font-medium">${results.grossPay.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Total Deductions</span><span className="font-medium">−${(results.preTaxDeductionsTotal + results.totalTaxes).toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-1 mt-1">
              <span>Net Pay</span><span className="text-emerald-600">${results.netPay.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action area — always pinned at bottom */}
        <div className="px-6 pt-4 pb-6 space-y-2 shrink-0">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            {loading ? 'Redirecting to payment…' : 'Pay $5.99 & Download PDF'}
          </button>
          <p className="text-xs text-center text-gray-400">Secure payment via Stripe · PDF delivered instantly</p>
          <p className="text-xs text-center text-gray-400 leading-relaxed">
            For personal record-keeping only. Not intended for misrepresenting income to any party.
          </p>
        </div>

      </div>
    </div>
  )
}
