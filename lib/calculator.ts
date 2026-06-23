import {
  FEDERAL_BRACKETS,
  FEDERAL_STANDARD_DEDUCTION,
  FICA,
  STATE_TAX_CONFIGS,
  PAY_FREQUENCIES,
  type TaxBracket,
  type PayFrequency,
  type FilingStatus,
} from './tax-config'

export type EmploymentType = 'w2' | '1099'

export interface CalculatorInputs {
  grossPay: number           // per paycheck
  payFrequency: PayFrequency
  filingStatus: FilingStatus
  state: string
  allowances: number
  employmentType: EmploymentType
  preTaxDeductions: {
    retirement401k: number   // per paycheck, pre-tax
    healthInsurance: number  // per paycheck, pre-tax
  }
}

export interface CalculatorResults {
  // Per paycheck
  grossPay: number
  preTaxDeductionsTotal: number
  federalTaxableIncome: number
  federalTax: number
  stateTax: number
  socialSecurity: number        // W-2 only; 0 for 1099
  medicare: number              // W-2 only; 0 for 1099
  selfEmploymentTax: number     // 1099 only; 0 for W-2
  totalTaxes: number
  netPay: number
  employmentType: EmploymentType

  // Effective rates
  effectiveFederalRate: number
  effectiveStateRate: number
  effectiveTotalRate: number

  // Annual
  annualGross: number
  annualFederalTax: number
  annualStateTax: number
  annualSocialSecurity: number
  annualMedicare: number
  annualSelfEmploymentTax: number
  annualNetPay: number

  // YTD
  ytdGross: number
  ytdFederal: number
  ytdState: number
  ytdSocialSecurity: number
  ytdMedicare: number
  ytdNet: number

  stateName: string
}

function applyBrackets(taxableIncome: number, brackets: TaxBracket[]): number {
  let tax = 0
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break
    const upper = bracket.max === null ? taxableIncome : Math.min(taxableIncome, bracket.max)
    tax += (upper - bracket.min) * bracket.rate
  }
  return Math.max(0, tax)
}

const ALLOWANCE_VALUE_2026 = 4_300

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const { grossPay, payFrequency, filingStatus, state, allowances, employmentType, preTaxDeductions } = inputs
  const periods = PAY_FREQUENCIES[payFrequency].periodsPerYear
  const is1099 = employmentType === '1099'

  const annualGross = grossPay * periods
  const annualPreTax = (preTaxDeductions.retirement401k + preTaxDeductions.healthInsurance) * periods
  const annualFicaBase = Math.max(0, annualGross - preTaxDeductions.retirement401k * periods)

  // ── Self-employment tax (1099) ──────────────────────────────────────────────
  // SE tax applies to 92.35% of net SE income (the 0.9235 factor accounts for the
  // deductible employer-half of SE tax itself). Combined rate: 15.3% (12.4% SS + 2.9% Medicare).
  // Half of SE tax is deductible from federal gross income.
  let annualSelfEmploymentTax = 0
  let seTaxDeduction = 0

  if (is1099) {
    const seBase = annualFicaBase * 0.9235
    const ssCap = FICA.socialSecurityWageCap
    const sePortion = Math.min(seBase, ssCap) * 0.124  // SS portion (12.4%)
    const medicarePortion = seBase * 0.029              // Medicare portion (2.9%)
    const additionalThreshold = FICA.additionalMedicareThreshold[filingStatus]
    const addlMedicare = seBase > additionalThreshold
      ? (seBase - additionalThreshold) * FICA.additionalMedicareRate
      : 0
    annualSelfEmploymentTax = sePortion + medicarePortion + addlMedicare
    seTaxDeduction = (sePortion + medicarePortion) / 2  // half deductible from federal income
  }

  // ── W-2 FICA ────────────────────────────────────────────────────────────────
  let annualSS = 0
  let annualTotalMedicare = 0

  if (!is1099) {
    const ssCap = FICA.socialSecurityWageCap
    annualSS = Math.min(annualFicaBase, ssCap) * FICA.socialSecurityRate
    const annualMedicare = annualFicaBase * FICA.medicareRate
    const additionalMedicareThreshold = FICA.additionalMedicareThreshold[filingStatus]
    const annualAddlMedicare = annualFicaBase > additionalMedicareThreshold
      ? (annualFicaBase - additionalMedicareThreshold) * FICA.additionalMedicareRate
      : 0
    annualTotalMedicare = annualMedicare + annualAddlMedicare
  }

  // ── Federal income tax ───────────────────────────────────────────────────────
  const federalStdDed = FEDERAL_STANDARD_DEDUCTION[filingStatus]
  const allowanceDeduction = allowances * ALLOWANCE_VALUE_2026
  const annualFederalTaxable = Math.max(
    0,
    annualGross - annualPreTax - federalStdDed - allowanceDeduction - seTaxDeduction
  )
  const annualFederalTax = applyBrackets(annualFederalTaxable, FEDERAL_BRACKETS[filingStatus])

  // ── State income tax ─────────────────────────────────────────────────────────
  const stateConfig = STATE_TAX_CONFIGS[state.toUpperCase()] ?? STATE_TAX_CONFIGS['TX']
  const stateStdDed = stateConfig.standardDeduction[filingStatus]
  const stateExemption = stateConfig.personalExemption[filingStatus]
  const annualStateTaxable = Math.max(0, annualGross - annualPreTax - stateStdDed - stateExemption)
  const annualStateTax = applyBrackets(annualStateTaxable, stateConfig.brackets[filingStatus])

  // ── Per-paycheck conversion ──────────────────────────────────────────────────
  const federalTax       = annualFederalTax / periods
  const stateTax         = annualStateTax / periods
  const socialSecurity   = annualSS / periods
  const medicare         = annualTotalMedicare / periods
  const selfEmploymentTax = annualSelfEmploymentTax / periods
  const preTaxTotal      = preTaxDeductions.retirement401k + preTaxDeductions.healthInsurance

  const totalTaxes = federalTax + stateTax + socialSecurity + medicare + selfEmploymentTax
  const netPay = grossPay - preTaxTotal - totalTaxes

  const totalFica = annualSS + annualTotalMedicare + annualSelfEmploymentTax
  const effectiveFederalRate = annualGross > 0 ? annualFederalTax / annualGross : 0
  const effectiveStateRate   = annualGross > 0 ? annualStateTax / annualGross : 0
  const effectiveTotalRate   = annualGross > 0 ? (annualFederalTax + annualStateTax + totalFica) / annualGross : 0

  const annualNetPay = annualGross - annualPreTax - annualFederalTax - annualStateTax - totalFica

  return {
    grossPay,
    preTaxDeductionsTotal: preTaxTotal,
    federalTaxableIncome: annualFederalTaxable,
    federalTax,
    stateTax,
    socialSecurity,
    medicare,
    selfEmploymentTax,
    totalTaxes,
    netPay,
    employmentType,
    effectiveFederalRate,
    effectiveStateRate,
    effectiveTotalRate,
    annualGross,
    annualFederalTax,
    annualStateTax,
    annualSocialSecurity: annualSS,
    annualMedicare: annualTotalMedicare,
    annualSelfEmploymentTax,
    annualNetPay,
    ytdGross: annualGross,
    ytdFederal: annualFederalTax,
    ytdState: annualStateTax,
    ytdSocialSecurity: annualSS,
    ytdMedicare: annualTotalMedicare,
    ytdNet: annualNetPay,
    stateName: stateConfig.name,
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatPercent(rate: number): string {
  return (rate * 100).toFixed(2) + '%'
}
