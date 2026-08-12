import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function isTemporaryAuthFailure(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { name?: string; status?: number };
  return (
    candidate.name === "AuthRetryableFetchError" ||
    (candidate.status !== undefined && candidate.status >= 500)
  );
}

export async function updateSession(
  request: NextRequest,
  options: { refreshEligibilityIfMissing?: boolean } = {},
) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    const {
      data,
      error,
    } = await supabase.auth.getClaims();

    const user = data?.claims?.is_anonymous === true ? null : data?.claims ?? null;
    const userMetadata = user?.user_metadata as Record<string, unknown> | undefined;
    const hasAcceptedEligibility =
      typeof userMetadata?.terms_accepted_at === "string" &&
      typeof userMetadata?.age_confirmed_at === "string";

    // Claims are the fast, signed identity check. Only authenticated users with
    // missing eligibility claims need an authoritative lookup; this closes the
    // short stale-JWT window after account setup without adding Auth traffic to
    // anonymous requests for public pages.
    if (options.refreshEligibilityIfMissing && user && !hasAcceptedEligibility) {
      const { data: freshData, error: freshError } = await supabase.auth.getUser();
      if (
        !freshError &&
        freshData.user &&
        !freshData.user.is_anonymous &&
        typeof freshData.user.user_metadata?.terms_accepted_at === "string" &&
        typeof freshData.user.user_metadata?.age_confirmed_at === "string"
      ) {
        // Best-effort self-heal: set a new JWT cookie so later protected
        // requests return to local claim verification instead of repeating the
        // authoritative lookup until the old access token expires.
        await supabase.auth.refreshSession();
      }
      return {
        supabaseResponse,
        user: freshData.user?.is_anonymous ? null : freshData.user,
        authUnavailable: isTemporaryAuthFailure(freshError),
      };
    }

    return {
      supabaseResponse,
      user,
      authUnavailable: isTemporaryAuthFailure(error),
    };
  } catch {
    return { supabaseResponse, user: null, authUnavailable: true };
  }
}
