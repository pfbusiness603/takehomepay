## Task 7: Sticky Mobile Pay Stub CTA

**Goal:** On mobile, the pay stub CTA is buried inside the calculator results card. Users who scroll past it have no persistent prompt. Add a sticky bottom bar that appears after the user scrolls 400px, visible only on mobile (sm:hidden).

**Files:**
- Create: `components/StickyMobileCta.tsx`
- Modify: `app/layout.tsx`

---

### Step 1 — Create `components/StickyMobileCta.tsx`

Create with this exact content:

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
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden px-4 pb-4 pt-2 bg-white/90 backdrop-blur-sm border-t border-gray-100 shadow-lg">
      <a
        href="/#generate-stub"
        className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
        onClick={() => setVisible(false)}
      >
        Generate Pay Stub — $5.99
      </a>
    </div>
  )
}
```

### Step 2 — Add StickyMobileCta to `app/layout.tsx`

Current layout.tsx body content (lines 39–43):
```tsx
<body className="bg-gray-50 text-gray-900 antialiased min-h-screen">
  <GoogleAnalytics />
  {children}
</body>
```

Change to:
```tsx
<body className="bg-gray-50 text-gray-900 antialiased min-h-screen">
  <GoogleAnalytics />
  {children}
  <StickyMobileCta />
</body>
```

Also add the import at the top of layout.tsx (after existing imports):
```tsx
import StickyMobileCta from '@/components/StickyMobileCta'
```

### Step 3 — Build

Run `npm run build` from `C:\Users\flana\takehomepay`.
Expected: success, same page count.

### Step 4 — Commit

```
git add components/StickyMobileCta.tsx app/layout.tsx
git commit -m "feat: sticky mobile pay stub CTA on scroll"
```

### Report Contract

Write your full report to: `.superpowers\sdd\task-7-report.md`

Include:
- Files created/modified
- Build result
- Commit hash
- Any concerns
