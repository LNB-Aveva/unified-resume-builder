"""Static contracts for Gate 1(b) scraper and automation defenses."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
AUTOMATION_MIGRATION = ROOT / "supabase" / "migrations" / "009_reject_anonymous_automation.sql"
SCHEMA = ROOT / "supabase-schema.sql"
JOB_TRACKER = ROOT / "frontend" / "src" / "app" / "components" / "JobTracker.tsx"
SUPABASE_MIDDLEWARE = ROOT / "frontend" / "src" / "app" / "lib" / "supabase" / "middleware.ts"
SITEMAP = ROOT / "frontend" / "src" / "app" / "sitemap.ts"


def test_anonymous_accounts_cannot_reuse_permanent_user_controls():
    migration = AUTOMATION_MIGRATION.read_text(encoding="utf-8").lower()
    schema = SCHEMA.read_text(encoding="utf-8").lower()

    for table in (
        "profiles",
        "jobs",
        "resumes",
        "resume_versions",
        "shared_scores",
        "ai_usage_daily",
    ):
        marker = f'on public.{table} as restrictive for all to authenticated'
        assert marker in migration
        assert marker in schema

    assert migration.count("auth.jwt()->>'is_anonymous'") == 12
    assert schema.count('create policy "permanent users only"') == 6


def test_browser_never_creates_anonymous_accounts():
    source = JOB_TRACKER.read_text(encoding="utf-8")

    assert "signInAnonymously" not in source
    assert "session.user.is_anonymous" in source


def test_proxy_verifies_cached_claims_instead_of_fetching_every_user():
    source = SUPABASE_MIDDLEWARE.read_text(encoding="utf-8")

    assert "supabase.auth.getClaims()" in source
    assert "supabase.auth.getUser()" not in source


def test_sitemap_uses_real_blog_dates_instead_of_request_time():
    source = SITEMAP.read_text(encoding="utf-8")

    assert "lastModified: post.updatedAt" in source
    assert "lastModified: new Date()" not in source
