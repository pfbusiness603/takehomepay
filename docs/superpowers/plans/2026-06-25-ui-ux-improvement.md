# UI/UX & Logic Improvement Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix calculation accuracy, price, navigation, conversion CTAs, and polish before migrating to ContractorPayStub.com.

**Architecture:** Next.js 14 App Router — server components for SSG pages, client components for interactive UI. Shared Header/Footer components mean nav fixes propagate everywhere automatically. No new routes except /states.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Stripe (unit_amount in cents), pdf-lib

## Global Constraints

- Never rebuild what already works — fix and extend only
- All prices in UI: `$5.99` (was `$4.99`) — update display AND Stripe `unit_amount: 599`
- SS wage base: `184_500` (not `176_100`) everywhere — logic first, display text second
- No new dependencies — extend existing components
- Build must pass: `npx next build` with zero errors after each task
- Do not touch rebranding (Task 9) until Tasks 1–8 are verified working

---

## AUDIT FINDINGS — What Is Already Done (Do NOT re-implement)

The spec contains several items that are already implemented:

| Spec Item | Actual Status |
|---|---|
| #2 State pages have no calculator | ✅ DONE — `<Calculator defaultState={st.code} />` on line 288 of `app/calculator/[state]/page.tsx` |
| #8 Job pages missing calculators | ✅ DONE — `<Calculator defaultState={st.code} defaultGross={job.defaultGross} />` on `app/calculator/[state]/[jobtype]/page.tsx` |
| #10 No post-calc pay stub CTA | ✅ DONE — CTA is embedded in the emerald ResultsPanel hero card |
| #12 No visual breakdown | ✅ DONE — ResultsPanel shows itemized Federal/State/SS/Medicare/Additional rows |
| #5 Nav inconsistency | ✅ DONE — Header is a shared component; all 5 nav items appear on every page |
| #16 Breadcrumb schema | ✅ DONE — state and job pages already emit `breadcrumbSchema` via `JsonLd` |

---

## Task 1: Fix Social Security Wage Base (CRITICAL — calculation accuracy)

**Files:**
- Modify: `lib/tax-config.ts` (line 70: `socialSecurityWageCap`, plus 5 state PFML wageCap values)
- Modify: `app/page.tsx` (lines 23–24: FAQ text)
- Modify: `app/calculator/[state]/page.tsx` (lines 232, 239: FAQ text)

**Interfaces:**
- Produces: `FICA.socialSecurityWageCap = 184_500` consumed by `lib/calculator.ts` `calculate()` function
- Produces: State PFML wage caps updated: CO FAMLI, CT PFML, MA PFML, OR PFML, WA PFML all cap at SS wage base → `184_500`

- [ ] **Step 1: Search for all instances before changing anything**

Run: `grep -rn "176_100\|176100\|176,100" --include="*.ts" --include="*.tsx" C:\Users\flana\takehomepay`

Expected output (confirm these exact files/lines before proceeding):
```
lib/tax-config.ts:70:  socialSecurityWageCap: 176_100,
lib/tax-config.ts:182:  { name: 'CO FAMLI', shortName: 'FAMLI', rate: 0.0045, wageCap: 176_100 },
lib/tax-config.ts:211:  { name: 'CT Paid Family Leave', shortName: 'PFML', rate: 0.005, wageCap: 176_100 },
lib/tax-config.ts:405:  { name: 'MA Paid Family Leave', shortName: 'PFML', rate: 0.0046, wageCap: 176_100 },
lib/tax-config.ts:684:  { name: 'Oregon Paid Leave', shortName: 'PFML', rate: 0.006, wageCap: 176_100 },
lib/tax-config.ts:800:  { name: 'WA PFML', shortName: 'PFML', rate: 0.0046, wageCap: 176_100 },
app/page.tsx:23:  (Social Security wage cap is $176,100)
app/page.tsx:24:  (6.2% on wages up to $176,100)
app/calculator/[state]/page.tsx:232: ($176,100)
app/calculator/[state]/page.tsx:239: ($176,100)
```

- [ ] **Step 2: Update calculation logic in `lib/tax-config.ts`**

Change line 70:
```typescript
// Before
socialSecurityWageCap: 176_100,

// After
socialSecurityWageCap: 184_500,
```

Change all 5 state PFML wageCaps that referenced the SS cap:
```typescript
// CO FAMLI (lib/tax-config.ts ~line 182)
{ name: 'CO FAMLI', shortName: 'FAMLI', rate: 0.0045, wageCap: 184_500 },

// CT PFML (~line 211)
{ name: 'CT Paid Family Leave', shortName: 'PFML', rate: 0.005, wageCap: 184_500 },

// MA PFML (~line 405)
{ name: 'MA Paid Family Leave', shortName: 'PFML', rate: 0.0046, wageCap: 184_500 },

// OR PFML (~line 684)
{ name: 'Oregon Paid Leave', shortName: 'PFML', rate: 0.006, wageCap: 184_500 },

// WA PFML (~line 800)
{ name: 'WA PFML', shortName: 'PFML', rate: 0.0046, wageCap: 184_500 },
```

- [ ] **Step 3: Update FAQ display text in `app/page.tsx`**

```tsx
// FAQ answer for "Does this calculator use 2026 tax rates?"
a: 'Yes. This calculator uses the 2026 federal income tax brackets and FICA rates. The Social Security wage cap is $184,500 for 2026. State tax rates reflect the latest available rates.',

// FAQ answer for "What is FICA?"
a: 'FICA taxes fund Social Security and Medicare. Employees pay 6.2% for Social Security (on wages up to $184,500) and 1.45% for Medicare on all wages.',
```

- [ ] **Step 4: Update FAQ display text in `app/calculator/[state]/page.tsx`**

Find and replace both occurrences of `$176,100` in the state page FAQ strings (lines ~232 and ~239):
```tsx
// No-tax state FAQ: "What taxes do [state] residents still pay?"
a: `... Social Security tax (6.2% on wages up to $184,500) ...`

// No-tax state FAQ: "Does [state] have a state income tax?"
a: `No. ... Social Security (6.2% on wages up to $184,500) ...`
```

Also update `app/calculator/[state]/page.tsx` STATE_EXTRA_NOTES for CT (line ~61):
```typescript
'Connecticut Paid Family & Medical Leave: 0.5% on wages up to the Social Security wage cap ($184,500).',
```

- [ ] **Step 5: Spot-check calculation correctness**

Run a quick Node script to verify:
```bash
cd C:\Users\flana\takehomepay
node -e "
const { calculate } = require('./lib/calculator');
// $180k — below new cap, should calculate SS on full $180k
const r180 = calculate({ grossPay: 180000/26, payFrequency: 'biweekly', filingStatus: 'single', state: 'TX', allowances: 0, employmentType: 'w2', preTaxDeductions: { retirement401k: 0, healthInsurance: 0 } });
console.log('$180k SS annual:', r180.annualSocialSecurity, '| expected:', 180000 * 0.062);
// $190k — above new cap, SS should be capped at 184500 * 6.2%
const r190 = calculate({ grossPay: 190000/26, payFrequency: 'biweekly', filingStatus: 'single', state: 'TX', allowances: 0, employmentType: 'w2', preTaxDeductions: { retirement401k: 0, healthInsurance: 0 } });
console.log('$190k SS annual:', r190.annualSocialSecurity, '| expected:', 184500 * 0.062);
"
```

Expected output:
```
$180k SS annual: 11160 | expected: 11160
$190k SS annual: 11439 | expected: 11439
```

- [ ] **Step 6: Verify zero remaining 176100 instances**

Run: `grep -rn "176_100\|176100\|176,100" --include="*.ts" --include="*.tsx" C:\Users\flana\takehomepay`

Expected: zero results.

- [ ] **Step 7: Commit**

```bash
git add lib/tax-config.ts app/page.tsx "app/calculator/[state]/page.tsx"
git commit -m "fix: update Social Security wage base to $184,500 for 2026"
```

---

## Task 2: Update Price From $4.99 to $5.99 Everywhere

**Files:**
- Modify: `app/api/create-checkout-session/route.ts` (unit_amount 499 → 599)
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/about/page.tsx`
- Modify: `app/opengraph-image.tsx`
- Modify: `app/calculator/[state]/opengraph-image.tsx`
- Modify: `app/calculator/[state]/[jobtype]/opengraph-image.tsx`
- Modify: `components/Header.tsx`
- Modify: `components/MobileNav.tsx`
- Modify: `components/Footer.tsx`
- Modify: `components/ResultsPanel.tsx`
- Modify: `components/PayStubForm.tsx`

**Interfaces:**
- Produces: Stripe `unit_amount: 599` (cents) = $5.99 charged
- Produces: All UI strings show `$5.99`

- [ ] **Step 1: Update Stripe unit_amount in `app/api/create-checkout-session/route.ts`**

```typescript
// Before
unit_amount: 499, // $4.99

// After
unit_amount: 599, // $5.99
```

- [ ] **Step 2: Replace all UI price strings — use replace_all**

In each of the following files, replace every `$4.99` with `$5.99` and `4.99` with `5.99` where it appears as a price string. Also replace `499` → `599` only in the Stripe route (already done in Step 1).

Files and their specific changes:

**`app/page.tsx`:**
- FAQ answer: `$4.99 via secure Stripe checkout` → `$5.99 via secure Stripe checkout`
- meta description: `for just $4.99` → `for just $5.99`
- Sidebar card: `<p className="text-3xl font-bold mt-3">$4.99</p>` → `$5.99`

**`app/layout.tsx`:**
- description: `for $4.99` → `for $5.99`

**`app/about/page.tsx`:**
- `For $4.99, TakeHomePay generates` → `For $5.99, TakeHomePay generates`

**`app/opengraph-image.tsx`:**
- `PDF Pay Stub · $4.99` → `PDF Pay Stub · $5.99`

**`app/calculator/[state]/opengraph-image.tsx`:**
- `Free · PDF Pay Stub $4.99` → `Free · PDF Pay Stub $5.99`

**`app/calculator/[state]/[jobtype]/opengraph-image.tsx`:**
- `Free · PDF Pay Stub $4.99` → `Free · PDF Pay Stub $5.99`

**`components/Header.tsx`:**
- `PDF Pay Stub — $4.99` → `PDF Pay Stub — $5.99`

**`components/MobileNav.tsx`:**
- `PDF Pay Stub — $4.99` → `PDF Pay Stub — $5.99`

**`components/Footer.tsx`:**
- `PDF Pay Stub — $4.99` → `PDF Pay Stub — $5.99`

**`components/ResultsPanel.tsx`:**
- `Generate Pay Stub — $4.99` → `Generate Pay Stub — $5.99`

**`components/PayStubForm.tsx`:**
- `Pay $4.99 & Download PDF` → `Pay $5.99 & Download PDF`

- [ ] **Step 3: Verify no $4.99 instances remain**

Run:
```bash
grep -rn "4\.99\|unit_amount: 499" --include="*.ts" --include="*.tsx" C:\Users\flana\takehomepay
```
Expected: zero results.

- [ ] **Step 4: Build check**

```bash
cd C:\Users\flana\takehomepay && npx next build 2>&1 | Select-String "error|Error|✓" | Where-Object { $_ -notmatch "NativeCommandError" }
```

Expected: `✓ Compiled successfully`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: update price to $5.99 across all UI and Stripe config"
```

---

## Task 3: Fix "By State" Nav — Create /states Page

**Problem:** `Header.tsx` links "By State" to `/calculator/california` — hardcodes California regardless of where the user is.

**Fix:** Create `/states` page with all 50 states in a clean grid. Update Header to point there.

**Files:**
- Create: `app/states/page.tsx`
- Modify: `components/Header.tsx` (href `/calculator/california` → `/states`)
- Modify: `components/MobileNav.tsx` (existing "Popular States" section → link to /states at top)

**Interfaces:**
- Consumes: `STATES` array from `lib/states.ts` — each state has `{ name, slug, code }`
- Produces: `/states` page with `generateStaticParams` not needed (single static page)

- [ ] **Step 1: Create `app/states/page.tsx`**

```tsx
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { STATES } from '@/lib/states'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Paycheck Calculator by State 2026 — All 50 States',
  description: 'Free paycheck calculator for all 50 states. Select your state to calculate exact take-home pay after federal and state taxes.',
  alternates: { canonical: '/states' },
}

export default function StatesPage() {
  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Paycheck Calculator by State</h1>
          <p className="mt-2 text-gray-500">Select your state to calculate take-home pay with the correct 2026 state tax rates.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {STATES.map((s) => (
            <Link
              key={s.code}
              href={`/calculator/${s.slug}`}
              className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 hover:border-emerald-400 hover:text-emerald-600 shadow-sm transition-colors"
            >
              <span className="font-medium">{s.name}</span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Update `components/Header.tsx`**

```tsx
// Before
<Link href="/calculator/california" className="hover:text-emerald-600 transition-colors">By State</Link>

// After
<Link href="/states" className="hover:text-emerald-600 transition-colors">By State</Link>
```

- [ ] **Step 3: Update `components/MobileNav.tsx` — add "All States" link at top of Popular States section**

```tsx
// Replace the "Popular States" section header with:
<div>
  <div className="flex items-center justify-between mb-3">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Popular States</p>
    <Link href="/states" onClick={() => setOpen(false)} className="text-xs text-emerald-600 hover:underline">
      All 50 states →
    </Link>
  </div>
  // ... existing popular state links unchanged
```

- [ ] **Step 4: Build check and commit**

```bash
cd C:\Users\flana\takehomepay && npx next build 2>&1 | Select-String "✓|error" | Where-Object { $_ -notmatch "NativeCommandError" }
git add app/states/page.tsx components/Header.tsx components/MobileNav.tsx
git commit -m "feat: add /states page, fix By State nav link"
```

---

## Task 4: Add Pay Stub CTA to 1099 vs W-2 Page

**Problem:** `/calculator/1099-vs-w2` has no "generate a contractor pay stub" CTA after results show. This is the highest-intent page on the site.

**Files:**
- Modify: `app/calculator/1099-vs-w2/W2vs1099Calc.tsx` — add CTA after the results render
- Modify: `components/PayStubForm.tsx` — accept optional `defaultEmploymentType` prop to pre-select 1099 mode (used in Task 5)

**Interfaces:**
- Consumes: `equiv1099Gross` (number), `stateCode` (string) — already computed in `W2vs1099Calc`
- Produces: Button that opens PayStubForm modal pre-loaded with the 1099 gross and state

- [ ] **Step 1: Add CTA state + PayStubForm import to `W2vs1099Calc.tsx`**

Add at the top of the file (after existing imports):
```tsx
import { useState } from 'react'  // already imported — just confirm
import PayStubForm from '@/components/PayStubForm'
```

Add state to the component:
```tsx
const [showStub, setShowStub] = useState(false)
```

- [ ] **Step 2: Add CTA block after the "Key insight" amber box, before closing `</div>`**

```tsx
{/* 1099 Pay Stub CTA */}
<div className="bg-indigo-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center gap-4">
  <div className="flex-1">
    <p className="font-bold text-lg">You&apos;re earning as a 1099 contractor</p>
    <p className="text-sm opacity-80 mt-1">
      Generate an official pay stub for your records — proof of income for loans, rentals, and clients.
    </p>
  </div>
  <button
    onClick={() => setShowStub(true)}
    className="shrink-0 bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
  >
    Generate Contractor Pay Stub — $5.99
  </button>
</div>

{showStub && (
  <PayStubForm
    results={equiv1099}
    inputs={{
      grossPay: equiv1099.grossPay,
      payFrequency: 'biweekly',
      filingStatus: 'single',
      state: stateCode,
      allowances: 0,
      employmentType: '1099',
      preTaxDeductions: { retirement401k: 0, healthInsurance: 0 },
    }}
    onClose={() => setShowStub(false)}
  />
)}
```

- [ ] **Step 3: Build check and commit**

```bash
cd C:\Users\flana\takehomepay && npx next build 2>&1 | Select-String "✓|error" | Where-Object { $_ -notmatch "NativeCommandError" }
git add "app/calculator/1099-vs-w2/W2vs1099Calc.tsx"
git commit -m "feat: add contractor pay stub CTA to 1099 vs W-2 calculator"
```

---

## Task 5: PayStubForm W-2 / 1099 Toggle

**Problem:** The PDF pay stub generator has no option to switch between W-2 employee and 1099 contractor stub formats.

**Files:**
- Modify: `components/PayStubForm.tsx` — add worker type toggle at the top; 1099 mode changes labels and shows SE tax line

**Interfaces:**
- Consumes: `results.employmentType` from `CalculatorResults` — use this to pre-select the toggle
- Produces: Visual toggle "W-2 Employee | 1099 Contractor" that changes the stub preview labels

- [ ] **Step 1: Add workerType state and toggle UI to `PayStubForm.tsx`**

Add state after existing `useState` calls:
```tsx
const [workerType, setWorkerType] = useState<'w2' | '1099'>(
  results.employmentType === '1099' ? '1099' : 'w2'
)
```

Add toggle after the modal header `<div>` and before the scrollable form area:
```tsx
{/* Worker type toggle */}
<div className="px-6 pb-3 shrink-0">
  <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
    {([['w2', 'W-2 Employee'], ['1099', '1099 Contractor']] as ['w2'|'1099', string][]).map(([val, label]) => (
      <button
        key={val}
        type="button"
        onClick={() => setWorkerType(val)}
        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
          workerType === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
</div>
```

- [ ] **Step 2: Update the preview summary box to show type-appropriate fields**

Replace the existing static preview box:
```tsx
<div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 space-y-1">
  <div className="flex justify-between">
    <span>Gross Income</span>
    <span className="font-medium">${results.grossPay.toFixed(2)}</span>
  </div>
  {workerType === 'w2' ? (
    <>
      <div className="flex justify-between"><span>Federal Tax</span><span>−${results.federalTax.toFixed(2)}</span></div>
      <div className="flex justify-between"><span>State Tax</span><span>−${results.stateTax.toFixed(2)}</span></div>
      <div className="flex justify-between"><span>Social Security</span><span>−${results.socialSecurity.toFixed(2)}</span></div>
      <div className="flex justify-between"><span>Medicare</span><span>−${results.medicare.toFixed(2)}</span></div>
    </>
  ) : (
    <>
      <div className="flex justify-between"><span>Federal Tax</span><span>−${results.federalTax.toFixed(2)}</span></div>
      <div className="flex justify-between"><span>State Tax</span><span>−${results.stateTax.toFixed(2)}</span></div>
      <div className="flex justify-between"><span>Self-Employment Tax (15.3%)</span><span>−${results.selfEmploymentTax.toFixed(2)}</span></div>
    </>
  )}
  <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-1 mt-1">
    <span>Net Pay</span>
    <span className="text-emerald-600">${results.netPay.toFixed(2)}</span>
  </div>
</div>
```

- [ ] **Step 3: Update the submit button label to reflect worker type**

```tsx
{loading ? 'Redirecting to payment…' : `Pay $5.99 & Download ${workerType === '1099' ? '1099 Contractor' : 'W-2 Employee'} Pay Stub`}
```

- [ ] **Step 4: Build check and commit**

```bash
cd C:\Users\flana\takehomepay && npx next build 2>&1 | Select-String "✓|error" | Where-Object { $_ -notmatch "NativeCommandError" }
git add components/PayStubForm.tsx
git commit -m "feat: add W-2/1099 toggle to pay stub generator"
```

---

## Task 6: State Page — State Switcher + Compare CTA

**Problem:** State pages have no quick "Switch state" control above the calculator, and no "Compare with another state" entry point from the calculator flow.

**Files:**
- Create: `components/StateSwitcher.tsx` — client component with state select that navigates
- Modify: `app/calculator/[state]/page.tsx` — add StateSwitcher below H1, add Compare CTA below calculator

**Interfaces:**
- `StateSwitcher` props: `{ currentSlug: string }` — reads `STATES` from `lib/states`, uses `useRouter` to navigate
- Produces: `<select>` that navigates to `/calculator/[selected-slug]` on change

- [ ] **Step 1: Create `components/StateSwitcher.tsx`**

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

- [ ] **Step 2: Add StateSwitcher and Compare CTA to `app/calculator/[state]/page.tsx`**

Import at top of file:
```tsx
import StateSwitcher from '@/components/StateSwitcher'
```

Add StateSwitcher immediately after the `<p>` subtitle in the H1 section:
```tsx
<div className="mb-8 max-w-2xl">
  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
    {st.name} Paycheck Calculator
  </h1>
  <p className="mt-3 text-gray-500">...</p>
  <StateSwitcher currentSlug={params.state} />  {/* ADD THIS LINE */}
</div>
```

Add Compare CTA after the `</div>` that closes the calculator grid section (after the `lg:grid-cols-3` grid):
```tsx
{/* Compare with another state */}
<div className="mt-6 max-w-2xl">
  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
    <p className="text-sm text-gray-600 flex-1">
      Wondering how {st.name} compares to another state?
    </p>
    <div className="flex items-center gap-2">
      <select
        id="compare-select"
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) window.location.href = `/compare/${params.state}-vs-${e.target.value}`
        }}
      >
        <option value="" disabled>Select state</option>
        {STATES.filter(s => s.slug !== params.state).map((s) => (
          <option key={s.code} value={s.slug}>{s.name}</option>
        ))}
      </select>
      <span className="text-sm text-gray-400">Compare →</span>
    </div>
  </div>
</div>
```

Note: The compare select uses `window.location.href` because this is a server component. If the onChange doesn't work server-side, extract into a tiny `'use client'` component `CompareSelect.tsx` with `useRouter`.

- [ ] **Step 3: Build check and commit**

```bash
cd C:\Users\flana\takehomepay && npx next build 2>&1 | Select-String "✓|error" | Where-Object { $_ -notmatch "NativeCommandError" }
git add components/StateSwitcher.tsx "app/calculator/[state]/page.tsx"
git commit -m "feat: add state switcher and compare CTA to state pages"
```

---

## Task 7: Sticky Mobile Pay Stub CTA

**Problem:** On mobile, the pay stub CTA is only visible inside the emerald results card — users who scroll past it have no persistent prompt.

**Files:**
- Create: `components/StickyMobileCta.tsx` — client component, shows after scroll threshold
- Modify: `app/layout.tsx` — add StickyMobileCta globally OR add to individual pages

**Interfaces:**
- `StickyMobileCta` props: none — standalone component that self-manages scroll visibility
- Produces: Fixed bottom bar on mobile (`sm:hidden`) appearing after 400px scroll: "Generate Pay Stub — $5.99"

- [ ] **Step 1: Create `components/StickyMobileCta.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'

export default function StickyMobileCta() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 px-4 py-3 shadow-lg">
      <a
        href="#generate-stub"
        className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
        onClick={() => setVisible(false)}
      >
        Generate Pay Stub — $5.99
      </a>
    </div>
  )
}
```

- [ ] **Step 2: Add to `app/layout.tsx`**

Import and add before closing `</body>`:
```tsx
import StickyMobileCta from '@/components/StickyMobileCta'

// Inside the body:
<StickyMobileCta />
```

- [ ] **Step 3: Build check and commit**

```bash
cd C:\Users\flana\takehomepay && npx next build 2>&1 | Select-String "✓|error" | Where-Object { $_ -notmatch "NativeCommandError" }
git add components/StickyMobileCta.tsx app/layout.tsx
git commit -m "feat: sticky mobile pay stub CTA on scroll"
```

---

## Task 8: Homepage UX — State Selector Prominence

**Audit finding:** The homepage Calculator component IS present with a state selector. However, it defaults to Texas (`TX`) with no visual prompt for users to select their own state. Users may miss that the state matters.

**Fix:** Add a one-line helper above the calculator prompting state selection, and update the default state to show a blank/placeholder state.

**Files:**
- Modify: `app/page.tsx` — add a subtitle line above `<Calculator />`
- Modify: `components/Calculator.tsx` — change `DEFAULT_INPUTS.state` from `'TX'` to show user's intent

**Note:** We cannot detect the user's state server-side without middleware. The simplest fix is a visual prompt above the calculator.

- [ ] **Step 1: Add a state-selection prompt above Calculator in `app/page.tsx`**

```tsx
{/* Main calculator */}
<div className="lg:col-span-2" id="generate-stub">
  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
    ↓ Select your state for accurate results
  </p>
  <Suspense fallback={...}>
    <Calculator />
  </Suspense>
</div>
```

- [ ] **Step 2: Build check and commit**

```bash
cd C:\Users\flana\takehomepay && npx next build 2>&1 | Select-String "✓|error" | Where-Object { $_ -notmatch "NativeCommandError" }
git add app/page.tsx
git commit -m "ux: add state selection prompt above homepage calculator"
```

---

## Task 9: Rebranding to ContractorPayStub.com

**Prerequisite:** User must have registered `contractorpaystub.com` on Namecheap before this task runs. Do NOT implement until domain is confirmed.

**Files:**
- Modify: `app/layout.tsx` — metadataBase URL
- Modify: `app/page.tsx` — SITE_URL constant, siteName, title/description
- Modify: `app/calculator/[state]/page.tsx` — SITE_URL, siteName
- Modify: `app/calculator/[state]/[jobtype]/page.tsx` — SITE_URL, siteName  
- Modify: `app/calculator/[state]/salary/[amount]/page.tsx` — SITE_URL, siteName
- Modify: `app/compare/[slug]/page.tsx` — SITE_URL, siteName
- Modify: `app/calculator/1099-vs-w2/page.tsx` — SITE_URL, siteName
- Modify: `app/about/page.tsx` — brand name in copy
- Modify: `app/how-we-calculate/page.tsx` — brand name in copy
- Modify: `components/Header.tsx` — logo text
- Modify: `components/Footer.tsx` — brand name, copyright
- Modify: `components/MobileNav.tsx` — logo text
- No changes to URL structure — all `/calculator/[state]` paths stay identical

**Environment variable change (Vercel dashboard — not code):**
```
NEXT_PUBLIC_SITE_URL=https://contractorpaystub.com
```

**Vercel dashboard steps (done manually, not in code):**
1. Add `contractorpaystub.com` as custom domain in Vercel project settings
2. Update Namecheap DNS: A record `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com`
3. Set `takehomepaycalculator.dev` to redirect → `contractorpaystub.com` (Vercel redirect rule)

- [ ] **Step 1: Global find-replace of brand name strings in code**

Replace: `TakeHomePay` → `ContractorPayStub`
Replace: `takehomepaycalculator.dev` → `contractorpaystub.com` (in SITE_URL fallback strings only — env var handles production)
Replace: `Take-Home Pay` (in titles/headings where it refers to the brand) → `ContractorPayStub`

Do NOT change: `take-home pay` (lowercase, used as a general term), URL paths like `/calculator/`, content descriptions

- [ ] **Step 2: Build, verify, commit, push**

```bash
cd C:\Users\flana\takehomepay && npx next build 2>&1 | Select-String "✓|error" | Where-Object { $_ -notmatch "NativeCommandError" }
git add -A
git commit -m "feat: rebrand to ContractorPayStub.com"
git push origin master
```

- [ ] **Step 3: Update Vercel env var**

In Vercel dashboard → Project Settings → Environment Variables:
- Change `NEXT_PUBLIC_SITE_URL` from `https://takehomepaycalculator.dev` to `https://contractorpaystub.com`
- Trigger a new deployment

---

## Skipped Items (Already Implemented or Deferred)

| Spec Item | Reason Skipped |
|---|---|
| #1 Homepage state selector missing | Calculator with state selector IS on homepage. Added visual prompt in Task 8 instead. |
| #2 State pages have no calculator | Already implemented — `<Calculator defaultState={st.code} />` present |
| #8 Job pages missing calculators | Already implemented — `<Calculator defaultState={st.code} defaultGross={job.defaultGross} />` present |
| #10 No post-calc pay stub CTA | Already implemented in ResultsPanel emerald hero card |
| #12 No visual breakdown | Already implemented — itemized rows in ResultsPanel |
| #5 Nav inconsistency | Header is shared component — all 5 items already appear on every page |
| #16 Breadcrumb schema | Already added in previous session |
| #14 Expand 50-state grid | Homepage sidebar already has popular states; /states page (Task 3) covers full 50 |
| #15 Meta keywords | `<meta keywords>` has negligible SEO impact since ~2010 — not worth implementing |
| #11 Compare States entry point | Covered by compare select in Task 6 |

---

## Execution Order Summary

| Task | Description | Priority | Requires Vercel/Stripe change? |
|---|---|---|---|
| 1 | SS wage base 176k → 184.5k | CRITICAL | No |
| 2 | Price $4.99 → $5.99 | CRITICAL | Yes — Stripe unit_amount in code |
| 3 | /states page + By State nav fix | HIGH | No |
| 4 | 1099 vs W-2 pay stub CTA | HIGH | No |
| 5 | PayStubForm W-2/1099 toggle | HIGH | No |
| 6 | State switcher + compare CTA | MEDIUM | No |
| 7 | Sticky mobile CTA | MEDIUM | No |
| 8 | Homepage state prompt | LOW | No |
| 9 | Rebranding | LAST — after domain registered | Yes — NEXT_PUBLIC_SITE_URL env var |
