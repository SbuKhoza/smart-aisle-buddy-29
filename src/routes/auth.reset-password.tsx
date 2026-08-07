import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { passwordSchema } from "@/lib/password";
import { PasswordStrength } from "@/components/PasswordStrength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/BrandLogo";
import { ClientOnly } from "@/components/ClientOnly";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — AISLE SPY" },
      { name: "description", content: "Choose a new password for your AISLE SPY account." },
    ],
  }),
  component: () => (
    <ClientOnly>
      <ResetPasswordPage />
    </ClientOnly>
  ),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oob = params.get("oobCode");
    if (!oob) {
      setInvalid(true);
      return;
    }
    setCode(oob);
    verifyPasswordResetCode(getFirebaseAuth(), oob)
      .then(setEmail)
      .catch(() => setInvalid(true));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (password !== confirm) return toast.error("Passwords do not match");
    if (!code) return;

    setBusy(true);
    try {
      await confirmPasswordReset(getFirebaseAuth(), code, password);
      toast.success("Password updated — sign in with your new password");
      navigate({ to: "/auth/login", replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not reset password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-accent px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
        <div className="mb-6 flex justify-center"><BrandLogo /></div>
        <h1 className="text-2xl font-bold tracking-tight text-secondary">Set a new password</h1>

        {invalid ? (
          <p className="mt-3 text-sm text-muted-foreground">
            This reset link is invalid or has expired.{" "}
            <Link to="/auth/forgot-password" className="font-semibold text-primary hover:underline">Request a new one</Link>.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              {email ? <>For <strong>{email}</strong></> : "Checking your link…"}
            </p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New password</Label>
                <div className="relative">
                  <Input id="new-password" type={show ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl pr-11" />
                  <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary">
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <PasswordStrength value={password} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input id="confirm-password" type={show ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-12 rounded-xl" />
              </div>
              <Button type="submit" disabled={busy || !code} className="h-12 w-full rounded-xl text-base font-semibold">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
              </Button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/auth/login" className="font-semibold text-primary hover:underline">Back to sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
