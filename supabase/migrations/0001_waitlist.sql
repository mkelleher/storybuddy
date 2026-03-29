-- Run in Supabase SQL Editor or via CLI. Table for Vercel /api/waitlist (service role).

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,
  created_at timestamptz not null default now(),
  constraint waitlist_email_unique unique (email)
);

comment on table public.waitlist is 'Coming-soon waitlist signups from storybuddypro.com';

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

-- No policies: anon/authenticated cannot read or write. Service role bypasses RLS.
