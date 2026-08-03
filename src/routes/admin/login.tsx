import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "firebase/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/firebase-auth";
import { isAdminUser } from "@/lib/services/admin";
import { getFirebaseAuth } from "@/lib/firebase";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin sign in — AISLE SPY" },
      { name: "description", content: "Sign in to the AISLE SPY admin console." },
    ],
  }),
  component: AdminLoginPage,
});

type Mode = "login" | "recover";

function AdminLoginPage() {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Enter your email and password");
      return;
    }
    setBusy(true);
    try {
      // Admin sessions are always "remembered" — this is a console, not a shared device flow.
      await login(email.trim(), password, true);

      // `login()` resolves as soon as Firebase confirms the credential, which can
      // be slightly ahead of the AuthProvider's onAuthStateChanged listener firing.
      // Read the freshly-signed-in user straight off the auth instance to avoid a race.
      const current = getFirebaseAuth().currentUser;
      if (!current) throw new Error("Sign in failed");

      const admin = await isAdminUser(current.uid);
      if (!admin) {
        await signOut(getFirebaseAuth());
        toast.error("This account does not have admin access");
        return;
      }

      toast.success("Welcome back");
      navigate({ to: "/admin", replace: true });
    } catch (err: any) {
      toast.error(mapAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleRecover(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter the admin email first");
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email.trim());
      toast.success("Password reset email sent");
      setMode("login");
    } catch (err: any) {
      toast.error(mapAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <Card className="rounded-2xl border-border p-6 shadow-[var(--shadow-card)]">
          <div className="mb-5 flex flex-col items-center text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck size={20} />
            </div>
            <h1 className="text-[18px] font-bold text-secondary">
              {mode === "login" ? "Admin sign in" : "Reset password"}
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {mode === "login"
                ? "Restricted to AISLE SPY administrators."
                : "We'll email you a link to reset your password."}
            </p>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[12px]">Email</Label>
                <Input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aislespy.com"
                  className="h-9 text-[14px]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[12px]">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-9 pr-9 text-[14px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-secondary"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode("recover")}
                  className="text-[12px] font-medium text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" disabled={busy} className="h-9 w-full text-[14px]">
                {busy ? <Loader2 size={15} className="mr-1.5 animate-spin" /> : null}
                Sign in
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRecover} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[12px]">Email</Label>
                <Input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aislespy.com"
                  className="h-9 text-[14px]"
                />
              </div>
              <Button type="submit" disabled={busy} className="h-9 w-full text-[14px]">
                {busy ? <Loader2 size={15} className="mr-1.5 animate-spin" /> : null}
                Send reset link
              </Button>
              <button
                type="button"
                onClick={() => setMode("login")}
                className="w-full text-center text-[12px] font-medium text-muted-foreground hover:text-secondary"
              >
                Back to sign in
              </button>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

function mapAuthError(err: any): string {
  const code = err?.code as string | undefined;
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    case "auth/invalid-email":
      return "Enter a valid email address";
    default:
      return err?.message || "Something went wrong";
  }
}