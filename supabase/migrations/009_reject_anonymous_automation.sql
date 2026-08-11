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
