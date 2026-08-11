import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AccountSetupForm from "./AccountSetupForm";
import { createClient } from "@/app/lib/supabase/server";
import { getLegalConfig } from "@/app/lib/legal";

export const metadata: Metadata = {
  title: "Set Up Your Profile",
  description:
    "Complete your ResumeAI profile to get personalized ATS resume recommendations.",
};

export default async function AccountSetupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const { minimumAge } = getLegalConfig();

  return (
    <AccountSetupForm
      requiresTermsAcceptance={
        !user.user_metadata?.terms_accepted_at || !user.user_metadata?.age_confirmed_at
      }
      minimumAge={minimumAge}
    />
  );
}
