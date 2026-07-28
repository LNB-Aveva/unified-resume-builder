import { z } from "zod";

export const SignUpSchema = z
  .object({
    email: z.string().email("Please enter a valid email."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[a-zA-Z]/, "Must contain at least one letter.")
      .regex(/[0-9]/, "Must contain at least one number."),
    confirmPassword: z.string(),
    termsAccepted: z.literal("on", {
      message: "You must accept the Terms of Service and Privacy Policy.",
    }),
    newsletterOptIn: z.literal("on").optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const SignInSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email."),
});

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[a-zA-Z]/, "Must contain at least one letter.")
      .regex(/[0-9]/, "Must contain at least one number."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const AccountSetupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters.").trim(),
  targetRole: z.string().optional(),
  industry: z.string().optional(),
  yearsExperience: z.coerce.number().min(0).max(50).optional(),
  termsAccepted: z.literal("on", {
    message: "You must accept the Terms of Service and Privacy Policy.",
  }),
  newsletterOptIn: z.literal("on").optional(),
});

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters.").trim(),
  targetRole: z.string().optional(),
  industry: z.string().optional(),
  yearsExperience: z.coerce.number().min(0).max(50).optional(),
});

export type FormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      success?: boolean;
    }
  | undefined;
