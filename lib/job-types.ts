export interface JobType {
  slug: string
  label: string
  title: string      // display label in copy
  defaultGross: number  // per paycheck bi-weekly default
  description: string   // SEO meta description snippet
}

export const JOB_TYPES: JobType[] = [
  {
    slug: 'nurse',
    label: 'Nurse',
    title: 'Nurse',
    defaultGross: 2_884,
    description: 'Calculate your nursing paycheck after federal and state taxes, FICA, and deductions.',
  },
  {
    slug: 'teacher',
    label: 'Teacher',
    title: 'Teacher',
    defaultGross: 2_307,
    description: 'See your teacher take-home pay after all taxes and pension deductions.',
  },
  {
    slug: 'contractor',
    label: 'Contractor',
    title: 'Contractor',
    defaultGross: 3_846,
    description: 'Estimate your contractor paycheck or self-employment net pay after taxes.',
  },
  {
    slug: 'freelancer',
    label: 'Freelancer',
    title: 'Freelancer',
    defaultGross: 2_692,
    description: 'Estimate freelance take-home pay after self-employment and income taxes.',
  },
  {
    slug: 'truck-driver',
    label: 'Truck Driver',
    title: 'Truck Driver',
    defaultGross: 1_923,
    description: 'Calculate your truck driver paycheck and net pay after federal and state taxes.',
  },
  {
    slug: 'software-engineer',
    label: 'Software Engineer',
    title: 'Software Engineer',
    defaultGross: 5_769,
    description: 'See your software engineer take-home pay after taxes and 401k contributions.',
  },
  {
    slug: 'server',
    label: 'Server',
    title: 'Server / Restaurant Worker',
    defaultGross: 1_154,
    description: 'Calculate your server or restaurant worker net pay after tips and taxes.',
  },
  {
    slug: 'retail',
    label: 'Retail Worker',
    title: 'Retail Worker',
    defaultGross: 1_038,
    description: 'See your retail paycheck net pay after all deductions and taxes.',
  },
  {
    slug: 'firefighter',
    label: 'Firefighter',
    title: 'Firefighter',
    defaultGross: 2_115,
    description: 'Calculate your firefighter take-home pay after taxes and pension deductions.',
  },
  {
    slug: 'police-officer',
    label: 'Police Officer',
    title: 'Police Officer',
    defaultGross: 2_423,
    description: 'Estimate your police officer paycheck net pay after all taxes and deductions.',
  },
]

export function jobBySlug(slug: string): JobType | undefined {
  return JOB_TYPES.find((j) => j.slug === slug)
}
