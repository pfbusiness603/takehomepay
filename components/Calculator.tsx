'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import { STATES } from '@/lib/states'
import { PAY_FREQUENCIES, type PayFrequency, type FilingStatus } from '@/lib/tax-config'
import { calculate, type CalculatorInputs, type CalculatorResults, type EmploymentType } from '@/lib/calculator'
import { trackEvent } from '@/lib/analytics'
import ResultsPanel from './ResultsPanel'

interface CalculatorProps {
  defaultState?: string
  defaultGross?: number
  jobLabel?: string
  hideStateSelector?: boolean
}

const DEFAULT_INPUTS: CalculatorInputs = {
  grossPay: 2_500,
  payFrequency: 'biweekly',
  filingStatus: 'single',
  state: 'TX',
  allowances: 0,
  employmentType: 'w2',
  preTaxDeductions: { retirement401k: 0, healthInsurance: 0, hsa: 0, fsa: 0 },
  additionalWithholding: 0,
}

type PayType = 'salary' | 'hourly'

const HOURS_PER_PERIOD: Record<PayFrequency, (h: number) => number> = {
  weekly:      (h) => h,
  biweekly:    (h) => h * 2,
  semimonthly: (h) => h * (52 / 24),
  monthly:     (h) => h * (52 / 12),
}

function parseSearchParams(
  sp: URLSearchParams,
  defaultState?: string,
  defaultGross?: number
): Partial<CalculatorInputs> & { hourlyRate?: number; hoursPerWeek?: number } {
  const out: ReturnType<typeof parseSearchParams> = {}

  const gross = sp.get('gross')
  if (gross) out.grossPay = parseFloat(gross)
  else if (defaultGross) out.grossPay = defaultGross

  const state = sp.get('state') ?? defaultState
  if (state) out.state = state.toUpperCase()

  const freq = sp.get('freq') as PayFrequency | null
  if (freq && freq in PAY_FREQUENCIES) out.payFrequency = freq

  const filing = sp.get('filing') as FilingStatus | null
  if (filing === 'single' || filing === 'married') out.filingStatus = filing

  const emp = sp.get('emp') as EmploymentType | null
  if (emp === 'w2' || emp === '1099') out.employmentType = emp

  const k401 = sp.get('k401')
  const health = sp.get('health')
  const hsa = sp.get('hsa')
  const fsa = sp.get('fsa')
  if (k401 || health || hsa || fsa) {
    out.preTaxDeductions = {
      retirement401k: k401 ? parseFloat(k401) : 0,
      healthInsurance: health ? parseFloat(health) : 0,
      hsa: hsa ? parseFloat(hsa) : 0,
      fsa: fsa ? parseFloat(fsa) : 0,
    }
  }

  const addl = sp.get('addl')
  if (addl) out.additionalWithholding = parseFloat(addl)

  const hourly = sp.get('hourly')
  if (hourly) out.hourlyRate = parseFloat(hourly)

  const hours = sp.get('hours')
  if (hours) out.hoursPerWeek = parseFloat(hours)

  return out
}

export default function Calculator({ defaultState, defaultGross, jobLabel, hideStateSelector }: CalculatorProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [payType, setPayType] = useState<PayType>('salary')
  const [hourlyRate, setHourlyRate] = useState(25)
  const [hoursPerWeek, setHoursPerWeek] = useState(40)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    const base = { ...DEFAULT_INPUTS, state: defaultState ?? DEFAULT_INPUTS.state, grossPay: defaultGross ?? DEFAULT_INPUTS.grossPay }
    const overrides = parseSearchParams(searchParams, defaultState, defaultGross)
    return { ...base, ...overrides }
  })

  const [results, setResults] = useState<CalculatorResults>(() => {
    const base = { ...DEFAULT_INPUTS, state: defaultState ?? DEFAULT_INPUTS.state, grossPay: defaultGross ?? DEFAULT_INPUTS.grossPay }
    const overrides = parseSearchParams(searchParams, defaultState, defaultGross)
    return calculate({ ...base, ...overrides })
  })

  const didAutoCalc = useRef(false)

  // Auto-calculate whenever inputs change
  useEffect(() => {
    const res = calculate(inputs)
    setResults(res)
  }, [inputs])

  // Handle URL params with hourly mode on first load
  useEffect(() => {
    if (!didAutoCalc.current && (searchParams.has('gross') || searchParams.has('hourly'))) {
      didAutoCalc.current = true
      const overrides = parseSearchParams(searchParams, defaultState, defaultGross)
      const computedInputs = { ...DEFAULT_INPUTS, ...overrides }
      if (overrides.hourlyRate && overrides.hoursPerWeek) {
        setPayType('hourly')
        setHourlyRate(overrides.hourlyRate)
        setHoursPerWeek(overrides.hoursPerWeek)
        computedInputs.grossPay = parseFloat(
          (HOURS_PER_PERIOD[computedInputs.payFrequency](overrides.hoursPerWeek) * overrides.hourlyRate).toFixed(2)
        )
      }
      setInputs(computedInputs)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (payType === 'hourly') {
      const gross = parseFloat(
        (HOURS_PER_PERIOD[inputs.payFrequency](hoursPerWeek) * hourlyRate).toFixed(2)
      )
      setInputs((prev) => ({ ...prev, grossPay: gross }))
    }
  }, [payType, hourlyRate, hoursPerWeek, inputs.payFrequency])

  function setField<K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }))
    if (key === 'state' || key === 'payFrequency' || key === 'filingStatus' || key === 'employmentType') {
      trackEvent('calculate_paycheck', {
        state: key === 'state' ? String(value) : inputs.state,
        pay_frequency: key === 'payFrequency' ? String(value) : inputs.payFrequency,
        filing_status: key === 'filingStatus' ? String(value) : inputs.filingStatus,
        employment_type: key === 'employmentType' ? String(value) : inputs.employmentType,
      })
    }
  }

  function setDeduction(key: 'retirement401k' | 'healthInsurance' | 'hsa' | 'fsa', value: number) {
    setInputs((prev) => ({
      ...prev,
      preTaxDeductions: { ...prev.preTaxDeductions, [key]: value },
    }))
  }

  function buildShareUrl(): string {
    const params = new URLSearchParams()
    if (payType === 'hourly') {
      params.set('hourly', hourlyRate.toString())
      params.set('hours', hoursPerWeek.toString())
    } else {
      params.set('gross', inputs.grossPay.toString())
    }
    params.set('state', inputs.state)
    params.set('freq', inputs.payFrequency)
    params.set('filing', inputs.filingStatus)
    params.set('emp', inputs.employmentType)
    if (inputs.preTaxDeductions.retirement401k) params.set('k401', inputs.preTaxDeductions.retirement401k.toString())
    if (inputs.preTaxDeductions.healthInsurance) params.set('health', inputs.preTaxDeductions.healthInsurance.toString())
    if (inputs.preTaxDeductions.hsa) params.set('hsa', inputs.preTaxDeductions.hsa.toString())
    if (inputs.preTaxDeductions.fsa) params.set('fsa', inputs.preTaxDeductions.fsa.toString())
    if (inputs.additionalWithholding) params.set('addl', inputs.additionalWithholding.toString())
    return `${window.location.origin}${pathname}?${params.toString()}`
  }

  const inputBase = 'w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900'
  const selectBase = `${inputBase} bg-white`

  const hasDeductions = inputs.preTaxDeductions.retirement401k > 0 || inputs.preTaxDeductions.healthInsurance > 0 ||
    (inputs.preTaxDeductions.hsa ?? 0) > 0 || (inputs.preTaxDeductions.fsa ?? 0) > 0 ||
    (inputs.additionalWithholding ?? 0) > 0

  return (
    <div className="space-y-4">
      {jobLabel && (
        <p className="text-sm text-emerald-600 font-medium uppercase tracking-wide">
          Optimized for {jobLabel}
        </p>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">

        {/* Pay type toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {(['salary', 'hourly'] as PayType[]).map((t) => (
            <button
              key={t}
              onClick={() => setPayType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                payType === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'salary' ? 'Salary' : 'Hourly'}
            </button>
          ))}
        </div>

        {/* Pay amount + frequency */}
        {payType === 'salary' ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                {inputs.employmentType === '1099' ? 'Income Per Period' : 'Gross Pay'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 font-medium">$</span>
                <input
                  type="number" min="0" step="0.01"
                  value={inputs.grossPay}
                  onChange={(e) => setField('grossPay', parseFloat(e.target.value) || 0)}
                  className={`${inputBase} pl-7`}
                  placeholder="2500.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Pay Frequency</label>
              <select
                value={inputs.payFrequency}
                onChange={(e) => setField('payFrequency', e.target.value as PayFrequency)}
                className={selectBase}
              >
                {Object.entries(PAY_FREQUENCIES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Hourly Rate</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">$</span>
                  <input
                    type="number" min="0" step="0.01"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                    className={`${inputBase} pl-7`}
                    placeholder="25.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Hours/Week</label>
                <input
                  type="number" min="1" max="80" step="0.5"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(parseFloat(e.target.value) || 40)}
                  className={inputBase}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Pay Frequency</label>
              <select
                value={inputs.payFrequency}
                onChange={(e) => setField('payFrequency', e.target.value as PayFrequency)}
                className={selectBase}
              >
                {Object.entries(PAY_FREQUENCIES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <p className="text-sm text-emerald-700 font-medium bg-emerald-50 rounded-lg px-3 py-2">
              Gross per paycheck: ${inputs.grossPay.toFixed(2)}
            </p>
          </div>
        )}

        {/* State + Filing Status */}
        <div className="grid grid-cols-2 gap-3">
          {!hideStateSelector && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">State</label>
            <select
              value={inputs.state}
              onChange={(e) => setField('state', e.target.value)}
              className={selectBase}
            >
              {STATES.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Filing Status</label>
            <select
              value={inputs.filingStatus}
              onChange={(e) => setField('filingStatus', e.target.value as FilingStatus)}
              className={selectBase}
            >
              <option value="single">Single</option>
              <option value="married">Married</option>
            </select>
          </div>
        </div>

        {/* W-2 vs 1099 — compact inline toggle */}
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-gray-600 font-medium">Employment type</span>
          <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {([['w2', 'W-2'], ['1099', '1099']] as [EmploymentType, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setField('employmentType', val)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  inputs.employmentType === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {inputs.employmentType === '1099' && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            Self-employment tax (15.3%) replaces standard FICA. Half is deductible from federal income.
          </p>
        )}

        {/* Advanced options toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {showAdvanced ? 'Hide' : 'Add'} deductions
          {hasDeductions && !showAdvanced && (
            <span className="bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 rounded-full font-medium">active</span>
          )}
        </button>

        {showAdvanced && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {inputs.employmentType === '1099' ? 'SEP-IRA / Solo 401(k)' : '401(k) / Retirement'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">$</span>
                  <input
                    type="number" min="0" step="0.01"
                    value={inputs.preTaxDeductions.retirement401k}
                    onChange={(e) => setDeduction('retirement401k', parseFloat(e.target.value) || 0)}
                    className={`${inputBase} pl-7 text-sm`}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Health Insurance</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">$</span>
                  <input
                    type="number" min="0" step="0.01"
                    value={inputs.preTaxDeductions.healthInsurance}
                    onChange={(e) => setDeduction('healthInsurance', parseFloat(e.target.value) || 0)}
                    className={`${inputBase} pl-7 text-sm`}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">HSA Contribution</label>
                <p className="text-xs text-gray-400 mb-1">2026 limit: $4,300 single / $8,550 family</p>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">$</span>
                  <input
                    type="number" min="0" step="0.01"
                    value={inputs.preTaxDeductions.hsa ?? 0}
                    onChange={(e) => setDeduction('hsa', parseFloat(e.target.value) || 0)}
                    className={`${inputBase} pl-7 text-sm`}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">FSA Contribution</label>
                <p className="text-xs text-gray-400 mb-1">2026 limit: $3,300/yr</p>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">$</span>
                  <input
                    type="number" min="0" step="0.01"
                    value={inputs.preTaxDeductions.fsa ?? 0}
                    onChange={(e) => setDeduction('fsa', parseFloat(e.target.value) || 0)}
                    className={`${inputBase} pl-7 text-sm`}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {inputs.employmentType === 'w2' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Extra Withholding (W-4 line 4c)</label>
                <p className="text-xs text-gray-400 mb-1">Additional amount withheld per paycheck — does not reduce taxable income</p>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">$</span>
                  <input
                    type="number" min="0" step="0.01"
                    value={inputs.additionalWithholding ?? 0}
                    onChange={(e) => setField('additionalWithholding', parseFloat(e.target.value) || 0)}
                    className={`${inputBase} pl-7 text-sm`}
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ResultsPanel results={results} inputs={inputs} buildShareUrl={buildShareUrl} />
    </div>
  )
}
