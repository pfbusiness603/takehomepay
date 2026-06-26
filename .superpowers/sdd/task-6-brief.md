## Task 6: State Page — State Switcher + Compare CTA

**Goal:** State pages (e.g. `/calculator/california`) currently have no quick way to switch to another state or compare states. Add a state switcher dropdown below the H1, a compare-state CTA after the calculator, and fix the hardcoded breadcrumb link.

**Files:**
- Create: `components/StateSwitcher.tsx`
- Create: `components/CompareSelect.tsx`
- Modify: `app/calculator/[state]/page.tsx`

---

### Step 1 — Create `components/StateSwitcher.tsx`

This is a client component. Create the file with this exact content:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { STATES } from '@/lib/states'

interface Props {
  currentSlug: string
}

export default function StateSwitcher({ currentSlug }: Props) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-3 mt-3">
      <span className="text-sm text-gray-500 shrink-0">Switch state:</span>
      <select
        value={currentSlug}
        onChange={(e) => router.push(`/calculator/${e.target.value}`)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        {STATES.map((s) => (
          <option key={s.code} value={s.slug}>{s.name}</option>
        ))}
      </select>
    </div>
  )
}
```

### Step 2 — Create `components/CompareSelect.tsx`

The state page is a Server Component, so the compare select must be a separate client component:

```tsx
'use client'

import { STATES } from '@/lib/states'
import { useRouter } from 'next/navigation'

interface Props {
  currentSlug: string
}

export default function CompareSelect({ currentSlug }: Props) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue=""
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        onChange={(e) => {
          if (e.target.value) router.push(`/compare/${currentSlug}-vs-${e.target.value}`)
        }}
      >
        <option value="" disabled>Select state</option>
        {STATES.filter((s) => s.slug !== currentSlug).map((s) => (
          <option key={s.code} value={s.slug}>{s.name}</option>
        ))}
      </select>
      <span className="text-sm text-gray-400">Compare →</span>
    </div>
  )
}
```

### Step 3 — Modify `app/calculator/[state]/page.tsx`

**3a. Add imports** — at the top of the file (after existing imports):
```tsx
import StateSwitcher from '@/components/StateSwitcher'
import CompareSelect from '@/components/CompareSelect'
```

**3b. Add StateSwitcher after the H1 subtitle paragraph** — the current code (lines 273–283) is:
```tsx
<div className="mb-8 max-w-2xl">
  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
    {st.name} Paycheck Calculator
  </h1>
  <p className="mt-3 text-gray-500">
    Calculate your {st.name} take-home pay after all federal and state taxes.{' '}
    {hasStateTax
      ? `${st.name} has a state income tax — see how much comes out of each paycheck.`
      : `${st.name} has no state income tax, so you keep more of every paycheck.`}
  </p>
</div>
```

Change to:
```tsx
<div className="mb-8 max-w-2xl">
  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
    {st.name} Paycheck Calculator
  </h1>
  <p className="mt-3 text-gray-500">
    Calculate your {st.name} take-home pay after all federal and state taxes.{' '}
    {hasStateTax
      ? `${st.name} has a state income tax — see how much comes out of each paycheck.`
      : `${st.name} has no state income tax, so you keep more of every paycheck.`}
  </p>
  <StateSwitcher currentSlug={params.state} />
</div>
```

**3c. Add Compare CTA after the calculator grid** — the calculator grid (lines 285–314) ends with `</div>` closing the `<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">`. After that closing `</div>`, add:

```tsx
{/* Compare with another state */}
<div className="mt-6 max-w-2xl">
  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
    <p className="text-sm text-gray-600 flex-1">
      Wondering how {st.name} compares to another state?
    </p>
    <CompareSelect currentSlug={params.state} />
  </div>
</div>
```

**3d. Fix the breadcrumb** — on approximately line 268, the breadcrumb has a hardcoded link:
```tsx
<Link href="/calculator/california" className="hover:text-emerald-600 transition-colors">Calculator</Link>
```
Change to:
```tsx
<Link href="/states" className="hover:text-emerald-600 transition-colors">By State</Link>
```

### Step 4 — Build check

Run `npm run build` from `C:\Users\flana\takehomepay`.
Expected: success, same 1574 pages.

### Step 5 — Commit

```
git add components/StateSwitcher.tsx components/CompareSelect.tsx "app/calculator/[state]/page.tsx"
git commit -m "feat: add state switcher, compare CTA, and breadcrumb fix to state pages"
```

### Report Contract

Write your full report to: `.superpowers\sdd\task-6-report.md`

Include:
- Files created/modified and what changed
- Build result
- Commit hash
- Any concerns (especially if TypeScript complained about client components in server components)
