import { Suspense } from 'react'
import SuccessContent from './SuccessContent'
import Header from '@/components/Header'

export const metadata = {
  title: 'Download Your Pay Stub | TakeHomePay',
  robots: { index: false },
}

export default function SuccessPage() {
  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <Suspense fallback={<p className="text-gray-500">Loading…</p>}>
          <SuccessContent />
        </Suspense>
      </main>
    </>
  )
}
