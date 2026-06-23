'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SuccessContent() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')

  const [email, setEmail] = useState('')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [emailError, setEmailError] = useState('')

  if (!sessionId) {
    return (
      <div className="space-y-4">
        <p className="text-gray-500">No session found.</p>
        <Link href="/" className="text-emerald-600 hover:underline">← Back to calculator</Link>
      </div>
    )
  }

  const downloadUrl = `/api/generate-pdf?session_id=${sessionId}`

  async function handleSendEmail() {
    if (!email) return
    setEmailStatus('sending')
    setEmailError('')
    try {
      const res = await fetch('/api/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setEmailError(data.error ?? 'Something went wrong')
        setEmailStatus('error')
      } else {
        setEmailStatus('sent')
      }
    } catch {
      setEmailError('Network error — please try again')
      setEmailStatus('error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Success icon */}
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
        <p className="text-gray-500 mt-2">Your professional PDF pay stub is ready to download.</p>
      </div>

      <a
        href={downloadUrl}
        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
        download
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Pay Stub PDF
      </a>

      <p className="text-xs text-gray-400">
        Link expires after 24 hours. Save your PDF immediately.
      </p>

      {/* Optional email delivery */}
      <div className="border border-gray-100 rounded-2xl p-5 space-y-3 bg-gray-50">
        <p className="text-sm font-medium text-gray-700">Send to your email (optional)</p>
        {emailStatus === 'sent' ? (
          <p className="text-sm text-emerald-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Download link sent to {email}
          </p>
        ) : (
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              onKeyDown={(e) => e.key === 'Enter' && handleSendEmail()}
            />
            <button
              onClick={handleSendEmail}
              disabled={!email || emailStatus === 'sending'}
              className="shrink-0 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              {emailStatus === 'sending' ? 'Sending…' : 'Send'}
            </button>
          </div>
        )}
        {emailStatus === 'error' && (
          <p className="text-xs text-red-500">{emailError}</p>
        )}
      </div>

      <div className="pt-4 border-t border-gray-100">
        <Link href="/" className="text-sm text-emerald-600 hover:underline">
          ← Calculate another paycheck
        </Link>
      </div>
    </div>
  )
}
