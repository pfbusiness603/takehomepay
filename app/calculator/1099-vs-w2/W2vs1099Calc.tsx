'use client'

import { useState, useMemo } from 'react'
import { STATES } from '@/lib/states'
import { calculate, formatCurrency } from '@/lib/calculator'

function computeW2Net(annualSalary: number, stateCode: string) {
  return calculate({
    grossPay: annualSalary / 26,
    payFrequency: 'biweekly',
    filingStatus: 'single',
    state: stateCode,
    allowances: 0,
    employmentType: 'w2',
    preTaxDeductions: { retirement401k: 0, healthInsurance: 0 },
  })
}

function compute1099Net(annualGross: number, stateCode: string) {
  return calculate({
    grossPay: annualGross / 26,
    payFrequency: 'biweekly',
    filingStatus: 'single',
    state: stateCode,
    allowances: 0,
    employmentType: '1099',
    preTaxDeductions: { retirement401k: 0, healthInsurance: 0 },
  })
}

function find1099Equivalent(
  w2Net: number,
  stateCode: string,
  annualHealthCost: number,
  annualBenefitsLost: number
): number {
  // Binary search for the 1099 gross that produces the same net (after health + benefits)
  const targetNet = w2Net + annualHealthCost + annualBenefitsLost
  let lo = w2Net, hi = w2Net * 2.5
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    const r = compute1099Net(mid, stateCode)
    if (r.annualNetPay < targetNet) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
function fmtFull(n: number) {
  return formatCurrency(n)
}
function pct(r: number) {
  return (r * 100).toFixed(1) + '%'
}

export default function W2vs1099Calc() {
  const [w2Salary, setW2Salary]     = useState(80000)
  const [stateCode, setStateCode]   = useState('CA')
  const [healthCost, setHealthCost] = useState(6000)   // annual health insurance cost for 1099
  const [benefits, setBenefits]     = useState(3000)   // 401k match / other benefits lost

  const w2 = useMemo(() => computeW2Net(w2Salary, stateCode), [w2Salary, stateCode])
  const equiv1099Gross = useMemo(
    () => find1099Equivalent(w2.annualNetPay, stateCode, healthCost, benefits),
    [w2.annualNetPay, stateCode, healthCost, benefits]
  )
  const equiv1099 = useMemo(() => compute1099Net(equiv1099Gross, stateCode), [equiv1099Gross, stateCode])

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">Your W-2 Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">W-2 Annual Salary</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                type="number"
                value={w2Salary}
                onChange={(e) => setW2Salary(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
            >
              {STATES.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Annual health insurance cost (as 1099)</label>
            <p className="text-xs text-gray-400 mb-1">What you&apos;d pay out-of-pocket as a contractor</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                type="number"
                value={healthCost}
                onChange={(e) => setHealthCost(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Annual benefits you&apos;d lose</label>
            <p className="text-xs text-gray-400 mb-1">401k match, dental, vision, etc.</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                type="number"
                value={benefits}
                onChange={(e) => setBenefits(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Result headline */}
      <div className="bg-indigo-600 rounded-2xl p-6 text-white">
        <p className="text-sm font-medium opacity-80 mb-1">1099 equivalent rate needed</p>
        <p className="text-4xl font-bold">{fmt(equiv1099Gross)}</p>
        <p className="text-sm opacity-70 mt-1">
          {fmt(equiv1099Gross - w2Salary)} more than your W-2 salary to break even after SE tax, health insurance, and lost benefits
        </p>
      </div>

      {/* Side-by-side breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* W-2 column */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="font-bold text-gray-900 mb-3 text-sm border-b border-gray-100 pb-2">
            W-2 Employee — {fmt(w2Salary)}/yr
          </p>
          <div className="space-y-1.5 text-sm">
            {[
              { label: 'Gross pay', value: fmtFull(w2.grossPay * 26), highlight: false },
              { label: 'Federal income tax', value: `−${fmt(w2.annualFederalTax)}` },
              { label: 'State tax', value: `−${fmt(w2.annualStateTax)}` },
              { label: 'Social Security (6.2%)', value: `−${fmt(w2.annualSocialSecurity)}` },
              { label: 'Medicare (1.45%)', value: `−${fmt(w2.annualMedicare)}` },
              ...w2.additionalTaxDetails.map(t => ({ label: t.name, value: `−${fmt(t.annualAmount)}` })),
              { label: 'Health insurance', value: 'Employer-sponsored', highlight: false },
              { label: '401k match', value: `+${fmt(benefits)} (employer)`, highlight: false },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center gap-2">
                <span className="text-gray-600">{label}</span>
                <span className="text-gray-900 font-medium tabular-nums text-right">{value}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 flex justify-between items-center font-bold">
              <span className="text-gray-900">Net take-home</span>
              <span className="text-emerald-600">{fmt(w2.annualNetPay)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Effective total rate</span>
              <span>{pct(w2.effectiveTotalRate)}</span>
            </div>
          </div>
        </div>

        {/* 1099 column */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="font-bold text-gray-900 mb-3 text-sm border-b border-gray-100 pb-2">
            1099 Contractor — {fmt(equiv1099Gross)}/yr
          </p>
          <div className="space-y-1.5 text-sm">
            {[
              { label: 'Gross pay (1099 rate)', value: fmtFull(equiv1099.grossPay * 26) },
              { label: 'Federal income tax', value: `−${fmt(equiv1099.annualFederalTax)}` },
              { label: 'State tax', value: `−${fmt(equiv1099.annualStateTax)}` },
              { label: 'Self-employment tax (15.3%)', value: `−${fmt(equiv1099.annualSelfEmploymentTax)}` },
              { label: 'Health insurance (self-pay)', value: `−${fmt(healthCost)}` },
              { label: 'Lost benefits', value: `−${fmt(benefits)}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center gap-2">
                <span className="text-gray-600">{label}</span>
                <span className="text-gray-900 font-medium tabular-nums text-right">{value}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 flex justify-between items-center font-bold">
              <span className="text-gray-900">True take-home</span>
              <span className="text-emerald-600">{fmt(equiv1099.annualNetPay - healthCost - benefits)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Effective total rate (incl. SE tax)</span>
              <span>{pct(equiv1099.effectiveTotalRate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key insight */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
        <strong>Key insight:</strong> As a 1099 contractor you pay <strong>both halves of FICA</strong> — the
        employee portion (7.65%) AND the employer portion (7.65%) — for a combined self-employment tax of
        15.3% on 92.35% of your net income. To truly match your W-2 income, you need to charge enough to cover
        this extra 7.65% on top of federal, state, health insurance, and lost benefits.
      </div>
    </div>
  )
}
