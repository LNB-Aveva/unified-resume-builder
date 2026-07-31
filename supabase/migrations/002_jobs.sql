-- Job application tracker and owner-only row-level security.
-- The resume FK is installed here when resumes already exists and is guaranteed
-- by 004_resumes.sql on a fresh ordered installation.

create table if not exists public.jobs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  company    text not null,
  title      text not null,
  url        text,
  status     text not null default 'Saved'
             check (status in ('Saved', 'Applied', 'Interview', 'Offer', 'Rejected')),
  notes      text,
  resume_id  uuid,
  date_added timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.jobs add column if not exists resume_id uuid;

do $$
begin
  if to_regclass('public.resumes') is not null
     and not exists (
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

alter table public.jobs enable row level security;

drop policy if exists "Users read own jobs" on public.jobs;
create policy "Users read own jobs"
  on public.jobs for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own jobs" on public.jobs;
create policy "Users insert own jobs"
  on public.jobs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own jobs" on public.jobs;
create policy "Users update own jobs"
  on public.jobs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own jobs" on public.jobs;
create policy "Users delete own jobs"
  on public.jobs for delete
  using (auth.uid() = user_id);

create index if not exists idx_jobs_user_id on public.jobs(user_id);
create index if not exists idx_jobs_resume_id on public.jobs(resume_id);
