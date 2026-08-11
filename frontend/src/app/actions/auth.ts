"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import {
  SignUpSchema,
  SignInSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  AccountSetupSchema,
  UpdateProfileSchema,
  type FormState,
} from "@/app/lib/definitions";
import { getLegalConfig } from "@/app/lib/legal";

if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL) {
  // Causes a visible build/startup error rather than silently sending
  // password-reset emails with localhost links.
  throw new Error("NEXT_PUBLIC_SITE_URL must be set in production.");
}
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function captchaToken(formData: FormData): string | undefined {
  const value = formData.get("captchaToken");
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function missingCaptcha(formData: FormData): FormState | null {
  if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !captchaToken(formData)) {
    return { message: "Please complete the security check and try again." };
  }
  return null;
}

export async function signUp(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const captchaError = missingCaptcha(formData);
  if (captchaError) return captchaError;

  const validated = SignUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    termsAccepted: formData.get("termsAccepted"),
    newsletterOptIn: formData.get("newsletterOptIn"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { minimumAge } = getLegalConfig();
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      captchaToken: captchaToken(formData),
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: {
        newsletter_opted_in: validated.data.newsletterOptIn === "on",
        terms_accepted_at: new Date().toISOString(),
        minimum_age_confirmed: minimumAge,
        age_confirmed_at: new Date().toISOString(),
      },
    },
  });

  if (error) {
    return { message: "Something went wrong. Please try again." };
  }

  redirect(`/verify-email?email=${encodeURIComponent(validated.data.email)}`);
}

export async function resendVerification(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email");
  if (typeof email !== "string" || !email.includes("@")) {
    return { message: "Please enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim(),
    options: { emailRedirectTo: `${siteUrl}/auth/callback` },
  });

  if (error) {
    return { message: "Could not resend the email. Please try again in a moment." };
  }

  return { message: "Confirmation email sent! Check your inbox (and spam folder)." };
}

export async function signIn(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const captchaError = missingCaptcha(formData);
  if (captchaError) return captchaError;

  const validated = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
    options: { captchaToken: captchaToken(formData) },
  });

  if (error) {
    if (error.status === 429) {
      return { message: "Too many login attempts. Please wait a minute and try again." };
    }
    return { message: "Invalid email or password." };
  }

  redirect("/tools");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function deleteAccount(): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { message: "Not authenticated." };
  }

  // The database function deletes auth.users. Foreign keys cascade every owned
  // table in the same transaction, avoiding a partially deleted account.
  const { error } = await supabase.rpc("delete_own_user");

  if (error) {
    return { message: "Failed to delete account. Please contact support." };
  }

  await supabase.auth.signOut();
  return { success: true };
}

export async function exportUserData(): Promise<{ json?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const [profileResult, jobsResult, resumesResult, sharedScoresResult, usageResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("jobs").select("*").eq("user_id", user.id).order("date_added", { ascending: false }),
    supabase.from("resumes").select("id, title, created_at, updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("shared_scores").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("ai_usage_daily").select("usage_date, units_used, updated_at").eq("user_id", user.id).order("usage_date", { ascending: false }),
  ]);

  if (
    profileResult.error ||
    jobsResult.error ||
    resumesResult.error ||
    sharedScoresResult.error ||
    usageResult.error
  ) {
    return {
      error: "We could not retrieve all of your data. Nothing was downloaded; please try again.",
    };
  }

  const resumes = resumesResult.data ?? [];
  const versionResults = await Promise.all(
    resumes.map(async (r) => {
      const { data: versions, error } = await supabase
        .from("resume_versions")
        .select("version_number, resume_data, resume_text, created_at")
        .eq("resume_id", r.id)
        .order("version_number", { ascending: true });
      return { resume: { ...r, versions: versions ?? [] }, error };
    }),
  );

  if (versionResults.some((result) => result.error)) {
    return {
      error: "We could not retrieve every resume version. Nothing was downloaded; please try again.",
    };
  }

  const resumesWithVersions = versionResults.map((result) => result.resume);

  const exportData = {
    exported_at: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      phone: user.phone || null,
      created_at: user.created_at,
      updated_at: user.updated_at,
      confirmed_at: user.confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      role: user.role,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata,
      identities: user.identities ?? [],
    },
    profile: profileResult.data ?? null,
    jobs: jobsResult.data ?? [],
    resumes: resumesWithVersions,
    shared_scores: sharedScoresResult.data ?? [],
    ai_usage_daily: usageResult.data ?? [],
  };

  return { json: JSON.stringify(exportData, null, 2) };
}

export async function forgotPassword(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const captchaError = missingCaptcha(formData);
  if (captchaError) return captchaError;

  const validated = ForgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    validated.data.email,
    {
      redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
      captchaToken: captchaToken(formData),
    }
  );

  if (error) {
    return { message: "Something went wrong. Please try again." };
  }

  return { success: true, message: "Check your email for a password reset link." };
}

export async function resetPassword(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = ResetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: validated.data.password,
  });

  if (error) {
    return { message: "Failed to reset password. Please try again." };
  }

  redirect("/tools");
}

export async function setupAccount(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = AccountSetupSchema.safeParse({
    fullName: formData.get("fullName"),
    targetRole: formData.get("targetRole"),
    industry: formData.get("industry"),
    yearsExperience: formData.get("yearsExperience"),
    termsAccepted: formData.get("termsAccepted"),
    newsletterOptIn: formData.get("newsletterOptIn"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "Not authenticated." };
  }

  const existingTermsAcceptedAt = user.user_metadata?.terms_accepted_at;
  const existingAgeConfirmedAt = user.user_metadata?.age_confirmed_at;
  if (
    (!existingTermsAcceptedAt || !existingAgeConfirmedAt) &&
    validated.data.termsAccepted !== "on"
  ) {
    return {
      errors: {
        termsAccepted: ["You must accept the Terms of Service and Privacy Policy."],
      },
    };
  }

  const { minimumAge } = getLegalConfig();

  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      newsletter_opted_in:
        validated.data.newsletterOptIn === "on" ||
        user.user_metadata?.newsletter_opted_in === true,
      terms_accepted_at: existingTermsAcceptedAt ?? new Date().toISOString(),
      minimum_age_confirmed: user.user_metadata?.minimum_age_confirmed ?? minimumAge,
      age_confirmed_at: existingAgeConfirmedAt ?? new Date().toISOString(),
    },
  });

  if (metadataError) {
    return { message: "Failed to save account preferences. Please try again." };
  }

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: validated.data.fullName,
    target_role: validated.data.targetRole ?? null,
    industry: validated.data.industry ?? null,
    years_experience: validated.data.yearsExperience ?? null,
    onboarding_completed: true,
  });

  if (error) {
    return { message: "Failed to save profile. Please try again." };
  }

  redirect("/tools");
}

export async function updateProfile(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = UpdateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    targetRole: formData.get("targetRole"),
    industry: formData.get("industry"),
    yearsExperience: formData.get("yearsExperience"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "Not authenticated." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: validated.data.fullName,
      target_role: validated.data.targetRole ?? null,
      industry: validated.data.industry ?? null,
      years_experience: validated.data.yearsExperience ?? null,
    })
    .eq("id", user.id);

  if (error) {
    return { message: "Failed to update profile. Please try again." };
  }

  return { success: true, message: "Profile updated." };
}
