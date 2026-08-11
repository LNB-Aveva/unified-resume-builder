-- Gate 1(b): anonymous Supabase users receive the `authenticated` database
-- role. Add restrictive policies so existing ownership policies cannot be
-- reused by CAPTCHA-free throw-away identities.

drop policy if exists "Permanent users only" on public.profiles;
create policy "Permanent users only"
  on public.profiles as restrictive for all to authenticated
  using (coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false)
  with check (coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);

drop policy if exists "Permanent users only" on public.jobs;
create policy "Permanent users only"
  on public.jobs as restrictive for all to authenticated
  using (coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false)
  with check (coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);

drop policy if exists "Permanent users only" on public.resumes;
create policy "Permanent users only"
  on public.resumes as restrictive for all to authenticated
  using (coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false)
  with check (coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);

drop policy if exists "Permanent users only" on public.resume_versions;
create policy "Permanent users only"
  on public.resume_versions as restrictive for all to authenticated
  using (coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false)
  with check (coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);

drop policy if exists "Permanent users only" on public.shared_scores;
create policy "Permanent users only"
  on public.shared_scores as restrictive for all to authenticated
  using (coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false)
  with check (coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);

drop policy if exists "Permanent users only" on public.ai_usage_daily;
create policy "Permanent users only"
  on public.ai_usage_daily as restrictive for all to authenticated
  using (coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false)
  with check (coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false);

-- Let the protected production workflow prove catalog state without granting
-- browser roles access to PostgreSQL metadata.
create or replace function public.verify_gate1b_automation_controls()
returns table (
  policy_count bigint,
  all_restrictive boolean,
  all_authenticated boolean,
  all_commands boolean,
  all_claim_checks boolean
)
language sql
security definer
set search_path = ''
as $$
  select
    count(*)::bigint,
    coalesce(bool_and(p.permissive = 'RESTRICTIVE'), false),
    coalesce(bool_and(p.roles @> array['authenticated'::name]), false),
    coalesce(bool_and(p.cmd = 'ALL'), false),
    coalesce(
      bool_and(
        position('is_anonymous' in coalesce(p.qual, '')) > 0
        and position('is_anonymous' in coalesce(p.with_check, '')) > 0
      ),
      false
    )
  from pg_catalog.pg_policies p
  where p.schemaname = 'public'
    and p.policyname = 'Permanent users only'
    and p.tablename = any (
      array[
        'profiles',
        'jobs',
        'resumes',
        'resume_versions',
        'shared_scores',
        'ai_usage_daily'
      ]
    );
$$;

revoke all on function public.verify_gate1b_automation_controls() from public, anon, authenticated;
grant execute on function public.verify_gate1b_automation_controls() to service_role;
