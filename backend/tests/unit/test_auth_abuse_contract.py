"""Static contract for browser CAPTCHA wiring and production quota startup."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
AUTH_ACTIONS = ROOT / "frontend" / "src" / "app" / "actions" / "auth.ts"
AUTH_ROOT = ROOT / "frontend" / "src" / "app" / "(auth)"
TURNSTILE = ROOT / "frontend" / "src" / "app" / "components" / "TurnstileWidget.tsx"
DEFINITIONS = ROOT / "frontend" / "src" / "app" / "lib" / "definitions.ts"
ACCOUNT_FORM = ROOT / "frontend" / "src" / "app" / "(protected)" / "account" / "AccountForm.tsx"
SETUP_FORM = ROOT / "frontend" / "src" / "app" / "(protected)" / "account-setup" / "AccountSetupForm.tsx"
CONFIG = ROOT / "backend" / "app" / "core" / "config.py"
HEALTH = ROOT / "backend" / "app" / "main.py"


def test_email_auth_flows_forward_turnstile_token():
    actions = AUTH_ACTIONS.read_text(encoding="utf-8")

    assert actions.count("captchaToken: captchaToken(formData)") == 3
    assert "NEXT_PUBLIC_TURNSTILE_SITE_KEY" in actions

    for relative in (
        "sign-up/SignUpForm.tsx",
        "sign-in/SignInForm.tsx",
        "forgot-password/ForgotPasswordForm.tsx",
    ):
        source = (AUTH_ROOT / relative).read_text(encoding="utf-8")
        assert 'import TurnstileWidget from "@/app/components/TurnstileWidget"' in source
        assert "<TurnstileWidget pending={pending} />" in source

    widget = TURNSTILE.read_text(encoding="utf-8")
    assert "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" in widget
    assert 'name="captchaToken"' in widget


def test_production_quota_configuration_fails_fast_and_is_observable():
    config = CONFIG.read_text(encoding="utf-8")
    health = HEALTH.read_text(encoding="utf-8")

    assert 'raise RuntimeError("Production cannot start with AI_QUOTA_ENFORCEMENT disabled")' in config
    assert "SUPABASE_SERVICE_ROLE_KEY" in config
    assert '"ai_quota_enforcement": settings.AI_QUOTA_ENFORCEMENT' in health
    assert '"ai_quota_backend_configured"' in health


def test_profile_ui_and_actions_match_database_text_boundaries():
    definitions = DEFINITIONS.read_text(encoding="utf-8")
    forms = ACCOUNT_FORM.read_text(encoding="utf-8") + SETUP_FORM.read_text(encoding="utf-8")

    assert definitions.count("fullName: z.string().trim().min(2") == 2
    assert definitions.count("targetRole: z.string().max(200).optional()") == 2
    assert definitions.count("industry: z.string().max(200).optional()") == 2
    assert definitions.count(".max(200)") >= 6
    assert forms.count("maxLength={200}") == 6
