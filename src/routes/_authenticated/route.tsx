import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    const email = data.user.email?.toLowerCase();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", data.user.id)
      .maybeSingle();
    if (email !== "cheithchouk@gmail.com" && !profileError && profile && !profile.onboarding_completed) {
      throw redirect({ to: "/onboarding" });
    }
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const [email, setEmail] = useState("");
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);
  return <AppShell email={email} />;
}
