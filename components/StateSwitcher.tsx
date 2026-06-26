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
