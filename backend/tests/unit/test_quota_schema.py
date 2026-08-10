"""Static security contract for the canonical AI quota migration."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
MIGRATION = ROOT / "supabase" / "migrations" / "007_ai_usage_quotas.sql"
ABUSE_MIGRATION = ROOT / "supabase" / "migrations" / "008_abuse_controls.sql"
SCHEMA = ROOT / "supabase-schema.sql"
SHARE_WIDGET = ROOT / "frontend" / "src" / "app" / "components" / "ShareableScoreWidget.tsx"


def test_quota_migration_has_atomic_user_and_global_limits():
    sql = MIGRATION.read_text(encoding="utf-8").lower()

    assert "v_user_limit constant int := 10" in sql
    assert "v_global_limit constant int := 500" in sql
    assert "pg_advisory_xact_lock" in sql
    assert "auth.uid()" in sql
    assert "security definer" in sql
    assert "set search_path = ''" in sql


def test_quota_tables_are_rls_protected_and_rpc_is_not_anonymous():
    sql = ABUSE_MIGRATION.read_text(encoding="utf-8").lower()

    assert "drop function if exists public.consume_ai_quota(int)" in sql
    assert "create or replace function public.consume_ai_quota(p_user_id uuid, p_units int)" in sql
    assert "revoke all on function public.consume_ai_quota(uuid, int) from public, anon, authenticated" in sql
    assert "grant execute on function public.consume_ai_quota(uuid, int) to service_role" in sql
    assert "grant execute on function public.consume_ai_quota(uuid, int) to authenticated" not in sql


def test_canonical_schema_contains_quota_migration_contract():
    migration = MIGRATION.read_text(encoding="utf-8") + ABUSE_MIGRATION.read_text(encoding="utf-8")
    schema = SCHEMA.read_text(encoding="utf-8")

    for marker in (
        "create table if not exists public.ai_usage_daily",
        "create table if not exists public.ai_global_usage_daily",
        "create or replace function public.consume_ai_quota(p_user_id uuid, p_units int)",
    ):
        assert marker in migration
        assert marker in schema


def test_storage_abuse_limits_are_database_enforced():
    migration = ABUSE_MIGRATION.read_text(encoding="utf-8").lower()

    for marker in (
        "profiles_content_size",
        "jobs_content_size",
        "resume_versions_content_size",
        "shared_scores_content_size",
        "validate constraint profiles_content_size",
        "validate constraint jobs_content_size",
        "validate constraint resume_versions_content_size",
        "validate constraint shared_scores_content_size",
        "create or replace function public.enforce_user_storage_limits()",
        "if v_count >= 200",
        "if v_count >= 50",
        "if v_count >= 500 or v_resume_count >= 100",
        "if v_count >= 100",
        "new.expires_at > now() + interval '31 days'",
    ):
        assert marker in migration

    assert migration.count("execute function public.enforce_user_storage_limits()") == 4


def test_profile_years_constraint_supports_text_and_integer_schemas():
    migration = ABUSE_MIGRATION.read_text(encoding="utf-8").lower()
    schema = SCHEMA.read_text(encoding="utf-8").lower()
    portable_check = "years_experience::text ~ '^(0|[1-9]|[1-4][0-9]|50)$'"

    assert "char_length(years_experience)" not in migration
    assert portable_check in migration
    assert portable_check in schema


def test_share_links_keep_full_uuid_entropy_and_support_revocation():
    source = SHARE_WIDGET.read_text(encoding="utf-8")

    generate_id = source[source.index("function generateId"):source.index("export default function")]
    assert "crypto.randomUUID()" in generate_id
    assert ".slice(" not in generate_id
    assert '.from("shared_scores").delete().eq("id", shareId)' in source
