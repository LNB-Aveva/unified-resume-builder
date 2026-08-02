import type { Metadata } from "next";
import AccountSetupForm from "./AccountSetupForm";

export const metadata: Metadata = {
  title: "Set Up Your Profile",
  description:
    "Complete your ResumeAI profile to get personalized ATS resume recommendations.",
};

export default function AccountSetupPage() {
  return <AccountSetupForm />;
}
