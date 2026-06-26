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
