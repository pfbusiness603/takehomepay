// 2026 Federal Tax Brackets (IRS Rev. Proc. 2025-xx estimate based on 2025 + ~2.8% inflation adj.)
// FICA rates per IRS Publication 15, 2026

export interface TaxBracket {
  min: number
  max: number | null
  rate: number
}

// Additional payroll taxes beyond income tax (SDI, PFML, TDI, etc.)
export interface AdditionalPayrollTax {
  name: string             // Full display name: "California SDI"
  shortName: string        // Abbreviated: "SDI"
  rate?: number            // Annual rate (e.g., 0.011 for 1.1%)
  wageCap?: number         // Annual wage cap (e.g., 87_000 for RI TDI)
  weeklyFlatAmount?: number  // Fixed weekly deduction (NY SDI: $0.60/week)
  weeklyRateCap?: number   // Max weekly deduction via rate (HI TDI: $6.87/week)
}

export interface StateTaxConfig {
  name: string
  code: string
  brackets: {
    single: TaxBracket[]
    married: TaxBracket[]
  }
  standardDeduction: {
    single: number
    married: number
  }
  personalExemption: {
    single: number
    married: number
  }
  additionalTaxes?: AdditionalPayrollTax[]
}

// ─── Federal ─────────────────────────────────────────────────────────────────

export const FEDERAL_STANDARD_DEDUCTION = {
  single: 15_000,
  married: 30_000,
} as const

export const FEDERAL_BRACKETS: { single: TaxBracket[]; married: TaxBracket[] } = {
  single: [
    { min: 0,        max: 11_925,  rate: 0.10 },
    { min: 11_925,   max: 48_475,  rate: 0.12 },
    { min: 48_475,   max: 103_350, rate: 0.22 },
    { min: 103_350,  max: 197_300, rate: 0.24 },
    { min: 197_300,  max: 250_525, rate: 0.32 },
    { min: 250_525,  max: 626_350, rate: 0.35 },
    { min: 626_350,  max: null,    rate: 0.37 },
  ],
  married: [
    { min: 0,        max: 23_850,  rate: 0.10 },
    { min: 23_850,   max: 96_950,  rate: 0.12 },
    { min: 96_950,   max: 206_700, rate: 0.22 },
    { min: 206_700,  max: 394_600, rate: 0.24 },
    { min: 394_600,  max: 501_050, rate: 0.32 },
    { min: 501_050,  max: 751_600, rate: 0.35 },
    { min: 751_600,  max: null,    rate: 0.37 },
  ],
}

// ─── FICA ─────────────────────────────────────────────────────────────────────

export const FICA = {
  socialSecurityRate: 0.062,
  socialSecurityWageCap: 184_500,
  medicareRate: 0.0145,
  additionalMedicareRate: 0.009,
  additionalMedicareThreshold: {
    single: 200_000,
    married: 250_000,
  },
} as const

// ─── State Tax Configs ────────────────────────────────────────────────────────

const NO_TAX: { single: TaxBracket[]; married: TaxBracket[] } = {
  single:  [{ min: 0, max: null, rate: 0 }],
  married: [{ min: 0, max: null, rate: 0 }],
}

const NO_DEDUCTION = { single: 0, married: 0 }
const NO_EXEMPTION = { single: 0, married: 0 }

function flat(rate: number): { single: TaxBracket[]; married: TaxBracket[] } {
  return {
    single:  [{ min: 0, max: null, rate }],
    married: [{ min: 0, max: null, rate }],
  }
}

export const STATE_TAX_CONFIGS: Record<string, StateTaxConfig> = {
  AL: {
    name: 'Alabama', code: 'AL',
    brackets: {
      single: [
        { min: 0,      max: 500,   rate: 0.02 },
        { min: 500,    max: 3_000, rate: 0.04 },
        { min: 3_000,  max: null,  rate: 0.05 },
      ],
      married: [
        { min: 0,      max: 1_000, rate: 0.02 },
        { min: 1_000,  max: 6_000, rate: 0.04 },
        { min: 6_000,  max: null,  rate: 0.05 },
      ],
    },
    standardDeduction: { single: 3_000, married: 8_500 },
    personalExemption: { single: 1_500, married: 3_000 },
  },
  AK: {
    name: 'Alaska', code: 'AK',
    brackets: NO_TAX,
    standardDeduction: NO_DEDUCTION,
    personalExemption: NO_EXEMPTION,
  },
  AZ: {
    name: 'Arizona', code: 'AZ',
    brackets: flat(0.025),
    standardDeduction: { single: 14_600, married: 29_200 }, // mirrors federal
    personalExemption: NO_EXEMPTION,
  },
  AR: {
    name: 'Arkansas', code: 'AR',
    brackets: {
      single: [
        { min: 0,       max: 5_099,  rate: 0.02 },
        { min: 5_099,   max: 10_299, rate: 0.04 },
        { min: 10_299,  max: null,   rate: 0.044 },
      ],
      married: [
        { min: 0,       max: 5_099,  rate: 0.02 },
        { min: 5_099,   max: 10_299, rate: 0.04 },
        { min: 10_299,  max: null,   rate: 0.044 },
      ],
    },
    standardDeduction: { single: 2_340, married: 4_680 },
    personalExemption: { single: 29, married: 58 },
  },
  CA: {
    name: 'California', code: 'CA',
    brackets: {
      single: [
        { min: 0,        max: 10_756,  rate: 0.01 },
        { min: 10_756,   max: 25_499,  rate: 0.02 },
        { min: 25_499,   max: 40_245,  rate: 0.04 },
        { min: 40_245,   max: 55_866,  rate: 0.06 },
        { min: 55_866,   max: 70_606,  rate: 0.08 },
        { min: 70_606,   max: 360_659, rate: 0.093 },
        { min: 360_659,  max: 432_787, rate: 0.103 },
        { min: 432_787,  max: 721_314, rate: 0.113 },
        { min: 721_314,  max: null,    rate: 0.123 },
      ],
      married: [
        { min: 0,        max: 21_512,  rate: 0.01 },
        { min: 21_512,   max: 50_998,  rate: 0.02 },
        { min: 50_998,   max: 80_490,  rate: 0.04 },
        { min: 80_490,   max: 111_732, rate: 0.06 },
        { min: 111_732,  max: 141_212, rate: 0.08 },
        { min: 141_212,  max: 721_318, rate: 0.093 },
        { min: 721_318,  max: 865_574, rate: 0.103 },
        { min: 865_574,  max: null,    rate: 0.113 },
      ],
    },
    standardDeduction: { single: 5_540, married: 11_080 },
    personalExemption: { single: 144,   married: 288 },
    additionalTaxes: [
      // SDI rate: 1.1% as of 2024, no wage cap (removed cap — source: EDD 2024)
      { name: 'California SDI', shortName: 'SDI', rate: 0.011 },
    ],
  },
  CO: {
    name: 'Colorado', code: 'CO',
    brackets: flat(0.044),
    standardDeduction: { single: 15_000, married: 30_000 }, // mirrors federal
    personalExemption: NO_EXEMPTION,
    additionalTaxes: [
      // FAMLI: employee pays 50% of 0.9% — source: CDLE 2026
      { name: 'CO FAMLI', shortName: 'FAMLI', rate: 0.0045, wageCap: 184_500 },
    ],
  },
  CT: {
    name: 'Connecticut', code: 'CT',
    brackets: {
      single: [
        { min: 0,       max: 10_000,  rate: 0.02 },
        { min: 10_000,  max: 50_000,  rate: 0.045 },
        { min: 50_000,  max: 100_000, rate: 0.055 },
        { min: 100_000, max: 200_000, rate: 0.06 },
        { min: 200_000, max: 250_000, rate: 0.065 },
        { min: 250_000, max: 500_000, rate: 0.069 },
        { min: 500_000, max: null,    rate: 0.0699 },
      ],
      married: [
        { min: 0,       max: 20_000,  rate: 0.02 },
        { min: 20_000,  max: 100_000, rate: 0.045 },
        { min: 100_000, max: 200_000, rate: 0.055 },
        { min: 200_000, max: 400_000, rate: 0.06 },
        { min: 400_000, max: 500_000, rate: 0.065 },
        { min: 500_000, max: 1_000_000, rate: 0.069 },
        { min: 1_000_000, max: null,  rate: 0.0699 },
      ],
    },
    standardDeduction: NO_DEDUCTION,
    personalExemption: { single: 15_000, married: 24_000 },
    additionalTaxes: [
      // PFML: 0.5% up to SS wage base — source: CT PFML Authority 2026
      { name: 'CT Paid Family Leave', shortName: 'PFML', rate: 0.005, wageCap: 184_500 },
    ],
  },
  DE: {
    name: 'Delaware', code: 'DE',
    brackets: {
      single: [
        { min: 0,       max: 2_000,  rate: 0 },
        { min: 2_000,   max: 5_000,  rate: 0.022 },
        { min: 5_000,   max: 10_000, rate: 0.039 },
        { min: 10_000,  max: 20_000, rate: 0.048 },
        { min: 20_000,  max: 25_000, rate: 0.052 },
        { min: 25_000,  max: 60_000, rate: 0.0555 },
        { min: 60_000,  max: null,   rate: 0.066 },
      ],
      married: [
        { min: 0,       max: 2_000,  rate: 0 },
        { min: 2_000,   max: 5_000,  rate: 0.022 },
        { min: 5_000,   max: 10_000, rate: 0.039 },
        { min: 10_000,  max: 20_000, rate: 0.048 },
        { min: 20_000,  max: 25_000, rate: 0.052 },
        { min: 25_000,  max: 60_000, rate: 0.0555 },
        { min: 60_000,  max: null,   rate: 0.066 },
      ],
    },
    standardDeduction: { single: 3_250, married: 6_500 },
    personalExemption: { single: 110, married: 220 },
  },
  FL: {
    name: 'Florida', code: 'FL',
    brackets: NO_TAX,
    standardDeduction: NO_DEDUCTION,
    personalExemption: NO_EXEMPTION,
  },
  GA: {
    name: 'Georgia', code: 'GA',
    brackets: flat(0.0549),
    standardDeduction: { single: 5_400, married: 7_100 },
    personalExemption: { single: 2_700, married: 5_400 },
  },
  HI: {
    name: 'Hawaii', code: 'HI',
    brackets: {
      single: [
        { min: 0,        max: 2_400,   rate: 0.014 },
        { min: 2_400,    max: 4_800,   rate: 0.032 },
        { min: 4_800,    max: 9_600,   rate: 0.055 },
        { min: 9_600,    max: 14_400,  rate: 0.064 },
        { min: 14_400,   max: 19_200,  rate: 0.068 },
        { min: 19_200,   max: 24_000,  rate: 0.072 },
        { min: 24_000,   max: 36_000,  rate: 0.076 },
        { min: 36_000,   max: 48_000,  rate: 0.079 },
        { min: 48_000,   max: 150_000, rate: 0.0825 },
        { min: 150_000,  max: 175_000, rate: 0.09 },
        { min: 175_000,  max: 200_000, rate: 0.10 },
        { min: 200_000,  max: null,    rate: 0.11 },
      ],
      married: [
        { min: 0,        max: 4_800,   rate: 0.014 },
        { min: 4_800,    max: 9_600,   rate: 0.032 },
        { min: 9_600,    max: 19_200,  rate: 0.055 },
        { min: 19_200,   max: 28_800,  rate: 0.064 },
        { min: 28_800,   max: 38_400,  rate: 0.068 },
        { min: 38_400,   max: 48_000,  rate: 0.072 },
        { min: 48_000,   max: 72_000,  rate: 0.076 },
        { min: 72_000,   max: 96_000,  rate: 0.079 },
        { min: 96_000,   max: 300_000, rate: 0.0825 },
        { min: 300_000,  max: 350_000, rate: 0.09 },
        { min: 350_000,  max: 400_000, rate: 0.10 },
        { min: 400_000,  max: null,    rate: 0.11 },
      ],
    },
    standardDeduction: { single: 2_200, married: 4_400 },
    personalExemption: { single: 1_144, married: 2_288 },
    additionalTaxes: [
      // TDI: 0.5% of weekly wages, max $6.87/week — source: Hawaii DLIR 2026
      { name: 'Hawaii TDI', shortName: 'TDI', rate: 0.005, weeklyRateCap: 6.87 },
    ],
  },
  ID: {
    name: 'Idaho', code: 'ID',
    brackets: flat(0.058),
    standardDeduction: { single: 15_000, married: 30_000 },
    personalExemption: NO_EXEMPTION,
  },
  IL: {
    name: 'Illinois', code: 'IL',
    brackets: flat(0.0495),
    standardDeduction: NO_DEDUCTION,
    personalExemption: { single: 2_425, married: 4_850 },
  },
  IN: {
    name: 'Indiana', code: 'IN',
    brackets: flat(0.0305),
    standardDeduction: NO_DEDUCTION,
    personalExemption: { single: 1_000, married: 2_000 },
  },
  IA: {
    name: 'Iowa', code: 'IA',
    brackets: flat(0.038),
    standardDeduction: { single: 15_000, married: 30_000 },
    personalExemption: NO_EXEMPTION,
  },
  KS: {
    name: 'Kansas', code: 'KS',
    brackets: {
      single: [
        { min: 0,       max: 15_000, rate: 0.031 },
        { min: 15_000,  max: 30_000, rate: 0.0525 },
        { min: 30_000,  max: null,   rate: 0.057 },
      ],
      married: [
        { min: 0,       max: 30_000, rate: 0.031 },
        { min: 30_000,  max: 60_000, rate: 0.0525 },
        { min: 60_000,  max: null,   rate: 0.057 },
      ],
    },
    standardDeduction: { single: 3_500, married: 8_000 },
    personalExemption: { single: 2_250, married: 4_500 },
  },
  KY: {
    name: 'Kentucky', code: 'KY',
    brackets: flat(0.04),
    standardDeduction: { single: 3_160, married: 3_160 },
    personalExemption: NO_EXEMPTION,
  },
  LA: {
    name: 'Louisiana', code: 'LA',
    brackets: {
      single: [
        { min: 0,       max: 12_500, rate: 0.0185 },
        { min: 12_500,  max: 50_000, rate: 0.035 },
        { min: 50_000,  max: null,   rate: 0.0425 },
      ],
      married: [
        { min: 0,       max: 25_000, rate: 0.0185 },
        { min: 25_000,  max: 100_000, rate: 0.035 },
        { min: 100_000, max: null,   rate: 0.0425 },
      ],
    },
    standardDeduction: { single: 4_500, married: 9_000 },
    personalExemption: { single: 4_500, married: 9_000 },
  },
  ME: {
    name: 'Maine', code: 'ME',
    brackets: {
      single: [
        { min: 0,       max: 26_050, rate: 0.058 },
        { min: 26_050,  max: 61_600, rate: 0.0675 },
        { min: 61_600,  max: null,   rate: 0.0715 },
      ],
      married: [
        { min: 0,       max: 52_100, rate: 0.058 },
        { min: 52_100,  max: 123_250, rate: 0.0675 },
        { min: 123_250, max: null,   rate: 0.0715 },
      ],
    },
    standardDeduction: { single: 15_000, married: 30_000 },
    personalExemption: NO_EXEMPTION,
  },
  MD: {
    name: 'Maryland', code: 'MD',
    brackets: {
      single: [
        { min: 0,       max: 1_000,   rate: 0.02 },
        { min: 1_000,   max: 2_000,   rate: 0.03 },
        { min: 2_000,   max: 3_000,   rate: 0.04 },
        { min: 3_000,   max: 100_000, rate: 0.0475 },
        { min: 100_000, max: 125_000, rate: 0.05 },
        { min: 125_000, max: 150_000, rate: 0.0525 },
        { min: 150_000, max: 250_000, rate: 0.055 },
        { min: 250_000, max: null,    rate: 0.0575 },
      ],
      married: [
        { min: 0,       max: 1_000,   rate: 0.02 },
        { min: 1_000,   max: 2_000,   rate: 0.03 },
        { min: 2_000,   max: 3_000,   rate: 0.04 },
        { min: 3_000,   max: 150_000, rate: 0.0475 },
        { min: 150_000, max: 175_000, rate: 0.05 },
        { min: 175_000, max: 225_000, rate: 0.0525 },
        { min: 225_000, max: 300_000, rate: 0.055 },
        { min: 300_000, max: null,    rate: 0.0575 },
      ],
    },
    standardDeduction: { single: 2_400, married: 4_800 },
    personalExemption: { single: 3_200, married: 6_400 },
  },
  MA: {
    name: 'Massachusetts', code: 'MA',
    brackets: flat(0.05),
    standardDeduction: NO_DEDUCTION,
    personalExemption: { single: 4_400, married: 8_800 },
    additionalTaxes: [
      // PFML: employee share ~0.46% up to SS wage base — source: MA DFML 2026
      { name: 'MA Paid Family Leave', shortName: 'PFML', rate: 0.0046, wageCap: 184_500 },
    ],
  },
  MI: {
    name: 'Michigan', code: 'MI',
    brackets: flat(0.0405),
    standardDeduction: NO_DEDUCTION,
    personalExemption: { single: 5_600, married: 11_200 },
  },
  MN: {
    name: 'Minnesota', code: 'MN',
    brackets: {
      single: [
        { min: 0,       max: 31_690,  rate: 0.0535 },
        { min: 31_690,  max: 104_090, rate: 0.068 },
        { min: 104_090, max: 193_240, rate: 0.0785 },
        { min: 193_240, max: null,    rate: 0.0985 },
      ],
      married: [
        { min: 0,       max: 46_330,  rate: 0.0535 },
        { min: 46_330,  max: 184_040, rate: 0.068 },
        { min: 184_040, max: 321_450, rate: 0.0785 },
        { min: 321_450, max: null,    rate: 0.0985 },
      ],
    },
    standardDeduction: { single: 15_000, married: 30_000 },
    personalExemption: NO_EXEMPTION,
  },
  MS: {
    name: 'Mississippi', code: 'MS',
    brackets: flat(0.047),
    standardDeduction: { single: 2_300, married: 4_600 },
    personalExemption: { single: 6_000, married: 12_000 },
  },
  MO: {
    name: 'Missouri', code: 'MO',
    brackets: {
      single: [
        { min: 0,      max: 1_207,  rate: 0 },
        { min: 1_207,  max: 2_414,  rate: 0.015 },
        { min: 2_414,  max: 3_621,  rate: 0.02 },
        { min: 3_621,  max: 4_828,  rate: 0.025 },
        { min: 4_828,  max: 6_035,  rate: 0.03 },
        { min: 6_035,  max: 7_242,  rate: 0.035 },
        { min: 7_242,  max: 8_449,  rate: 0.04 },
        { min: 8_449,  max: 9_656,  rate: 0.045 },
        { min: 9_656,  max: null,   rate: 0.048 },
      ],
      married: [
        { min: 0,      max: 1_207,  rate: 0 },
        { min: 1_207,  max: 2_414,  rate: 0.015 },
        { min: 2_414,  max: 3_621,  rate: 0.02 },
        { min: 3_621,  max: 4_828,  rate: 0.025 },
        { min: 4_828,  max: 6_035,  rate: 0.03 },
        { min: 6_035,  max: 7_242,  rate: 0.035 },
        { min: 7_242,  max: 8_449,  rate: 0.04 },
        { min: 8_449,  max: 9_656,  rate: 0.045 },
        { min: 9_656,  max: null,   rate: 0.048 },
      ],
    },
    standardDeduction: { single: 15_000, married: 30_000 },
    personalExemption: { single: 2_100, married: 4_200 },
  },
  MT: {
    name: 'Montana', code: 'MT',
    brackets: {
      single: [
        { min: 0,      max: 20_500, rate: 0.047 },
        { min: 20_500, max: null,   rate: 0.059 },
      ],
      married: [
        { min: 0,      max: 41_000, rate: 0.047 },
        { min: 41_000, max: null,   rate: 0.059 },
      ],
    },
    standardDeduction: { single: 5_540, married: 11_080 },
    personalExemption: NO_EXEMPTION,
  },
  NE: {
    name: 'Nebraska', code: 'NE',
    brackets: {
      single: [
        { min: 0,       max: 3_999,  rate: 0.0246 },
        { min: 3_999,   max: 23_999, rate: 0.0351 },
        { min: 23_999,  max: 35_999, rate: 0.0501 },
        { min: 35_999,  max: null,   rate: 0.0584 },
      ],
      married: [
        { min: 0,       max: 7_999,  rate: 0.0246 },
        { min: 7_999,   max: 47_999, rate: 0.0351 },
        { min: 47_999,  max: 71_999, rate: 0.0501 },
        { min: 71_999,  max: null,   rate: 0.0584 },
      ],
    },
    standardDeduction: { single: 7_900, married: 15_800 },
    personalExemption: { single: 157, married: 314 },
  },
  NV: {
    name: 'Nevada', code: 'NV',
    brackets: NO_TAX,
    standardDeduction: NO_DEDUCTION,
    personalExemption: NO_EXEMPTION,
  },
  NH: {
    name: 'New Hampshire', code: 'NH',
    brackets: NO_TAX,
    standardDeduction: NO_DEDUCTION,
    personalExemption: NO_EXEMPTION,
  },
  NJ: {
    name: 'New Jersey', code: 'NJ',
    brackets: {
      single: [
        { min: 0,       max: 20_000,  rate: 0.014 },
        { min: 20_000,  max: 35_000,  rate: 0.0175 },
        { min: 35_000,  max: 40_000,  rate: 0.035 },
        { min: 40_000,  max: 75_000,  rate: 0.05525 },
        { min: 75_000,  max: 500_000, rate: 0.0637 },
        { min: 500_000, max: 1_000_000, rate: 0.0897 },
        { min: 1_000_000, max: null,  rate: 0.1075 },
      ],
      married: [
        { min: 0,       max: 20_000,  rate: 0.014 },
        { min: 20_000,  max: 50_000,  rate: 0.0175 },
        { min: 50_000,  max: 70_000,  rate: 0.0245 },
        { min: 70_000,  max: 80_000,  rate: 0.035 },
        { min: 80_000,  max: 150_000, rate: 0.05525 },
        { min: 150_000, max: 500_000, rate: 0.0637 },
        { min: 500_000, max: 1_000_000, rate: 0.0897 },
        { min: 1_000_000, max: null,  rate: 0.1075 },
      ],
    },
    standardDeduction: NO_DEDUCTION,
    personalExemption: { single: 1_000, married: 2_000 },
    additionalTaxes: [
      // SDI: 0.14% up to $161,400 — source: NJ Division of Taxation 2026
      { name: 'NJ SDI', shortName: 'SDI', rate: 0.0014, wageCap: 161_400 },
      // FLI: 0.09% up to $161,400 — source: NJ DOL 2026
      { name: 'NJ Family Leave', shortName: 'FLI', rate: 0.0009, wageCap: 161_400 },
      // UI: employee contribution 0.425% up to $43,300 — source: NJ DOL 2026
      { name: 'NJ Unemployment', shortName: 'UI', rate: 0.00425, wageCap: 43_300 },
    ],
  },
  NM: {
    name: 'New Mexico', code: 'NM',
    brackets: {
      single: [
        { min: 0,       max: 5_500,  rate: 0.017 },
        { min: 5_500,   max: 11_000, rate: 0.032 },
        { min: 11_000,  max: 16_000, rate: 0.047 },
        { min: 16_000,  max: 210_000, rate: 0.049 },
        { min: 210_000, max: null,   rate: 0.059 },
      ],
      married: [
        { min: 0,       max: 8_000,  rate: 0.017 },
        { min: 8_000,   max: 16_000, rate: 0.032 },
        { min: 16_000,  max: 24_000, rate: 0.047 },
        { min: 24_000,  max: 315_000, rate: 0.049 },
        { min: 315_000, max: null,   rate: 0.059 },
      ],
    },
    standardDeduction: { single: 15_000, married: 30_000 },
    personalExemption: NO_EXEMPTION,
  },
  NY: {
    name: 'New York', code: 'NY',
    brackets: {
      single: [
        { min: 0,         max: 17_150,   rate: 0.04 },
        { min: 17_150,    max: 23_600,   rate: 0.045 },
        { min: 23_600,    max: 27_900,   rate: 0.0525 },
        { min: 27_900,    max: 161_550,  rate: 0.055 },
        { min: 161_550,   max: 323_200,  rate: 0.06 },
        { min: 323_200,   max: 2_155_350, rate: 0.0685 },
        { min: 2_155_350, max: null,     rate: 0.0965 },
      ],
      married: [
        { min: 0,         max: 27_900,   rate: 0.04 },
        { min: 27_900,    max: 43_000,   rate: 0.045 },
        { min: 43_000,    max: 161_550,  rate: 0.0525 },
        { min: 161_550,   max: 323_200,  rate: 0.059 },
        { min: 323_200,   max: 2_155_350, rate: 0.0685 },
        { min: 2_155_350, max: null,     rate: 0.0965 },
      ],
    },
    standardDeduction: { single: 8_000, married: 16_050 },
    personalExemption: NO_EXEMPTION,
    additionalTaxes: [
      // PFML: 0.373% up to $89,343 — source: NY WCB 2026
      { name: 'NY Paid Family Leave', shortName: 'PFL', rate: 0.00373, wageCap: 89_343 },
      // SDI: $0.60/week flat (very small) — source: NY WCB 2026
      { name: 'NY SDI', shortName: 'SDI', weeklyFlatAmount: 0.60 },
    ],
  },
  NC: {
    name: 'North Carolina', code: 'NC',
    brackets: flat(0.045),
    standardDeduction: { single: 12_750, married: 25_500 },
    personalExemption: NO_EXEMPTION,
  },
  ND: {
    name: 'North Dakota', code: 'ND',
    brackets: {
      single: [
        { min: 0,       max: 44_725,  rate: 0.0195 },
        { min: 44_725,  max: 225_975, rate: 0.025 },
        { min: 225_975, max: null,    rate: 0.029 },
      ],
      married: [
        { min: 0,       max: 74_750,  rate: 0.0195 },
        { min: 74_750,  max: 275_925, rate: 0.025 },
        { min: 275_925, max: null,    rate: 0.029 },
      ],
    },
    standardDeduction: { single: 15_000, married: 30_000 },
    personalExemption: NO_EXEMPTION,
  },
  OH: {
    name: 'Ohio', code: 'OH',
    brackets: {
      single: [
        { min: 0,       max: 26_050, rate: 0 },
        { min: 26_050,  max: 100_000, rate: 0.02765 },
        { min: 100_000, max: 115_300, rate: 0.03226 },
        { min: 115_300, max: null,   rate: 0.03688 },
      ],
      married: [
        { min: 0,       max: 26_050, rate: 0 },
        { min: 26_050,  max: 100_000, rate: 0.02765 },
        { min: 100_000, max: 115_300, rate: 0.03226 },
        { min: 115_300, max: null,   rate: 0.03688 },
      ],
    },
    standardDeduction: NO_DEDUCTION,
    personalExemption: { single: 2_400, married: 4_800 },
  },
  OK: {
    name: 'Oklahoma', code: 'OK',
    brackets: {
      single: [
        { min: 0,      max: 1_000,  rate: 0.0025 },
        { min: 1_000,  max: 2_500,  rate: 0.0075 },
        { min: 2_500,  max: 3_750,  rate: 0.0175 },
        { min: 3_750,  max: 4_900,  rate: 0.0275 },
        { min: 4_900,  max: 7_200,  rate: 0.0375 },
        { min: 7_200,  max: null,   rate: 0.0475 },
      ],
      married: [
        { min: 0,      max: 2_000,  rate: 0.0025 },
        { min: 2_000,  max: 5_000,  rate: 0.0075 },
        { min: 5_000,  max: 7_500,  rate: 0.0175 },
        { min: 7_500,  max: 9_800,  rate: 0.0275 },
        { min: 9_800,  max: 12_200, rate: 0.0375 },
        { min: 12_200, max: null,   rate: 0.0475 },
      ],
    },
    standardDeduction: { single: 6_350, married: 12_700 },
    personalExemption: { single: 1_000, married: 2_000 },
  },
  OR: {
    name: 'Oregon', code: 'OR',
    brackets: {
      single: [
        { min: 0,       max: 10_000,  rate: 0.0475 },
        { min: 10_000,  max: 125_000, rate: 0.0675 },
        { min: 125_000, max: 250_000, rate: 0.0875 },
        { min: 250_000, max: null,    rate: 0.099 },
      ],
      married: [
        { min: 0,       max: 18_400,  rate: 0.0475 },
        { min: 18_400,  max: 250_000, rate: 0.0675 },
        { min: 250_000, max: 400_000, rate: 0.0875 },
        { min: 400_000, max: null,    rate: 0.099 },
      ],
    },
    standardDeduction: { single: 2_420, married: 4_840 },
    personalExemption: { single: 236, married: 472 },
    additionalTaxes: [
      // Paid Leave Oregon: employee pays 60% of 1% = 0.6% up to SS cap — source: OED 2026
      { name: 'Oregon Paid Leave', shortName: 'PFML', rate: 0.006, wageCap: 184_500 },
    ],
  },
  PA: {
    name: 'Pennsylvania', code: 'PA',
    brackets: flat(0.0307),
    standardDeduction: NO_DEDUCTION,
    personalExemption: NO_EXEMPTION,
  },
  RI: {
    name: 'Rhode Island', code: 'RI',
    brackets: {
      single: [
        { min: 0,       max: 77_450,  rate: 0.0375 },
        { min: 77_450,  max: 176_050, rate: 0.0475 },
        { min: 176_050, max: null,    rate: 0.0599 },
      ],
      married: [
        { min: 0,       max: 154_900, rate: 0.0375 },
        { min: 154_900, max: 352_050, rate: 0.0475 },
        { min: 352_050, max: null,    rate: 0.0599 },
      ],
    },
    standardDeduction: { single: 9_750, married: 19_500 },
    personalExemption: { single: 4_900, married: 9_800 },
    additionalTaxes: [
      // TDI: 1.1% up to $87,000 — source: RI DLT 2026
      { name: 'Rhode Island TDI', shortName: 'TDI', rate: 0.011, wageCap: 87_000 },
    ],
  },
  SC: {
    name: 'South Carolina', code: 'SC',
    brackets: {
      single: [
        { min: 0,      max: 3_460,  rate: 0 },
        { min: 3_460,  max: 17_330, rate: 0.03 },
        { min: 17_330, max: null,   rate: 0.064 },
      ],
      married: [
        { min: 0,      max: 3_460,  rate: 0 },
        { min: 3_460,  max: 17_330, rate: 0.03 },
        { min: 17_330, max: null,   rate: 0.064 },
      ],
    },
    standardDeduction: { single: 15_000, married: 30_000 },
    personalExemption: NO_EXEMPTION,
  },
  SD: {
    name: 'South Dakota', code: 'SD',
    brackets: NO_TAX,
    standardDeduction: NO_DEDUCTION,
    personalExemption: NO_EXEMPTION,
  },
  TN: {
    name: 'Tennessee', code: 'TN',
    brackets: NO_TAX,
    standardDeduction: NO_DEDUCTION,
    personalExemption: NO_EXEMPTION,
  },
  TX: {
    name: 'Texas', code: 'TX',
    brackets: NO_TAX,
    standardDeduction: NO_DEDUCTION,
    personalExemption: NO_EXEMPTION,
  },
  UT: {
    name: 'Utah', code: 'UT',
    brackets: flat(0.0465),
    standardDeduction: NO_DEDUCTION,
    personalExemption: NO_EXEMPTION,
  },
  VT: {
    name: 'Vermont', code: 'VT',
    brackets: {
      single: [
        { min: 0,       max: 45_400,  rate: 0.0335 },
        { min: 45_400,  max: 110_050, rate: 0.066 },
        { min: 110_050, max: 229_550, rate: 0.076 },
        { min: 229_550, max: null,    rate: 0.0875 },
      ],
      married: [
        { min: 0,       max: 75_850,  rate: 0.0335 },
        { min: 75_850,  max: 183_400, rate: 0.066 },
        { min: 183_400, max: 279_450, rate: 0.076 },
        { min: 279_450, max: null,    rate: 0.0875 },
      ],
    },
    standardDeduction: { single: 15_000, married: 30_000 },
    personalExemption: { single: 4_850, married: 9_700 },
  },
  VA: {
    name: 'Virginia', code: 'VA',
    brackets: {
      single: [
        { min: 0,      max: 3_000,  rate: 0.02 },
        { min: 3_000,  max: 5_000,  rate: 0.03 },
        { min: 5_000,  max: 17_000, rate: 0.05 },
        { min: 17_000, max: null,   rate: 0.0575 },
      ],
      married: [
        { min: 0,      max: 3_000,  rate: 0.02 },
        { min: 3_000,  max: 5_000,  rate: 0.03 },
        { min: 5_000,  max: 17_000, rate: 0.05 },
        { min: 17_000, max: null,   rate: 0.0575 },
      ],
    },
    standardDeduction: { single: 8_500, married: 17_000 },
    personalExemption: { single: 930, married: 1_860 },
  },
  WA: {
    name: 'Washington', code: 'WA',
    brackets: NO_TAX,
    standardDeduction: NO_DEDUCTION,
    personalExemption: NO_EXEMPTION,
    additionalTaxes: [
      // PFML: 0.46% up to SS wage base — source: WA ESD 2026
      { name: 'WA PFML', shortName: 'PFML', rate: 0.0046, wageCap: 184_500 },
      // WA Cares Fund (long-term care): 0.58%, no wage cap — source: WA DCYF 2026
      { name: 'WA Cares Fund', shortName: 'WA Cares', rate: 0.0058 },
    ],
  },
  WV: {
    name: 'West Virginia', code: 'WV',
    brackets: {
      single: [
        { min: 0,       max: 10_000,  rate: 0.0236 },
        { min: 10_000,  max: 25_000,  rate: 0.0315 },
        { min: 25_000,  max: 40_000,  rate: 0.0354 },
        { min: 40_000,  max: 60_000,  rate: 0.0472 },
        { min: 60_000,  max: null,    rate: 0.0512 },
      ],
      married: [
        { min: 0,       max: 10_000,  rate: 0.0236 },
        { min: 10_000,  max: 25_000,  rate: 0.0315 },
        { min: 25_000,  max: 40_000,  rate: 0.0354 },
        { min: 40_000,  max: 60_000,  rate: 0.0472 },
        { min: 60_000,  max: null,    rate: 0.0512 },
      ],
    },
    standardDeduction: { single: 2_500, married: 5_000 },
    personalExemption: { single: 2_000, married: 4_000 },
  },
  WI: {
    name: 'Wisconsin', code: 'WI',
    brackets: {
      single: [
        { min: 0,       max: 14_320,  rate: 0.035 },
        { min: 14_320,  max: 28_640,  rate: 0.044 },
        { min: 28_640,  max: 315_310, rate: 0.053 },
        { min: 315_310, max: null,    rate: 0.0765 },
      ],
      married: [
        { min: 0,       max: 19_090,  rate: 0.035 },
        { min: 19_090,  max: 38_190,  rate: 0.044 },
        { min: 38_190,  max: 420_420, rate: 0.053 },
        { min: 420_420, max: null,    rate: 0.0765 },
      ],
    },
    standardDeduction: { single: 13_130, married: 24_270 },
    personalExemption: NO_EXEMPTION,
  },
  WY: {
    name: 'Wyoming', code: 'WY',
    brackets: NO_TAX,
    standardDeduction: NO_DEDUCTION,
    personalExemption: NO_EXEMPTION,
  },
}

export const STATE_CODES = Object.keys(STATE_TAX_CONFIGS).sort()

export const PAY_FREQUENCIES = {
  weekly:      { label: 'Weekly',      periodsPerYear: 52 },
  biweekly:    { label: 'Bi-Weekly',   periodsPerYear: 26 },
  semimonthly: { label: 'Semi-Monthly', periodsPerYear: 24 },
  monthly:     { label: 'Monthly',     periodsPerYear: 12 },
} as const

export type PayFrequency = keyof typeof PAY_FREQUENCIES
export type FilingStatus = 'single' | 'married'
