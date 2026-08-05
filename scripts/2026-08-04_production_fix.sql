-- =================================================================
-- Production Fix: shared_scores user_id + RLS + missing RPC functions
-- =================================================================
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- Date: 2026-08-04
-- Context: RLS isolation tests (Phase 4.5) revealed that production
--   Supabase is missing critical migrations:
--   1. shared_scores.user_id column (no ownership enforcement)
--   2. delete_own_user() function (account deletion broken)
--   3. get_shared_score() function (share pages use insecure path)
--   4. Old permissive anon SELECT policy still active (bulk enumeration)
--
-- This script is idempotent — safe to run multiple times.
-- =================================================================

-- ── Step 1: Delete orphan shared_scores rows (no user_id to assign) ──
-- There is 1 existing row (id: 8ac982dddd) created before user_id
-- was added to the schema. It has no owner and cannot be attributed.
delete from public.shared_scores
where not exists (
  select 1 from information_schema.columns
  where table_schema = 'public'
    and table_name = 'shared_scores'
    and column_name = 'user_id'
);

-- ── Step 2: Add user_id column if missing ────────────────────────────
alter table public.shared_scores
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Make it NOT NULL (safe now — table is empty after step 1)
-- If there were rows with NULL user_id, this would fail — that's intentional.
alter table public.shared_scores
  alter column user_id set not null;

-- ── Step 2b: Ensure RLS is enabled ───────────────────────────────────
alter table public.shared_scores enable row level security;

-- ── Step 3: Fix RLS policies ─────────────────────────────────────────
-- Remove ALL stale permissive policies (some from early sessions)
drop policy if exists "Anyone can read unexpired shared scores" on public.shared_scores;
drop policy if exists "Anyone can read shared scores" on public.shared_scores;
drop policy if exists "Anyone can insert shared scores" on public.shared_scores;
drop policy if exists "anon_insert" on public.shared_scores;
drop policy if exists "public_read" on public.shared_scores;

-- Owner-only SELECT
drop policy if exists "Users read own shared scores" on public.shared_scores;
create policy "Users read own shared scores"
  on public.shared_scores for select
  using (auth.uid() = user_id);

-- Authenticated insert (own rows only)
drop policy if exists "Authenticated users insert own shared scores" on public.shared_scores;
create policy "Authenticated users insert own shared scores"
  on public.shared_scores for insert
  with check (auth.uid() = user_id);

-- Owner-only DELETE
drop policy if exists "Users delete own shared scores" on public.shared_scores;
create policy "Users delete own shared scores"
  on public.shared_scores for delete
  using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_shared_scores_user_id
  on public.shared_scores(user_id);
create index if not exists idx_shared_scores_expires_at
  on public.shared_scores(expires_at);

-- ── Step 4: Create get_shared_score() — public share page reader ─────
-- SECURITY DEFINER bypasses RLS to read one row by ID, omitting user_id.
-- This is the ONLY way public share links can read score data.
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

-- ── Step 5: Create delete_own_user() — account self-deletion ─────────
create or replace function public.delete_own_user()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

-- ── Step 6: Create cleanup_expired_scores() (idempotent) ─────────────
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

-- ── Verification queries (run after the script) ──────────────────────
-- These should all return results confirming the fixes:
--
-- 1. Check user_id column exists:
--    SELECT column_name, is_nullable, data_type
--    FROM information_schema.columns
--    WHERE table_name = 'shared_scores' AND column_name = 'user_id';
--
-- 2. Check RLS policies:
--    SELECT policyname, cmd, qual
--    FROM pg_policies
--    WHERE tablename = 'shared_scores';
--
-- 3. Check functions exist:
--    SELECT routine_name
--    FROM information_schema.routines
--    WHERE routine_schema = 'public'
--      AND routine_name IN ('delete_own_user', 'get_shared_score', 'cleanup_expired_scores');
