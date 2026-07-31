-- Authenticated share records with constrained score data and owner-only table reads.

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

drop policy if exists "Users read own shared scores" on public.shared_scores;
create policy "Users read own shared scores"
  on public.shared_scores for select
  using (auth.uid() = user_id);

drop policy if exists "Authenticated users insert own shared scores" on public.shared_scores;
create policy "Authenticated users insert own shared scores"
  on public.shared_scores for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own shared scores" on public.shared_scores;
create policy "Users delete own shared scores"
  on public.shared_scores for delete
  using (auth.uid() = user_id);

create index if not exists idx_shared_scores_expires_at
  on public.shared_scores(expires_at);
create index if not exists idx_shared_scores_user_id
  on public.shared_scores(user_id);

-- Public share pages can fetch one unexpired row without exposing user_id or
-- granting anonymous table access.
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
