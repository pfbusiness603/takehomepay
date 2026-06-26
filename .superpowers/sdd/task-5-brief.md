## Task 5: Add W-2/1099 Toggle to PayStubForm

**Goal:** The PayStubForm currently generates a pay stub without labeling it as W-2 or 1099. Add a two-option toggle so the user can confirm the income type before generating. Default to `inputs.employmentType` (already available). Pass the selected type in `stubData` to the API.

**Files:**
- Modify: `components/PayStubForm.tsx` only

**Key facts about the existing file:**
- It's a 'use client' component (line 1)
- Imports `useState` from react, `CalculatorResults` and `CalculatorInputs` from calculator, `PAY_FREQUENCIES` from tax-config
- `EmploymentType` = `'w2' | '1099'` (already on `inputs.employmentType`)
- The `inputs` prop already contains `employmentType`
- `stubData` sent to the API (line 39–46) does NOT currently include `employmentType`

### Step 1 — Add employmentType to local state

After the existing `useState` calls (line 20–21), add:

```tsx
const [employmentType, setEmploymentType] = useState<'w2' | '1099'>(inputs.employmentType)
```

(Note: `inputs.employmentType` is of type `EmploymentType = 'w2' | '1099'` — it's already typed correctly.)

### Step 2 — Add toggle UI

Insert the toggle AFTER the "Pay Stub Details" header section (after the `</div>` closing the header, before the scrollable form area `<div className="overflow-y-auto flex-1 px-6 space-y-3">`).

Insert this block between the header div and the scrollable div:

```tsx
{/* Employment type toggle */}
<div className="px-6 pb-3 shrink-0">
  <div className="flex rounded-xl overflow-hidden border border-gray-200 text-sm font-medium">
    <button
      type="button"
      onClick={() => setEmploymentType('w2')}
      className={`flex-1 py-2 transition-colors ${employmentType === 'w2' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
    >
      W-2 Employee
    </button>
    <button
      type="button"
      onClick={() => setEmploymentType('1099')}
      className={`flex-1 py-2 transition-colors ${employmentType === '1099' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
    >
      1099 Contractor
    </button>
  </div>
</div>
```

### Step 3 — Include employmentType in stubData

In `handleCheckout`, the `stubData` object (lines 40–45) currently sends:
```tsx
stubData: {
  ...form,
  payFrequency: inputs.payFrequency,
  filingStatus: inputs.filingStatus,
  state: inputs.state,
  results,
},
```

Add `employmentType` to it:
```tsx
stubData: {
  ...form,
  payFrequency: inputs.payFrequency,
  filingStatus: inputs.filingStatus,
  state: inputs.state,
  employmentType,
  results,
},
```

### Step 4 — No import changes needed

`EmploymentType` is not needed as an explicit import for `useState<'w2' | '1099'>` — the inline type is sufficient. Do NOT add a new import for `EmploymentType` unless TypeScript explicitly errors.

### Step 5 — Build

Run `npm run build` from `C:\Users\flana\takehomepay`.
Expected: success, no TypeScript errors.

### Step 6 — Commit

```
git commit -m "feat: add W-2/1099 toggle to PayStubForm"
```

### Report Contract

Write your full report to: `.superpowers\sdd\task-5-report.md`

Include:
- Exact changes made (which lines)
- Build result (pass/fail)
- Commit hash
- Any concerns
