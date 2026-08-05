import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/app/lib/supabase/middleware";

const protectedPrefixes = ["/tools", "/account", "/account-setup", "/resumes"];
const authRoutes = ["/sign-in", "/sign-up", "/forgot-password"];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((p) => path.startsWith(p));
  const isAuthRoute = authRoutes.some((p) => path.startsWith(p));

  const isE2EBypass =
    process.env.NODE_ENV !== "production" &&
    request.cookies.get("e2e_bypass")?.value === "1";

  if (isE2EBypass) {
    return NextResponse.next({ request });
  }

  const { supabaseResponse, user, authUnavailable } = await updateSession(request);

  if (isProtected && authUnavailable) {
    const url = request.nextUrl.clone();
    url.pathname = "/service-unavailable";
    url.searchParams.set("retry", path);
    return NextResponse.redirect(url);
  }


  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/tools";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.svg|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
