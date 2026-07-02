-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- Creates the jobs table and Row Level Security policies

create table if not exists public.jobs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  company    text not null,
  title      text not null,
  url        text,
  status     text not null default 'Saved'
             check (status in ('Saved', 'Applied', 'Interview', 'Offer', 'Rejected')),
  notes      text,
  date_added timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.jobs enable row level security;

-- Users can only see their own jobs
create policy "Users read own jobs"
  on public.jobs for select
  using (auth.uid() = user_id);

-- Users can only insert their own jobs
create policy "Users insert own jobs"
  on public.jobs for insert
  with check (auth.uid() = user_id);

-- Users can only update their own jobs
create policy "Users update own jobs"
  on public.jobs for update
  using (auth.uid() = user_id);

-- Users can only delete their own jobs
create policy "Users delete own jobs"
  on public.jobs for delete
  using (auth.uid() = user_id);

-- Index for fast user-specific queries
create index if not exists idx_jobs_user_id on public.jobs(user_id);
