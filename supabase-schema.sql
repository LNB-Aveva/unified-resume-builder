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
-- AI daily fair-use quota: durable, atomic user + global provider limits
-- -----------------------------------------------------------------------
create table if not exists public.ai_usage_daily (
  usage_date date not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  units_used int not null default 0 check (units_used >= 0),
  updated_at timestamptz not null default now(),
  primary key (usage_date, user_id)
);

create table if not exists public.ai_global_usage_daily (
  usage_date date primary key,
  units_used int not null default 0 check (units_used >= 0),
  updated_at timestamptz not null default now()
);

alter table public.ai_usage_daily enable row level security;
alter table public.ai_global_usage_daily enable row level security;

drop policy if exists "Users read own AI usage" on public.ai_usage_daily;
create policy "Users read own AI usage"
  on public.ai_usage_daily for select
  using (auth.uid() = user_id);

revoke all on table public.ai_usage_daily from anon, authenticated;
revoke all on table public.ai_global_usage_daily from anon, authenticated;
grant select on table public.ai_usage_daily to authenticated;

create or replace function public.consume_ai_quota(p_units int)
returns table (
  allowed boolean,
  user_remaining int,
  global_remaining int,
  retry_after_seconds int
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_date date := (now() at time zone 'utc')::date;
  v_user_used int;
  v_global_used int;
  v_user_limit constant int := 10;
  v_global_limit constant int := 500;
  v_retry_after int := greatest(
    1,
    extract(epoch from (
      date_trunc('day', now() at time zone 'utc') + interval '1 day'
      - (now() at time zone 'utc')
    ))::int
  );
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_units < 1 or p_units > 5 then
    raise exception 'Quota units must be between 1 and 5' using errcode = '22023';
  end if;

  -- Serialize the small daily counter transaction so user and global updates
  -- cannot race past either ceiling under concurrent requests.
  perform pg_advisory_xact_lock(hashtextextended('ai-quota:' || v_date::text, 0));

  insert into public.ai_usage_daily (usage_date, user_id, units_used)
  values (v_date, v_user_id, 0)
  on conflict (usage_date, user_id) do nothing;

  insert into public.ai_global_usage_daily (usage_date, units_used)
  values (v_date, 0)
  on conflict (usage_date) do nothing;

  select units_used into v_user_used
  from public.ai_usage_daily
  where usage_date = v_date and user_id = v_user_id
  for update;

  select units_used into v_global_used
  from public.ai_global_usage_daily
  where usage_date = v_date
  for update;

  if v_user_used + p_units > v_user_limit
     or v_global_used + p_units > v_global_limit then
    return query select
      false,
      greatest(0, v_user_limit - v_user_used),
      greatest(0, v_global_limit - v_global_used),
      v_retry_after;
    return;
  end if;

  update public.ai_usage_daily
  set units_used = units_used + p_units, updated_at = now()
  where usage_date = v_date and user_id = v_user_id;

  update public.ai_global_usage_daily
  set units_used = units_used + p_units, updated_at = now()
  where usage_date = v_date;

  return query select
    true,
    v_user_limit - (v_user_used + p_units),
    v_global_limit - (v_global_used + p_units),
    v_retry_after;
end;
$$;

revoke all on function public.consume_ai_quota(int) from public, anon;
grant execute on function public.consume_ai_quota(int) to authenticated;

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
  with deleted_scores as (
    delete from public.shared_scores
    where expires_at < now()
    returning 1
  ), deleted_user_usage as (
    delete from public.ai_usage_daily
    where usage_date < (now() at time zone 'utc')::date - 31
    returning 1
  ), deleted_global_usage as (
    delete from public.ai_global_usage_daily
    where usage_date < (now() at time zone 'utc')::date - 31
    returning 1
  )
  select (
    (select count(*) from deleted_scores)
    + (select count(*) from deleted_user_usage)
    + (select count(*) from deleted_global_usage)
  )::int;
$$;

revoke all on function public.cleanup_expired_scores() from public, anon, authenticated;
grant execute on function public.cleanup_expired_scores() to service_role;

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

revoke all on function public.delete_own_user() from public, anon;
grant execute on function public.delete_own_user() to authenticated;
