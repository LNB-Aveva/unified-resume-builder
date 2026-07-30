-- Patch: lock down shared_scores read access (Finding H3)
-- Apply in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to run on an existing production database; it is idempotent.
--
-- Before: policy "Anyone can read unexpired shared scores" USING (expires_at >= now())
--         let anyone with the public anon key bulk-read every user's rows via
--         GET /rest/v1/shared_scores?select=* (leaking user_id + keyword lists).
-- After:  no anon table SELECT; public share pages read a single row through the
--         SECURITY DEFINER function get_shared_score(id) which omits user_id.

-- 1. Remove the over-permissive public read policy.
drop policy if exists "Anyone can read unexpired shared scores" on public.shared_scores;

-- 2. Owners can still read their own rows (list/manage their shares).
drop policy if exists "Users read own shared scores" on public.shared_scores;
create policy "Users read own shared scores"
  on public.shared_scores for select
  using (auth.uid() = user_id);

-- 3. Owners can delete (revoke) their own shared scores.
drop policy if exists "Users delete own shared scores" on public.shared_scores;
create policy "Users delete own shared scores"
  on public.shared_scores for delete
  using (auth.uid() = user_id);

-- 4. Public single-row read for share links.
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
