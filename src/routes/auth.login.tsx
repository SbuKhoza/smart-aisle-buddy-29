import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/firebase-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Sign in — AISLE SPY" },
      { name: "description", content: "Sign in to your AISLE SPY account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password, remember);
      toast.success("Welcome back");
      navigate({ to: "/", replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    try {
      await loginWithGoogle({ allowCreate: false });
      navigate({ to: "/", replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Google sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-accent px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)]"
      >
        <div className="mb-6 flex justify-center">
          <BrandLogo />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-secondary">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to continue smart shopping.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/auth/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={remember}
              onCheckedChange={(v) => setRemember(!!v)}
            />
            Remember me
          </label>
          <Button
            type="submit"
            disabled={busy}
            className="h-12 w-full rounded-xl text-base font-semibold"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          OR
          <div className="h-px flex-1 bg-border" />
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={onGoogle}
          className="h-12 w-full rounded-xl text-base font-medium"
        >
          Continue with Google
        </Button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Existing accounts only — new users must sign up first.
        </p>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link
            to="/auth/register"
            className="font-semibold text-primary hover:underline"
          >
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}