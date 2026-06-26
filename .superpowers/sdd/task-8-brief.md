## Task 8: Homepage UX — State Selector Prominence

**Goal:** The homepage Calculator defaults to Texas with no visual cue that users should select their own state. Add a one-line prompt above the calculator pointing users to select their state for accurate results.

**Files:**
- Modify: `app/page.tsx` only

**No new components, no imports needed.**

### The change

In `app/page.tsx`, find the "Main calculator" section (around line 77-82):

```tsx
{/* Main calculator */}
<div className="lg:col-span-2" id="generate-stub">
  <Suspense fallback={<div className="bg-white rounded-2xl border border-gray-100 p-6 h-96 animate-pulse" />}>
    <Calculator />
  </Suspense>
</div>
```

Add a `<p>` tag between the opening `<div>` and `<Suspense>`:

```tsx
{/* Main calculator */}
<div className="lg:col-span-2" id="generate-stub">
  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
    ↓ Select your state for accurate results
  </p>
  <Suspense fallback={<div className="bg-white rounded-2xl border border-gray-100 p-6 h-96 animate-pulse" />}>
    <Calculator />
  </Suspense>
</div>
```

That is the ONLY change needed.

### Build

Run `npm run build` from `C:\Users\flana\takehomepay`.
Expected: success, same page count.

### Commit

```
git add app/page.tsx
git commit -m "feat: add state selection prompt above homepage calculator"
```

### Report Contract

Write your full report to: `.superpowers\sdd\task-8-report.md`

Include:
- Exact line where text was inserted
- Build result
- Commit hash
