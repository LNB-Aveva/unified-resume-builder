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
    return { message: error.message };
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
    return { message: error.message };
  }

  redirect("/tools");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
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
    return { message: error.message };
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
    return { message: error.message };
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

  await supabase.auth.updateUser({
    data: {
      newsletter_opted_in: validated.data.newsletterOptIn === "on",
      terms_accepted_at: new Date().toISOString(),
    },
  });

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: validated.data.fullName,
    target_role: validated.data.targetRole ?? null,
    industry: validated.data.industry ?? null,
    years_experience: validated.data.yearsExperience ?? null,
    onboarding_completed: true,
  });

  if (error) {
    return { message: error.message };
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
    return { message: error.message };
  }

  return { success: true, message: "Profile updated." };
}
