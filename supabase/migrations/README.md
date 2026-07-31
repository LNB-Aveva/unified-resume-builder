# Supabase migrations

These files provide an ordered, reviewable way to reproduce the application's
current database objects. `supabase-schema.sql` remains the canonical full
schema reference; keep it synchronized whenever a new migration changes the
database model.

## Apply in order

Back up the target database first, then test the migration set in an isolated
Supabase project. Apply every numbered SQL file in ascending order:

1. `001_profiles.sql`
2. `002_jobs.sql`
3. `003_shared_scores.sql`
4. `004_resumes.sql`
5. `005_resume_versions.sql`
6. `006_functions.sql`

In the Supabase Dashboard, open SQL Editor, paste one file, run it, confirm it
succeeds, and then continue to the next file. With the Supabase CLI linked to
the intended project, migrations can instead be applied through the standard
database push workflow. Confirm the project reference before running any CLI
command against a remote environment.

The migrations are idempotent for their declared objects: tables and indexes
use `IF NOT EXISTS`, functions use `CREATE OR REPLACE`, policies are dropped and
recreated, and foreign keys are guarded through the PostgreSQL catalog. Running
the ordered set again should not duplicate those objects. These files do not
automatically retrofit every column or constraint onto an arbitrarily divergent
legacy database; compare such a database with `supabase-schema.sql` first.

## Add a migration

Create the next zero-padded file, for example `007_descriptive_name.sql`. Make
the smallest forward-only change possible, use idempotent guards where
PostgreSQL supports them, include related RLS policies and indexes, and update
`supabase-schema.sql` in the same change. Test both a fresh ordered application
and an application over a copy of the current schema.

## Backups and rollback

SQL migrations can be irreversible without a verified backup, especially when
they drop data, narrow a type, or replace security policies. Before production:

1. create a restorable backup or point-in-time recovery checkpoint;
2. record the current migration and application versions;
3. rehearse the change and restore in a non-production project;
4. stop if the backup cannot be restored successfully.

There are no automatic down migrations in this directory. If a deployment must
be rolled back, first roll back application traffic, then either restore the
pre-migration backup or apply a separately reviewed compensating migration.
Never assume that reversing the SQL text will recover deleted or transformed
data.
