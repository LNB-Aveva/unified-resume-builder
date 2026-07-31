-- Profiles and owner-only row-level security.

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

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users delete own profile" on public.profiles;
create policy "Users delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);
