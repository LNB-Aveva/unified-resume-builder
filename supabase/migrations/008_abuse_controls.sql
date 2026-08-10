-- Backend-only AI quota mutation and database-enforced storage abuse limits.

-- The browser must not be able to consume the global AI ledger directly.
do $$
begin
  if to_regprocedure('public.consume_ai_quota(integer)') is not null then
    revoke all on function public.consume_ai_quota(int) from public, anon, authenticated;
  end if;
end;
$$;
drop function if exists public.consume_ai_quota(int);

create or replace function public.consume_ai_quota(p_user_id uuid, p_units int)
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
  if p_user_id is null then
    raise exception 'User identity is required' using errcode = '22023';
  end if;
  if p_units < 1 or p_units > 5 then
    raise exception 'Quota units must be between 1 and 5' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('ai-quota:' || v_date::text, 0));

  insert into public.ai_usage_daily (usage_date, user_id, units_used)
  values (v_date, p_user_id, 0)
  on conflict (usage_date, user_id) do nothing;

  insert into public.ai_global_usage_daily (usage_date, units_used)
  values (v_date, 0)
  on conflict (usage_date) do nothing;

  select units_used into v_user_used
  from public.ai_usage_daily
  where usage_date = v_date and user_id = p_user_id
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
  where usage_date = v_date and user_id = p_user_id;

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

revoke all on function public.consume_ai_quota(uuid, int) from public, anon, authenticated;
grant execute on function public.consume_ai_quota(uuid, int) to service_role;

-- Bound content accepted through the public PostgREST API. NOT VALID keeps
-- rollout safe for existing rows while still enforcing each new/updated row.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_content_size'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles add constraint profiles_content_size check (
      (full_name is null or char_length(full_name) <= 200)
      and (target_role is null or char_length(target_role) <= 200)
      and (industry is null or char_length(industry) <= 200)
      -- Production uses an integer while older schema installs used text.
      -- Cast only for regex validation so the constraint is safe on both.
      and (
        years_experience is null
        or years_experience::text ~ '^(0|[1-9]|[1-4][0-9]|50)$'
      )
    ) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'jobs_content_size' and conrelid = 'public.jobs'::regclass
  ) then
    alter table public.jobs add constraint jobs_content_size check (
      char_length(company) <= 200
      and char_length(title) <= 200
      and (url is null or char_length(url) <= 2000)
      and (notes is null or char_length(notes) <= 20000)
    ) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'resume_versions_content_size'
      and conrelid = 'public.resume_versions'::regclass
  ) then
    alter table public.resume_versions add constraint resume_versions_content_size check (
      octet_length(resume_data::text) <= 524288
      and (resume_text is null or char_length(resume_text) <= 200000)
    ) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'shared_scores_content_size'
      and conrelid = 'public.shared_scores'::regclass
  ) then
    alter table public.shared_scores add constraint shared_scores_content_size check (
      char_length(id) between 10 and 64
      and char_length(grade_label) <= 100
      and cardinality(matched_keywords) <= 500
      and cardinality(missing_keywords) <= 500
      and octet_length(array_to_string(matched_keywords, '')) <= 100000
      and octet_length(array_to_string(missing_keywords, '')) <= 100000
    ) not valid;
  end if;
end;
$$;

-- NOT VALID lets the three constraints be created before PostgreSQL scans the
-- existing rows. Validate them in the same migration so launch verification
-- covers both new writes and data that predates this migration.
alter table public.profiles validate constraint profiles_content_size;
alter table public.jobs validate constraint jobs_content_size;
alter table public.resume_versions validate constraint resume_versions_content_size;
alter table public.shared_scores validate constraint shared_scores_content_size;

create or replace function public.enforce_user_storage_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_count bigint;
  v_resume_count bigint;
begin
  if tg_table_name = 'jobs' then
    v_user_id := new.user_id;
  elsif tg_table_name = 'resumes' then
    v_user_id := new.user_id;
  elsif tg_table_name = 'resume_versions' then
    select r.user_id into v_user_id
    from public.resumes r
    where r.id = new.resume_id;
  elsif tg_table_name = 'shared_scores' then
    v_user_id := new.user_id;
  else
    raise exception 'Unsupported storage-limit table' using errcode = '22023';
  end if;

  -- Run before RLS without creating a cross-user row-count side channel.
  if coalesce(auth.role(), '') <> 'service_role'
     and v_user_id is distinct from auth.uid() then
    raise exception 'Storage write is not permitted' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('storage-limit:' || v_user_id::text || ':' || tg_table_name, 0)
  );

  if tg_table_name = 'jobs' then
    select count(*) into v_count from public.jobs where user_id = v_user_id;
    if v_count >= 200 then
      raise exception 'Job storage limit reached' using errcode = 'P0001';
    end if;
  elsif tg_table_name = 'resumes' then
    select count(*) into v_count from public.resumes where user_id = v_user_id;
    if v_count >= 50 then
      raise exception 'Resume storage limit reached' using errcode = 'P0001';
    end if;
  elsif tg_table_name = 'resume_versions' then
    select count(*) into v_count
    from public.resume_versions rv
    join public.resumes r on r.id = rv.resume_id
    where r.user_id = v_user_id;

    select count(*) into v_resume_count
    from public.resume_versions
    where resume_id = new.resume_id;

    if v_count >= 500 or v_resume_count >= 100 then
      raise exception 'Resume version storage limit reached' using errcode = 'P0001';
    end if;
  elsif tg_table_name = 'shared_scores' then
    if new.expires_at <= now() or new.expires_at > now() + interval '31 days' then
      raise exception 'Shared score expiry must be within 31 days' using errcode = '22023';
    end if;

    select count(*) into v_count from public.shared_scores where user_id = v_user_id;
    if v_count >= 100 then
      raise exception 'Shared score storage limit reached' using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_user_storage_limits() from public, anon, authenticated;

drop trigger if exists enforce_jobs_storage_limit on public.jobs;
create trigger enforce_jobs_storage_limit
  before insert on public.jobs
  for each row execute function public.enforce_user_storage_limits();

drop trigger if exists enforce_resumes_storage_limit on public.resumes;
create trigger enforce_resumes_storage_limit
  before insert on public.resumes
  for each row execute function public.enforce_user_storage_limits();

drop trigger if exists enforce_resume_versions_storage_limit on public.resume_versions;
create trigger enforce_resume_versions_storage_limit
  before insert on public.resume_versions
  for each row execute function public.enforce_user_storage_limits();

drop trigger if exists enforce_shared_scores_storage_limit on public.shared_scores;
create trigger enforce_shared_scores_storage_limit
  before insert on public.shared_scores
  for each row execute function public.enforce_user_storage_limits();
