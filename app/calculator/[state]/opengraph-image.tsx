import { ImageResponse } from 'next/og'
import { stateBySlug } from '@/lib/states'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image({ params }: { params: { state: string } }) {
  const st = stateBySlug(params.state)
  const stateName = st?.name ?? 'State'

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
          <div style={{ fontSize: 76, fontWeight: 800, color: '#ffffff', lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 24 }}>
            {stateName}
            <br />Paycheck Calculator
          </div>
          <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>
            Take-home pay after federal &amp; {stateName} state taxes · 2026 rates
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
            Free · PDF Pay Stub $4.99
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
