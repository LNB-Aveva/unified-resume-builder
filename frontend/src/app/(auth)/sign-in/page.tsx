import type { Metadata } from "next";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to ResumeAI to access all 9 free ATS resume tools — keyword analyzer, ATS scorer, gap analysis, AI bullet rewriter, and more.",
  openGraph: {
    title: "Sign In — ResumeAI",
    description:
      "Sign in to access your free ATS resume tools. Check your ATS score, analyze keywords, and optimize your resume.",
  },
  alternates: {
    canonical: "/sign-in",
  },
};

export default function SignInPage() {
  return <SignInForm />;
}
