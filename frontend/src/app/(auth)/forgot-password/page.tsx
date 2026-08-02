import type { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  description:
    "Reset your ResumeAI password. Enter your email to receive a password reset link.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
