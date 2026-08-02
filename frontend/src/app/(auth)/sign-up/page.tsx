import type { Metadata } from "next";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up Free",
  description:
    "Create a free ResumeAI account. Access 9 ATS resume tools — keyword analyzer, ATS score checker, AI bullet rewriter, cover letter generator, and more.",
  openGraph: {
    title: "Create Your Free Account — ResumeAI",
    description:
      "Sign up free and get instant access to 9 ATS resume tools. No credit card required.",
  },
};

export default function SignUpPage() {
  return <SignUpForm />;
}
