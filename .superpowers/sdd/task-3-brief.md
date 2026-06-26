## Task 3: Create /states Page + Fix "By State" Nav Link

**Goal:** The "By State" link in the nav bar currently hardcodes `/calculator/california`. Fix it to point to `/states`, and create the `/states` page that lists all 50 states linking to their respective calculators.

**Files:**
- Modify: `components/Header.tsx` (line 16)
- Modify: `components/MobileNav.tsx` (add "All States" link to Popular States section)
- Create: `app/states/page.tsx`

### Step 1 — Fix Header.tsx

File: `components/Header.tsx`
Current line 16: `<Link href="/calculator/california" className="hover:text-emerald-600 transition-colors">By State</Link>`
Change to: `<Link href="/states" className="hover:text-emerald-600 transition-colors">By State</Link>`

### Step 2 — Fix MobileNav.tsx

In `components/MobileNav.tsx`, there is currently a "Popular States" section (lines ~64–79) showing 8 popular state links. Add a "View All States →" link at the bottom of that section, pointing to `/states`:

After the closing `</ul>` of the popular states list but before the closing `</div>` of that section, add:
```tsx
<li className="pt-1">
  <Link href="/states" onClick={() => setOpen(false)} className="block text-sm text-emerald-600 hover:text-emerald-700 py-1 transition-colors font-medium">
    View All States →
  </Link>
</li>
```

Actually, append this as a list item inside the `<ul>` after the popular states map, before `</ul>`:
```tsx
<li key="all-states">
  <Link href="/states" onClick={() => setOpen(false)} className="block text-sm text-emerald-600 hover:text-emerald-700 py-1 transition-colors font-medium">
    View All States →
  </Link>
</li>
```

### Step 3 — Create app/states/page.tsx

Create a new file at `app/states/page.tsx`. This is a Server Component (no 'use client').

The page should:
1. Import `STATES` from `@/lib/states`
2. Import `Header` from `@/components/Header`
3. Import `Footer` from `@/components/Footer`
4. Import `Metadata` from `next`
5. Export `metadata` with appropriate title and description
6. Render a grid of all 50 states, each linking to `/calculator/[slug]`

Full implementation:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { STATES } from '@/lib/states'

export const metadata: Metadata = {
  title: 'Paycheck Calculator by State | TakeHomePay',
  description: 'Calculate your take-home pay for all 50 states. Select your state for a detailed paycheck breakdown including federal and state taxes.',
}

export default function StatesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Paycheck Calculator by State</h1>
            <p className="text-gray-600 text-lg">Select your state to calculate your exact take-home pay including all state and federal taxes.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {STATES.map((state) => (
              <Link
                key={state.code}
                href={`/calculator/${state.slug}`}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-sm transition-all group"
              >
                <span className="text-xs font-bold text-gray-400 group-hover:text-emerald-600 mb-1">{state.code}</span>
                <span className="text-sm font-medium text-gray-800 group-hover:text-emerald-700 text-center leading-tight">{state.name}</span>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">All calculations use 2026 federal and state tax rates.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
```

### Step 4 — Build

Run `npm run build` from `C:\Users\flana\takehomepay`.
Expected: success, 1 additional static page generated for `/states`.

### Step 5 — Commit

```
git add components/Header.tsx components/MobileNav.tsx app/states/page.tsx
git commit -m "feat: add /states directory page and fix By State nav link"
```

### Report Contract

Write your full report to: `.superpowers\sdd\task-3-report.md`

Include:
- Files changed/created and what was changed
- Build result (pass/fail, confirm /states page generated)
- Commit hash
- Any concerns
