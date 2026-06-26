'use client'

import { useRouter } from 'next/navigation'
import { STATES } from '@/lib/states'

interface Props {
  currentSlug?: string
  label?: string
}

export default function StateSwitcher({ currentSlug, label = 'Switch state:' }: Props) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-3 mt-3">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <select
        value={currentSlug ?? ''}
        onChange={(e) => { if (e.target.value) router.push(`/calculator/${e.target.value}`) }}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        {!currentSlug && <option value="" disabled>Select a state…</option>}
        {STATES.map((s) => (
          <option key={s.code} value={s.slug}>{s.name}</option>
        ))}
      </select>
    </div>
  )
}
