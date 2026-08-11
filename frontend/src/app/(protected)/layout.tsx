import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV !== "production") {
    const cookieStore = await cookies();
    if (cookieStore.get("e2e_bypass")?.value === "1") {
      return <>{children}</>;
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    redirect("/sign-in");
  }

  return <>{children}</>;
}
