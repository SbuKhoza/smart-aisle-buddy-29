import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/firebase-auth";
import { AppShell } from "@/components/AppShell";
import { FullScreenLoader } from "@/components/FullScreenLoader";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { ready, user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/auth/login", replace: true });
    else if (!profile?.onboardingComplete) navigate({ to: "/onboarding", replace: true });
  }, [ready, user, profile, navigate]);

  if (!ready || !user || !profile?.onboardingComplete) return <FullScreenLoader />;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}