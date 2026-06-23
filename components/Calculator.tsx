'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
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
}

const DEFAULT_INPUTS: CalculatorInputs = {
  grossPay: 2_500,
  payFrequency: 'biweekly',
  filingStatus: 'single',
  state: 'TX',
  allowances: 0,
  employmentType: 'w2',
  preTaxDeductions: { retirement401k: 0, healthInsurance: 0 },
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
  if (k401 || health) {
    out.preTaxDeductions = {
      retirement401k: k401 ? parseFloat(k401) : 0,
      healthInsurance: health ? parseFloat(health) : 0,
    }
  }

  const allowances = sp.get('allow')
  if (allowances) out.allowances = parseInt(allowances)

  const hourly = sp.get('hourly')
  if (hourly) out.hourlyRate = parseFloat(hourly)

  const hours = sp.get('hours')
  if (hours) out.hoursPerWeek = parseFloat(hours)

  return out
}

export default function Calculator({ defaultState, defaultGross, jobLabel }: CalculatorProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [payType, setPayType] = useState<PayType>('salary')
  const [hourlyRate, setHourlyRate] = useState(25)
  const [hoursPerWeek, setHoursPerWeek] = useState(40)

  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    const overrides = parseSearchParams(searchParams, defaultState, defaultGross)
    return { ...DEFAULT_INPUTS, state: defaultState ?? DEFAULT_INPUTS.state, grossPay: defaultGross ?? DEFAULT_INPUTS.grossPay, ...overrides }
  })

  const [results, setResults] = useState<CalculatorResults | null>(null)
  const [hasCalculated, setHasCalculated] = useState(false)
  const didAutoCalc = useRef(false)

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
      const res = calculate(computedInputs)
      setResults(res)
      setHasCalculated(true)
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

  const handleCalculate = useCallback(() => {
    const res = calculate(inputs)
    setResults(res)
    setHasCalculated(true)
    trackEvent('calculate_paycheck', {
      state: inputs.state,
      pay_frequency: inputs.payFrequency,
      filing_status: inputs.filingStatus,
      employment_type: inputs.employmentType,
    })
  }, [inputs])

  function setField<K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  function setDeduction(key: 'retirement401k' | 'healthInsurance', value: number) {
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
    if (inputs.allowances) params.set('allow', inputs.allowances.toString())
    if (inputs.preTaxDeductions.retirement401k) params.set('k401', inputs.preTaxDeductions.retirement401k.toString())
    if (inputs.preTaxDeductions.healthInsurance) params.set('health', inputs.preTaxDeductions.healthInsurance.toString())
    return `${window.location.origin}${pathname}?${params.toString()}`
  }

  const inputBase = 'w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900'
  const selectBase = `${inputBase} bg-white`

  return (
    <div className="space-y-6">
      {jobLabel && (
        <p className="text-sm text-emerald-600 font-medium uppercase tracking-wide">
          Optimized for {jobLabel}
        </p>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

        {/* Pay type toggle: salary vs hourly */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {(['salary', 'hourly'] as PayType[]).map((t) => (
            <button
              key={t}
              onClick={() => setPayType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                payType === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'salary' ? 'Salary / Fixed Pay' : 'Hourly Wage'}
            </button>
          ))}
        </div>

        {/* Employment type toggle: W-2 vs 1099 */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {([['w2', 'W-2 Employee'], ['1099', '1099 / Self-Employed']] as [EmploymentType, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setField('employmentType', val)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                inputs.employmentType === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {inputs.employmentType === '1099' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            <strong>1099 mode:</strong> Self-employment tax (15.3%) replaces standard FICA. Half of SE tax is deductible from federal income.
          </div>
        )}

        {/* Gross / Hourly inputs */}
        {payType === 'salary' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {inputs.employmentType === '1099' ? 'Net Income Per Period' : 'Gross Pay Per Paycheck'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Pay Frequency</label>
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours Per Week</label>
                <input
                  type="number" min="1" max="80" step="0.5"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(parseFloat(e.target.value) || 40)}
                  className={inputBase}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pay Frequency</label>
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
            <div className="bg-emerald-50 rounded-xl px-4 py-3 text-sm text-emerald-800">
              <span className="font-medium">Estimated gross per paycheck: </span>
              ${inputs.grossPay.toFixed(2)}
            </div>
          </div>
        )}

        {/* Filing Status + State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filing Status</label>
            <select
              value={inputs.filingStatus}
              onChange={(e) => setField('filingStatus', e.target.value as FilingStatus)}
              className={selectBase}
            >
              <option value="single">Single</option>
              <option value="married">Married Filing Jointly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
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
        </div>

        {/* Allowances — only relevant for W-2 */}
        {inputs.employmentType === 'w2' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              W-4 Allowances
              <span className="ml-1 text-xs text-gray-400 font-normal">(0 if using 2020+ W-4)</span>
            </label>
            <input
              type="number" min="0" max="20"
              value={inputs.allowances}
              onChange={(e) => setField('allowances', parseInt(e.target.value) || 0)}
              className={inputBase}
            />
          </div>
        )}

        {/* Pre-Tax Deductions */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Pre-Tax Deductions (Per Paycheck)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {inputs.employmentType === '1099' ? 'SEP-IRA / Solo 401(k)' : '401(k) / Retirement'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">$</span>
                <input
                  type="number" min="0" step="0.01"
                  value={inputs.preTaxDeductions.retirement401k}
                  onChange={(e) => setDeduction('retirement401k', parseFloat(e.target.value) || 0)}
                  className={`${inputBase} pl-7`}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Health Insurance Premium</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">$</span>
                <input
                  type="number" min="0" step="0.01"
                  value={inputs.preTaxDeductions.healthInsurance}
                  onChange={(e) => setDeduction('healthInsurance', parseFloat(e.target.value) || 0)}
                  className={`${inputBase} pl-7`}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-4 rounded-xl transition-colors duration-150 text-lg shadow-sm"
        >
          Calculate Take-Home Pay
        </button>
      </div>

      {hasCalculated && results && (
        <ResultsPanel results={results} inputs={inputs} buildShareUrl={buildShareUrl} />
      )}
    </div>
  )
}
