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
