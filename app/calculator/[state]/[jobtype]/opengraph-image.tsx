import { ImageResponse } from 'next/og'
import { stateBySlug } from '@/lib/states'
import { jobBySlug } from '@/lib/job-types'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image({ params }: { params: { state: string; jobtype: string } }) {
  const st = stateBySlug(params.state)
  const job = jobBySlug(params.jobtype)
  const stateName = st?.name ?? 'State'
  const jobLabel = job?.label ?? 'Professional'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#059669',
          padding: '64px 72px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'auto' }}>
          <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.9)', fontWeight: 700, letterSpacing: '-0.5px' }}>
            TakeHomePay
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 52 }}>
          <div style={{
            display: 'flex',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: 10,
            padding: '8px 18px',
            fontSize: 24,
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600,
            marginBottom: 20,
            width: 'fit-content',
          }}>
            {stateName} · {jobLabel}
          </div>
          <div style={{ fontSize: 68, fontWeight: 800, color: '#ffffff', lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 24 }}>
            {jobLabel} Paycheck
            <br />Calculator
          </div>
          <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>
            {stateName} state taxes · 2026 federal brackets · Instant take-home pay
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
            takehomepaycalculator.dev
          </div>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 14,
            padding: '12px 24px',
            fontSize: 20,
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600,
          }}>
            Free · PDF Pay Stub $5.99
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
