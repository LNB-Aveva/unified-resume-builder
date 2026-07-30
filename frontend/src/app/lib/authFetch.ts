"use client";

import { createClient } from "@/app/lib/supabase/client";
import { fetchWithRetry } from "./fetchWithRetry";

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init?.headers);
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  return fetchWithRetry(input, { ...init, headers });
}
