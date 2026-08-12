"""Static contract for browser CAPTCHA wiring and production quota startup."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
AUTH_ACTIONS = ROOT / "frontend" / "src" / "app" / "actions" / "auth.ts"
AUTH_ROOT = ROOT / "frontend" / "src" / "app" / "(auth)"
TURNSTILE = ROOT / "frontend" / "src" / "app" / "components" / "TurnstileWidget.tsx"
DEFINITIONS = ROOT / "frontend" / "src" / "app" / "lib" / "definitions.ts"
ACCOUNT_FORM = ROOT / "frontend" / "src" / "app" / "(protected)" / "account" / "AccountForm.tsx"
SETUP_FORM = ROOT / "frontend" / "src" / "app" / "(protected)" / "account-setup" / "AccountSetupForm.tsx"
SETUP_PAGE = ROOT / "frontend" / "src" / "app" / "(protected)" / "account-setup" / "page.tsx"
PROXY = ROOT / "frontend" / "src" / "proxy.ts"
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


def test_account_setup_cannot_skip_required_terms_or_repeat_acceptance():
    actions = AUTH_ACTIONS.read_text(encoding="utf-8")
    form = SETUP_FORM.read_text(encoding="utf-8")
    page = SETUP_PAGE.read_text(encoding="utf-8")
    proxy = PROXY.read_text(encoding="utf-8")

    assert "!user.user_metadata?.terms_accepted_at" in page
    assert "!user.user_metadata?.age_confirmed_at" in page
    assert "{requiresTermsAcceptance && <div>" in form
    assert "{!requiresTermsAcceptance && <p" in form
    assert "validated.data.termsAccepted !== \"on\"" in actions
    assert "!hasAcceptedEligibility && !path.startsWith(\"/account-setup\")" in proxy
    assert "refreshEligibilityIfMissing: isProtected || isAuthRoute" in proxy


def test_account_setup_refreshes_jwt_claims_before_tools_redirect():
    actions = AUTH_ACTIONS.read_text(encoding="utf-8")
    setup_action = actions[actions.index("export async function setupAccount"):]

    metadata_update = setup_action.index("const { error: metadataError }")
    session_refresh = setup_action.index("supabase.auth.refreshSession()")
    profile_write = setup_action.index('.from("profiles").upsert')
    tools_redirect = setup_action.index('redirect("/tools")')

    assert metadata_update < session_refresh < profile_write < tools_redirect
    assert "Your preferences were saved, but your session could not be refreshed." in setup_action
