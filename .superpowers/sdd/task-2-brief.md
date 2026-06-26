## Task 2: Update Price $4.99 → $5.99 + Stripe unit_amount 499 → 599

**Goal:** Change the product price from $4.99 to $5.99 everywhere in the codebase. This affects display text (user-facing), metadata, OG images, API stripe amount, and the PDF download button label.

**Files to change** (confirmed via prior grep — verify each before editing):

### Critical (logic/billing):
- `app/api/create-checkout-session/route.ts` — `unit_amount: 499` → `unit_amount: 599`

### Display text (user-facing UI):
- `components/Header.tsx` — "PDF Pay Stub — $4.99" → "$5.99"
- `components/MobileNav.tsx` — "PDF Pay Stub — $4.99" → "$5.99" (may appear in Tools section)
- `components/PayStubForm.tsx` — button text "Pay $4.99 & Download PDF" → "Pay $5.99 & Download PDF"
- `app/page.tsx` — "$4.99" appears in 3 places (FAQ answers, CTA text)
- `app/about/page.tsx` — "$4.99" reference

### Metadata / SEO:
- `app/layout.tsx` — "$4.99" in site description metadata
- `app/opengraph-image.tsx` — "$4.99" in OG image text
- `app/calculator/[state]/opengraph-image.tsx` — "$4.99" in OG image text
- `app/calculator/[state]/[jobtype]/opengraph-image.tsx` — "$4.99" in OG image text

### Step 1 — Grep first to get exact locations

Run: `grep -rn "4\.99\|unit_amount.*499\b" --include="*.ts" --include="*.tsx" C:\Users\flana\takehomepay`

Confirm locations before editing. Note: avoid matching `4499`, `14.99`, etc. — only `$4.99` and `499` as Stripe amount.

### Step 2 — Update Stripe API route (logic first)

File: `app/api/create-checkout-session/route.ts`
Change: `unit_amount: 499` → `unit_amount: 599`
This is the actual billing amount — most critical change.

### Step 3 — Update all display text

For each file with `$4.99`, change the string:
- `"$4.99"` → `"$5.99"` (with dollar sign)
- `"Pay $4.99 & Download PDF"` → `"Pay $5.99 & Download PDF"`
- `"$4.99 PDF Pay Stub"` → `"$5.99 PDF Pay Stub"` (or similar variants)

Use exact match replacements. Do NOT use sed/regex replace across all files in one command — edit each file individually to avoid accidental changes.

### Step 4 — Update OG image files

OG images contain hardcoded text strings. Find and update `$4.99` in:
- `app/opengraph-image.tsx`
- `app/calculator/[state]/opengraph-image.tsx`
- `app/calculator/[state]/[jobtype]/opengraph-image.tsx`

### Step 5 — Verify zero remaining $4.99 instances

Run: `grep -rn "4\.99" --include="*.ts" --include="*.tsx" C:\Users\flana\takehomepay`
Expected: zero results (or only in node_modules, which should be excluded by the glob).

Also verify: `grep -rn "unit_amount.*499\b" --include="*.ts" C:\Users\flana\takehomepay` → zero results.

### Step 6 — Build

Run `npm run build` from `C:\Users\flana\takehomepay`.
Expected: success (no TypeScript errors).

### Step 7 — Commit

```
git add -A
git commit -m "feat: update price from $4.99 to $5.99"
```

### Report Contract

Write your full report to: `.superpowers\sdd\task-2-report.md`

Include:
- Files changed and exact strings replaced
- Output of Step 5 grep (zero results confirmation)  
- Build result
- Commit hash
- Any concerns (especially if any $4.99 remains that you intentionally skipped — e.g., comments)
