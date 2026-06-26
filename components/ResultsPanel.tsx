'use client'

import { useState } from 'react'
import { formatCurrency, formatPercent, type CalculatorResults, type CalculatorInputs } from '@/lib/calculator'
import { PAY_FREQUENCIES } from '@/lib/tax-config'
import PayStubForm from './PayStubForm'
import StateCompare from './StateCompare'
import AdUnit from './AdUnit'

interface ResultsPanelProps {
  results: CalculatorResults
  inputs: CalculatorInputs
  buildShareUrl: () => string
}

function Row({ label, value, highlight, sub }: { label: string; value: string; highlight?: boolean; sub?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-2.5 ${sub ? 'pl-4' : ''} ${highlight ? 'border-t border-gray-100 mt-1 pt-3' : ''}`}>
      <span className={`text-sm ${highlight ? 'font-semibold text-gray-900' : sub ? 'text-gray-500' : 'text-gray-700'}`}>
        {label}
      </span>
      <span className={`text-sm font-medium tabular-nums ${highlight ? 'text-emerald-600 text-base font-bold' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  )
}

export default function ResultsPanel({ results, inputs, buildShareUrl }: ResultsPanelProps) {
  const [view, setView] = useState<'paycheck' | 'annual'>('paycheck')
  const [showStubForm, setShowStubForm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [dismissedW4Tip, setDismissedW4Tip] = useState(false)

  function handleShare() {
    const url = buildShareUrl()
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const freq = PAY_FREQUENCIES[inputs.payFrequency].label
  const isPaycheck = view === 'paycheck'
  const periods = PAY_FREQUENCIES[inputs.payFrequency].periodsPerYear
  const mult = isPaycheck ? 1 : periods
  const is1099 = results.employmentType === '1099'

  const gross    = isPaycheck ? results.grossPay                : results.annualGross
  const preTax   = isPaycheck ? results.preTaxDeductionsTotal   : results.preTaxDeductionsTotal * periods
  const federal  = isPaycheck ? results.federalTax              : results.annualFederalTax
  const state    = isPaycheck ? results.stateTax                : results.annualStateTax
  const ss       = isPaycheck ? results.socialSecurity          : results.annualSocialSecurity
  const medicare = isPaycheck ? results.medicare                : results.annualMedicare
  const seTax    = isPaycheck ? results.selfEmploymentTax       : results.annualSelfEmploymentTax
  const net      = isPaycheck ? results.netPay                  : results.annualNetPay

  const showW4Tip = !is1099 && !dismissedW4Tip && results.effectiveTotalRate > 0 &&
    Math.abs(results.effectiveFederalRate - results.effectiveTotalRate * 0.6) > 0.05

  return (
    <div className="space-y-4" id="generate-stub">

      {/* Net Pay Hero — CTA lives here at peak attention */}
      <div className="bg-emerald-600 rounded-2xl p-6 text-white">
        <p className="text-sm font-medium opacity-80 mb-1">
          {isPaycheck ? `${freq} Take-Home Pay` : 'Annual Take-Home Pay'}
        </p>
        <p className="text-5xl font-bold tracking-tight">{formatCurrency(net)}</p>
        <p className="text-sm opacity-70 mt-1.5">
          {is1099 ? 'Self-employed · ' : ''}Effective tax rate: {formatPercent(results.effectiveTotalRate)}
        </p>

        {/* PDF CTA — right at the emotional peak */}
        <div className="mt-5 pt-4 border-t border-white/20 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Need an official pay stub?</p>
            <p className="text-xs text-white/70 mt-0.5">PDF with earnings breakdown, employer info &amp; YTD totals</p>
          </div>
          <button
            onClick={() => setShowStubForm(true)}
            className="shrink-0 bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap shadow-sm"
          >
            Generate Pay Stub — $5.99
          </button>
        </div>

        {/* Share link — small, below CTA */}
        <button
          onClick={handleShare}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white/90 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {copied ? 'Link copied!' : 'Share results'}
        </button>
      </div>

      {/* Per-paycheck / Annual toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        <button
          onClick={() => setView('paycheck')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            isPaycheck ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Per Paycheck
        </button>
        <button
          onClick={() => setView('annual')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            !isPaycheck ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Annual
        </button>
      </div>

      {/* Deduction breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 divide-y divide-gray-50">
        <Row label="Gross Pay" value={formatCurrency(gross)} />
        {preTax > 0 && (
          <>
            <Row label="Pre-Tax Deductions" value={`−${formatCurrency(preTax)}`} />
            {inputs.preTaxDeductions.retirement401k > 0 && (
              <Row sub label={is1099 ? 'SEP-IRA / Solo 401(k)' : '401(k) / Retirement'} value={`−${formatCurrency(inputs.preTaxDeductions.retirement401k * mult)}`} />
            )}
            {inputs.preTaxDeductions.healthInsurance > 0 && (
              <Row sub label="Health Insurance" value={`−${formatCurrency(inputs.preTaxDeductions.healthInsurance * mult)}`} />
            )}
            {(inputs.preTaxDeductions.hsa ?? 0) > 0 && (
              <Row sub label="HSA" value={`−${formatCurrency((inputs.preTaxDeductions.hsa ?? 0) * mult)}`} />
            )}
            {(inputs.preTaxDeductions.fsa ?? 0) > 0 && (
              <Row sub label="FSA" value={`−${formatCurrency((inputs.preTaxDeductions.fsa ?? 0) * mult)}`} />
            )}
          </>
        )}
        <Row label="Federal Income Tax" value={`−${formatCurrency(federal)}`} />
        <Row label={`${results.stateName} State Tax`} value={`−${formatCurrency(state)}`} />
        {is1099 ? (
          <Row label="Self-Employment Tax (15.3%)" value={`−${formatCurrency(seTax)}`} />
        ) : (
          <>
            <Row label="Social Security (6.2%)" value={`−${formatCurrency(ss)}`} />
            <Row label="Medicare (1.45%)" value={`−${formatCurrency(medicare)}`} />
            {results.additionalTaxDetails.map((tax) => (
              <Row
                key={tax.name}
                label={`${tax.name}`}
                value={`−${formatCurrency(isPaycheck ? tax.perPaycheck : tax.annualAmount)}`}
              />
            ))}
            {results.additionalWithholding > 0 && (
              <Row
                label="Extra Withholding (W-4)"
                value={`−${formatCurrency(isPaycheck ? results.additionalWithholding : results.additionalWithholding * periods)}`}
              />
            )}
          </>
        )}
        <Row label="Take-Home Pay" value={formatCurrency(net)} highlight />
      </div>

      {/* Effective rates */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Federal Rate', value: formatPercent(results.effectiveFederalRate) },
          { label: 'State Rate',   value: formatPercent(results.effectiveStateRate) },
          { label: 'Total Rate',   value: formatPercent(results.effectiveTotalRate) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* AdSense — between rate cards and tips */}
      <AdUnit
        slot="1234567890"
        format="auto"
        className="rounded-xl bg-gray-50 border border-dashed border-gray-200 min-h-[90px]"
      />

      {/* W-4 withholding tip (dismissible) */}
      {showW4Tip && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1 text-sm text-blue-800">
            <strong>W-4 tip:</strong> Your effective federal rate is {formatPercent(results.effectiveFederalRate)}. Consider reviewing your W-4 withholding to avoid a large tax bill or refund at year-end.
          </div>
          <button onClick={() => setDismissedW4Tip(true)} className="text-blue-400 hover:text-blue-600 text-lg leading-none shrink-0">&times;</button>
        </div>
      )}

      {/* State comparison — collapsed by default */}
      <StateCompare
        grossPay={inputs.grossPay}
        payFrequency={inputs.payFrequency}
        filingStatus={inputs.filingStatus}
      />

      <p className="text-xs text-gray-400 leading-relaxed text-center px-2">
        Results are estimates based on 2026 tax rates. Actual withholding may vary.{' '}
        <strong>Not tax or financial advice.</strong>
      </p>

      {showStubForm && (
        <PayStubForm results={results} inputs={inputs} onClose={() => setShowStubForm(false)} />
      )}
    </div>
  )
}
