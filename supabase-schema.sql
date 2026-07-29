-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- Creates all application tables and Row Level Security policies

-- -----------------------------------------------------------------------
-- profiles: user profile data created during onboarding
-- -----------------------------------------------------------------------
create table if not exists public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  full_name             text,
  target_role           text,
  industry              text,
  years_experience      text,
  onboarding_completed  boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- -----------------------------------------------------------------------
-- jobs: per-user job application tracker
-- -----------------------------------------------------------------------
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

-- -----------------------------------------------------------------------
-- shared_scores: stores anonymous ATS score snapshots for shareable links
-- -----------------------------------------------------------------------
create table if not exists public.shared_scores (
  id                 text primary key,
  overall_score      numeric(5,2) not null,
  grade              text not null,
  grade_label        text not null,
  matched_keywords   text[] not null default '{}',
  missing_keywords   text[] not null default '{}',
  total_matched      int not null default 0,
  total_missing      int not null default 0,
  total_job_keywords int not null default 0,
  job_role_hint      text,
  created_at         timestamptz not null default now(),
  expires_at         timestamptz not null
);

-- Anyone (anon) can read unexpired scores via the public share link
alter table public.shared_scores enable row level security;

create policy "Anyone can read unexpired shared scores"
  on public.shared_scores for select
  using (expires_at >= now());

-- Anyone (anon) can insert a new share (rate-limited at the API layer)
create policy "Anyone can insert shared scores"
  on public.shared_scores for insert
  with check (true);

-- Index so the expiry filter is fast
create index if not exists idx_shared_scores_expires_at
  on public.shared_scores(expires_at);

-- -----------------------------------------------------------------------
-- delete_own_user: allows an authenticated user to delete their own
-- auth.users row. Runs as SECURITY DEFINER so it has the privileges
-- to touch auth.users. The WHERE clause ensures a user can only
-- delete themselves.
-- -----------------------------------------------------------------------
create or replace function public.delete_own_user()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;
