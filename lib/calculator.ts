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
    hsa?: number             // per paycheck, pre-tax (Section 125; 2026 limits: $4,300 single / $8,550 family)
    fsa?: number             // per paycheck, pre-tax (Section 125; 2026 limit: $3,300)
  }
  additionalWithholding?: number  // per paycheck, W-4 line 4c extra withholding
}

export interface AdditionalTaxDetail {
  name: string
  shortName: string
  perPaycheck: number
  annualAmount: number
}

export interface CalculatorResults {
  // Per paycheck
  grossPay: number
  preTaxDeductionsTotal: number
  additionalWithholding: number
  federalTaxableIncome: number
  federalTax: number
  stateTax: number
  socialSecurity: number        // W-2 only; 0 for 1099
  medicare: number              // W-2 only; 0 for 1099
  selfEmploymentTax: number     // 1099 only; 0 for W-2
  additionalTaxesPerPaycheck: number   // SDI, PFML, etc. (W-2 only)
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
  annualAdditionalTaxes: number
  annualNetPay: number

  // YTD
  ytdGross: number
  ytdFederal: number
  ytdState: number
  ytdSocialSecurity: number
  ytdMedicare: number
  ytdNet: number

  // Additional state payroll taxes (SDI, PFML, etc.)
  additionalTaxDetails: AdditionalTaxDetail[]

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
  const extraWithholding = inputs.additionalWithholding ?? 0

  const annualGross = grossPay * periods
  const annualPreTax = (
    preTaxDeductions.retirement401k +
    preTaxDeductions.healthInsurance +
    (preTaxDeductions.hsa ?? 0) +
    (preTaxDeductions.fsa ?? 0)
  ) * periods
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

  // ── Additional state payroll taxes (SDI, PFML, TDI, etc.) — W-2 only ────────
  const additionalTaxDetails: AdditionalTaxDetail[] = []
  let annualAdditionalTaxes = 0

  if (!is1099) {
    for (const tax of stateConfig.additionalTaxes ?? []) {
      let annualAmount = 0

      if (tax.weeklyFlatAmount !== undefined) {
        // NY SDI: flat $0.60/week regardless of wages
        annualAmount = tax.weeklyFlatAmount * 52
      } else if (tax.weeklyRateCap !== undefined && tax.rate !== undefined) {
        // HI TDI: rate × weekly wages, capped at $6.87/week
        const weeklyGross = annualFicaBase / 52
        const weeklyTax = Math.min(weeklyGross * tax.rate, tax.weeklyRateCap)
        annualAmount = weeklyTax * 52
      } else if (tax.rate !== undefined) {
        const taxableWages = tax.wageCap ? Math.min(annualFicaBase, tax.wageCap) : annualFicaBase
        annualAmount = taxableWages * tax.rate
      }

      additionalTaxDetails.push({
        name: tax.name,
        shortName: tax.shortName,
        perPaycheck: annualAmount / periods,
        annualAmount,
      })
      annualAdditionalTaxes += annualAmount
    }
  }

  // ── Per-paycheck conversion ──────────────────────────────────────────────────
  const federalTax            = annualFederalTax / periods
  const stateTax              = annualStateTax / periods
  const socialSecurity        = annualSS / periods
  const medicare              = annualTotalMedicare / periods
  const selfEmploymentTax     = annualSelfEmploymentTax / periods
  const additionalTaxesPerPaycheck = annualAdditionalTaxes / periods
  const preTaxTotal           = preTaxDeductions.retirement401k + preTaxDeductions.healthInsurance +
    (preTaxDeductions.hsa ?? 0) + (preTaxDeductions.fsa ?? 0)

  const totalTaxes = federalTax + stateTax + socialSecurity + medicare + selfEmploymentTax + additionalTaxesPerPaycheck + extraWithholding
  const netPay = grossPay - preTaxTotal - totalTaxes

  const totalFica = annualSS + annualTotalMedicare + annualSelfEmploymentTax
  const effectiveFederalRate = annualGross > 0 ? annualFederalTax / annualGross : 0
  const effectiveStateRate   = annualGross > 0 ? annualStateTax / annualGross : 0
  const effectiveTotalRate   = annualGross > 0
    ? (annualFederalTax + annualStateTax + totalFica + annualAdditionalTaxes) / annualGross
    : 0

  const annualNetPay = annualGross - annualPreTax - annualFederalTax - annualStateTax - totalFica - annualAdditionalTaxes - extraWithholding * periods

  return {
    grossPay,
    preTaxDeductionsTotal: preTaxTotal,
    additionalWithholding: extraWithholding,
    federalTaxableIncome: annualFederalTaxable,
    federalTax,
    stateTax,
    socialSecurity,
    medicare,
    selfEmploymentTax,
    additionalTaxesPerPaycheck,
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
    annualAdditionalTaxes,
    annualNetPay,
    ytdGross: annualGross,
    ytdFederal: annualFederalTax,
    ytdState: annualStateTax,
    ytdSocialSecurity: annualSS,
    ytdMedicare: annualTotalMedicare,
    ytdNet: annualNetPay,
    additionalTaxDetails,
    stateName: stateConfig.name,
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatPercent(rate: number): string {
  return (rate * 100).toFixed(2) + '%'
}
