"""Static security contract for the canonical AI quota migration."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
MIGRATION = ROOT / "supabase" / "migrations" / "007_ai_usage_quotas.sql"
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
    sql = MIGRATION.read_text(encoding="utf-8").lower()

    assert "alter table public.ai_usage_daily enable row level security" in sql
    assert "alter table public.ai_global_usage_daily enable row level security" in sql
    assert "revoke all on function public.consume_ai_quota(int) from public, anon" in sql
    assert "grant execute on function public.consume_ai_quota(int) to authenticated" in sql
    assert "usage_date < (now() at time zone 'utc')::date - 31" in sql
    assert "grant execute on function public.cleanup_expired_scores() to service_role" in sql


def test_canonical_schema_contains_quota_migration_contract():
    migration = MIGRATION.read_text(encoding="utf-8")
    schema = SCHEMA.read_text(encoding="utf-8")

    for marker in (
        "create table if not exists public.ai_usage_daily",
        "create table if not exists public.ai_global_usage_daily",
        "create or replace function public.consume_ai_quota(p_units int)",
    ):
        assert marker in migration
        assert marker in schema


def test_share_links_keep_full_uuid_entropy_and_support_revocation():
    source = SHARE_WIDGET.read_text(encoding="utf-8")

    generate_id = source[source.index("function generateId"):source.index("export default function")]
    assert "crypto.randomUUID()" in generate_id
    assert ".slice(" not in generate_id
    assert '.from("shared_scores").delete().eq("id", shareId)' in source
