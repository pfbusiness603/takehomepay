## Task 1: Fix Social Security Wage Base (CRITICAL — calculation accuracy)

**Files:**
- Modify: `lib/tax-config.ts` (line 70: `socialSecurityWageCap`, plus 5 state PFML wageCap values)
- Modify: `app/page.tsx` (lines 23–24: FAQ text referencing $176,100)
- Modify: `app/calculator/[state]/page.tsx` (lines 232, 239: FAQ text + line ~61 CT note)

**Why this matters:** The calc logic uses 176_100 as the SS wage cap. The correct 2026 value is 184_500. Every user earning between $176,100 and $184,500 gets a wrong take-home result. Fix logic FIRST, display text second.

### Step 1 — Search before touching anything

Run in `C:\Users\flana\takehomepay`:
```
grep -rn "176_100\|176100\|176,100" --include="*.ts" --include="*.tsx" .
```
Confirm exactly these locations appear:
- lib/tax-config.ts: socialSecurityWageCap (line ~70)
- lib/tax-config.ts: CO FAMLI wageCap (~182)
- lib/tax-config.ts: CT PFML wageCap (~211)
- lib/tax-config.ts: MA PFML wageCap (~405)
- lib/tax-config.ts: OR PFML wageCap (~684)
- lib/tax-config.ts: WA PFML wageCap (~800)
- app/page.tsx: FAQ text (~23, ~24)
- app/calculator/[state]/page.tsx: FAQ text (~232, ~239) + CT note (~61)

### Step 2 — Update lib/tax-config.ts (logic first)

Change `socialSecurityWageCap: 176_100` → `socialSecurityWageCap: 184_500`

Change all 5 state PFML wageCaps that reference the SS cap:
- CO FAMLI: `wageCap: 176_100` → `wageCap: 184_500`
- CT PFML: `wageCap: 176_100` → `wageCap: 184_500`
- MA PFML: `wageCap: 176_100` → `wageCap: 184_500`
- OR PFML: `wageCap: 176_100` → `wageCap: 184_500`
- WA PFML: `wageCap: 176_100` → `wageCap: 184_500`

### Step 3 — Update display text in app/page.tsx

Two FAQ answers reference $176,100. Change both to $184,500:
- "The Social Security wage cap is $176,100 for 2026" → "$184,500 for 2026"
- "6.2% for Social Security (on wages up to $176,100)" → "(on wages up to $184,500)"

### Step 4 — Update display text in app/calculator/[state]/page.tsx

Three places:
1. CT note in STATE_EXTRA_NOTES (~line 61): "wages up to the Social Security wage cap ($176,100)" → "($184,500)"
2. No-tax FAQ "Does [state] have a state income tax?" (~line 232): "$176,100" → "$184,500"
3. No-tax FAQ "What taxes do [state] residents still pay?" (~line 239): "$176,100" → "$184,500"

### Step 5 — Spot-check with a quick Node test

Run from `C:\Users\flana\takehomepay` (the project uses TypeScript, so use ts-node or build first — alternatively run `npx next build` and check output):

Expected results after fix:
- $180,000 salary: annualSocialSecurity = $180,000 × 6.2% = **$11,160** (below cap, full wages taxed)
- $190,000 salary: annualSocialSecurity = $184,500 × 6.2% = **$11,439** (capped at new limit)

To verify via build: run `npx next build` — if it compiles, the calc logic is syntactically correct. For a runtime check, add a temporary console.log in a server component or use the dev server.

### Step 6 — Confirm zero remaining 176100 instances

Run: `grep -rn "176_100\|176100\|176,100" --include="*.ts" --include="*.tsx" .`
Expected: zero results.

### Step 7 — Commit

```
git add lib/tax-config.ts app/page.tsx "app/calculator/[state]/page.tsx"
git commit -m "fix: update Social Security wage base to $184,500 for 2026"
```

### Report Contract

Write your full report to: `.superpowers/sdd/task-1-report.md`

Include:
- Files changed and what was changed
- Output of Step 6 grep (zero results confirmation)
- Build result (`npx next build` pass/fail)
- Commit hash
- Any concerns
