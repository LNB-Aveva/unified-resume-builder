-- Maintenance and self-service account deletion functions.

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

revoke all on function public.cleanup_expired_scores() from public, anon, authenticated;
grant execute on function public.cleanup_expired_scores() to service_role;
