-- Leads captured from gated report / whitepaper landing pages.
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).

create table if not exists public.leads (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  email          text not null,
  company        text,                         -- the visitor's institution
  report         text not null default 'after-the-offer',
  consent        boolean not null default false,
  source         text,                         -- e.g. 'landing:after-the-offer'
  hubspot_synced boolean not null default false,
  created_at     timestamptz not null default now()
);

create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_report_idx on public.leads (report);

-- Lock the table down: only the service-role client (used by our server action,
-- which bypasses RLS) can read or write. No anon/authenticated access.
alter table public.leads enable row level security;
