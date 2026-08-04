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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function signUp(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
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

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: {
        newsletter_opted_in: validated.data.newsletterOptIn === "on",
        terms_accepted_at: new Date().toISOString(),
      },
    },
  });

  if (error) {
    return { message: "Something went wrong. Please try again." };
  }

  redirect("/verify-email");
}

export async function signIn(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
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

  // This SECURITY DEFINER RPC deletes auth.users; FK cascades remove all owned
  // rows in one database transaction. Do not pre-delete rows and then ignore
  // failures: that can leave a partially deleted account when the RPC fails.
  const { error } = await supabase.rpc("delete_own_user");

  if (error) {
    return { message: "Failed to delete account. Please contact support." };
  }

  await supabase.auth.signOut();
  redirect("/");
}

export async function exportUserData(): Promise<{ json?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Not authenticated." };
  }

  const [profileResult, jobsResult, resumesResult, sharedScoresResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("jobs").select("*").eq("user_id", user.id).order("date_added", { ascending: false }),
    supabase.from("resumes").select("id, title, created_at, updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("shared_scores").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  if (profileResult.error || jobsResult.error || resumesResult.error || sharedScoresResult.error) {
    return { error: "We could not retrieve all of your data. Nothing was downloaded." };
  }

  const resumes = resumesResult.data ?? [];
  const resumesWithVersions = await Promise.all(
    resumes.map(async (r) => {
      const { data: versions, error } = await supabase
        .from("resume_versions")
        .select("version_number, resume_data, resume_text, created_at")
        .eq("resume_id", r.id)
        .order("version_number", { ascending: true });
      return { resume: r, versions: versions ?? [], error };
    }),
  );

  if (resumesWithVersions.some((result) => result.error)) {
    return { error: "We could not retrieve all resume versions. Nothing was downloaded." };
  }

  const exportData = {
    exported_at: new Date().toISOString(),
    account: {
      email: user.email,
      created_at: user.created_at,
    },
    profile: profileResult.data ?? null,
    jobs: jobsResult.data ?? [],
    resumes: resumesWithVersions.map(({ resume, versions }) => ({ ...resume, versions })),
    shared_scores: sharedScoresResult.data ?? [],
  };

  return { json: JSON.stringify(exportData, null, 2) };
}

export async function forgotPassword(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = ForgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    validated.data.email,
    { redirectTo: `${siteUrl}/auth/callback?next=/reset-password` }
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

  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      newsletter_opted_in: validated.data.newsletterOptIn === "on",
      terms_accepted_at: new Date().toISOString(),
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
