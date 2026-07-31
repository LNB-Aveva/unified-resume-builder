-- Immutable snapshots tied to resumes. There is intentionally no update policy.

create table if not exists public.resume_versions (
  id              uuid primary key default gen_random_uuid(),
  resume_id       uuid not null references public.resumes(id) on delete cascade,
  version_number  int not null check (version_number >= 1),
  resume_data     jsonb not null,
  resume_text     text,
  created_at      timestamptz not null default now(),
  unique(resume_id, version_number)
);

alter table public.resume_versions enable row level security;

drop policy if exists "Users read own resume versions" on public.resume_versions;
create policy "Users read own resume versions"
  on public.resume_versions for select
  using (
    exists (
      select 1 from public.resumes
      where resumes.id = resume_versions.resume_id
        and resumes.user_id = auth.uid()
    )
  );

drop policy if exists "Users insert own resume versions" on public.resume_versions;
create policy "Users insert own resume versions"
  on public.resume_versions for insert
  with check (
    exists (
      select 1 from public.resumes
      where resumes.id = resume_versions.resume_id
        and resumes.user_id = auth.uid()
    )
  );

drop policy if exists "Users delete own resume versions" on public.resume_versions;
create policy "Users delete own resume versions"
  on public.resume_versions for delete
  using (
    exists (
      select 1 from public.resumes
      where resumes.id = resume_versions.resume_id
        and resumes.user_id = auth.uid()
    )
  );

create index if not exists idx_resume_versions_resume_id
  on public.resume_versions(resume_id);
