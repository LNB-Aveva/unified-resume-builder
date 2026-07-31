-- Named resumes and owner-only row-level security.

create table if not exists public.resumes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 200),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.resumes enable row level security;

drop policy if exists "Users read own resumes" on public.resumes;
create policy "Users read own resumes"
  on public.resumes for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own resumes" on public.resumes;
create policy "Users insert own resumes"
  on public.resumes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own resumes" on public.resumes;
create policy "Users update own resumes"
  on public.resumes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own resumes" on public.resumes;
create policy "Users delete own resumes"
  on public.resumes for delete
  using (auth.uid() = user_id);

create index if not exists idx_resumes_user_id on public.resumes(user_id);

-- 002_jobs.sql cannot create this FK on a fresh database before resumes exists.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.jobs'::regclass
      and conname = 'jobs_resume_id_fkey'
  ) then
    alter table public.jobs
      add constraint jobs_resume_id_fkey
      foreign key (resume_id) references public.resumes(id) on delete set null;
  end if;
end;
$$;
