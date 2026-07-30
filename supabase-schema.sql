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
  resume_id  uuid references public.resumes(id) on delete set null,
  date_added timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Migration helper: add resume_id to existing jobs table
-- (safe to run multiple times; skipped if the column already exists)
alter table public.jobs
  add column if not exists resume_id uuid references public.resumes(id) on delete set null;

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
-- resumes: user's named resume documents
-- -----------------------------------------------------------------------
create table if not exists public.resumes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 200),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.resumes enable row level security;

create policy "Users read own resumes"
  on public.resumes for select
  using (auth.uid() = user_id);

create policy "Users insert own resumes"
  on public.resumes for insert
  with check (auth.uid() = user_id);

create policy "Users update own resumes"
  on public.resumes for update
  using (auth.uid() = user_id);

create policy "Users delete own resumes"
  on public.resumes for delete
  using (auth.uid() = user_id);

create index if not exists idx_resumes_user_id on public.resumes(user_id);

-- -----------------------------------------------------------------------
-- resume_versions: immutable content snapshots tied to a resume
-- -----------------------------------------------------------------------
create table if not exists public.resume_versions (
  id              uuid primary key default gen_random_uuid(),
  resume_id       uuid not null references public.resumes(id) on delete cascade,
  version_number  int not null check (version_number >= 1),
  resume_data     jsonb not null,
  resume_text     text,
  created_at      timestamptz not null default now(),
  unique(resume_id, version_number)
);

alter table public.resume_versions enable row level security;

create policy "Users read own resume versions"
  on public.resume_versions for select
  using (
    exists (
      select 1 from public.resumes
      where resumes.id = resume_versions.resume_id
        and resumes.user_id = auth.uid()
    )
  );

create policy "Users insert own resume versions"
  on public.resume_versions for insert
  with check (
    exists (
      select 1 from public.resumes
      where resumes.id = resume_versions.resume_id
        and resumes.user_id = auth.uid()
    )
  );

create policy "Users delete own resume versions"
  on public.resume_versions for delete
  using (
    exists (
      select 1 from public.resumes
      where resumes.id = resume_versions.resume_id
        and resumes.user_id = auth.uid()
    )
  );

create index if not exists idx_resume_versions_resume_id
  on public.resume_versions(resume_id);

-- -----------------------------------------------------------------------
-- shared_scores: authenticated ATS score snapshots for shareable links
-- -----------------------------------------------------------------------
create table if not exists public.shared_scores (
  id                 text primary key,
  user_id            uuid not null references auth.users(id) on delete cascade,
  overall_score      numeric(5,2) not null check (overall_score >= 0 and overall_score <= 100),
  grade              text not null check (grade in ('A', 'B', 'C', 'D', 'F')),
  grade_label        text not null,
  matched_keywords   text[] not null default '{}',
  missing_keywords   text[] not null default '{}',
  total_matched      int not null default 0 check (total_matched >= 0),
  total_missing      int not null default 0 check (total_missing >= 0),
  total_job_keywords int not null default 0 check (total_job_keywords >= 0),
  job_role_hint      text check (char_length(job_role_hint) <= 200),
  created_at         timestamptz not null default now(),
  expires_at         timestamptz not null
);

alter table public.shared_scores enable row level security;

-- IMPORTANT: there is intentionally NO public/anon SELECT policy on this table.
-- A blanket "using (expires_at >= now())" policy would let anyone with the public
-- anon key run `GET /rest/v1/shared_scores?select=*` and bulk-dump every user's
-- rows (including user_id and keyword lists). Public share pages instead read a
-- single row through the SECURITY DEFINER function public.get_shared_score(id),
-- which returns only non-identifying fields and only while unexpired.

-- Owners can read their own scores (e.g. to list/manage their shares)
create policy "Users read own shared scores"
  on public.shared_scores for select
  using (auth.uid() = user_id);

-- Only authenticated users can insert their own scores
create policy "Authenticated users insert own shared scores"
  on public.shared_scores for insert
  with check (auth.uid() = user_id);

-- Owners can delete their own shared scores (revoke a share link)
create policy "Users delete own shared scores"
  on public.shared_scores for delete
  using (auth.uid() = user_id);

-- Public single-row read for share links. SECURITY DEFINER bypasses RLS but the
-- function only ever returns ONE row matched by id, only while unexpired, and
-- deliberately omits user_id so shared links cannot enumerate accounts.
create or replace function public.get_shared_score(p_id text)
returns table (
  id                 text,
  overall_score      numeric,
  grade              text,
  grade_label        text,
  matched_keywords   text[],
  missing_keywords   text[],
  total_matched      int,
  total_missing      int,
  total_job_keywords int,
  job_role_hint      text,
  created_at         timestamptz,
  expires_at         timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select s.id, s.overall_score, s.grade, s.grade_label,
         s.matched_keywords, s.missing_keywords,
         s.total_matched, s.total_missing, s.total_job_keywords,
         s.job_role_hint, s.created_at, s.expires_at
  from public.shared_scores s
  where s.id = p_id
    and s.expires_at >= now();
$$;

grant execute on function public.get_shared_score(text) to anon, authenticated;

-- Index so the expiry filter is fast
create index if not exists idx_shared_scores_expires_at
  on public.shared_scores(expires_at);

-- Index for user-scoped queries
create index if not exists idx_shared_scores_user_id
  on public.shared_scores(user_id);

-- -----------------------------------------------------------------------
-- cleanup_expired_scores: deletes shared_scores rows past their
-- expires_at timestamp. Call via pg_cron (paid tier) or an external
-- cron hitting GET /api/v1/cleanup?key=<SECRET>.
-- -----------------------------------------------------------------------
create or replace function public.cleanup_expired_scores()
returns int
language sql
security definer
set search_path = ''
as $$
  with deleted as (
    delete from public.shared_scores
    where expires_at < now()
    returning 1
  )
  select count(*)::int from deleted;
$$;

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
