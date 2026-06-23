-- Run this in your Supabase SQL editor to create the stubs table

create table if not exists stubs (
  id               uuid primary key default gen_random_uuid(),
  session_id       text unique not null,
  employer_name    text,
  employee_name    text,
  pay_period_start date,
  pay_period_end   date,
  pay_frequency    text,
  filing_status    text,
  state            text,
  gross_pay        numeric(10,2),
  net_pay          numeric(10,2),
  federal_tax      numeric(10,2),
  state_tax        numeric(10,2),
  social_security  numeric(10,2),
  medicare         numeric(10,2),
  created_at       timestamptz default now()
);

-- Enable RLS
alter table stubs enable row level security;

-- Only allow service role to read/write (no public access)
create policy "service role only" on stubs
  using (auth.role() = 'service_role');

-- Index for looking up by session
create index if not exists stubs_session_id_idx on stubs (session_id);
