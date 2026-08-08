-- Atomic daily AI fair-use quotas. Additive and safe to apply before app deploy.

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

-- Extend the existing retention job so quota counters do not grow forever.
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
