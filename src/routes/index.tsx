import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/firebase-auth";
import { FullScreenLoader } from "@/components/FullScreenLoader";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { ready, user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      navigate({ to: "/auth/login", replace: true });
    } else if (!profile?.onboardingComplete) {
      navigate({ to: "/onboarding", replace: true });
    } else {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [ready, user, profile, navigate]);

  return <FullScreenLoader label="AISLE SPY" />;
}
