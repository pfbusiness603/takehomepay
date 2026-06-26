## Task 4: Add Pay Stub CTA to 1099 vs W-2 Page

**Goal:** The 1099 vs W-2 page has no monetization CTA. Add a "Generate your contractor pay stub" section that links users to the PDF pay stub product. Users on this page are self-employed/contractor-aware and are high-intent targets.

**Files:**
- Modify: `app/calculator/1099-vs-w2/page.tsx`

**No new components** — use inline JSX and `Link` (already imported).

### Where to insert

After the S-Corp callout section (the `<section className="mt-8 max-w-3xl">` block ending around line 125) and BEFORE the FAQ section (the `<section className="mt-12 max-w-3xl">` containing "Frequently Asked Questions").

### What to insert

Insert this JSX block between those two sections:

```tsx
{/* Pay stub CTA */}
<section className="mt-8 max-w-3xl">
  <div className="bg-emerald-600 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
    <div>
      <h3 className="text-white font-bold text-lg">Need an official contractor pay stub?</h3>
      <p className="text-emerald-100 text-sm mt-1">Generate a professional PDF pay stub for $5.99 — accepted by landlords, lenders, and banks.</p>
    </div>
    <Link
      href="/#generate-stub"
      className="shrink-0 bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
    >
      Generate Pay Stub — $5.99
    </Link>
  </div>
</section>
```

### Step-by-step

1. Read `app/calculator/1099-vs-w2/page.tsx` to confirm current state
2. Find the S-Corp callout section end (look for the closing `</section>` after the indigo box)
3. Find the FAQ section start (`{/* FAQ */}`)
4. Insert the pay stub CTA block between them
5. Confirm `Link` is already imported (it is — line 6)
6. Run `npm run build` — expect success
7. Commit: `git commit -m "feat: add contractor pay stub CTA to 1099 vs W-2 page"`

### Report Contract

Write your full report to: `.superpowers\sdd\task-4-report.md`

Include:
- Confirmation of where block was inserted
- Build result (pass/fail)
- Commit hash
- Any concerns
