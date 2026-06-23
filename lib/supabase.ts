import { createClient } from '@supabase/supabase-js'

export interface StubRecord {
  id?: string
  session_id: string
  employer_name: string
  employee_name: string
  pay_period_start: string
  pay_period_end: string
  pay_frequency: string
  filing_status: string
  state: string
  gross_pay: number
  net_pay: number
  federal_tax: number
  state_tax: number
  social_security: number
  medicare: number
  created_at?: string
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function insertStubRecord(record: Omit<StubRecord, 'id' | 'created_at'>) {
  const client = getAdminClient()
  if (!client) return // Supabase not configured — skip silently
  const { error } = await client.from('stubs').insert(record)
  if (error) console.error('Supabase insert error:', error)
}

// Browser client (optional — for future read-only queries)
export function getBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}
