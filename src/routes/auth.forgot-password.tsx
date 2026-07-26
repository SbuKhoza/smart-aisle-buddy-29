import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/firebase-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — AISLE SPY" },
      { name: "description", content: "Reset your AISLE SPY password." },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success("Reset link sent — check your inbox");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not send reset link");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-accent px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
        <div className="mb-6 flex justify-center"><BrandLogo /></div>
        <h1 className="text-2xl font-bold tracking-tight text-secondary">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter your email and we'll send a reset link.</p>

        {sent ? (
          <div className="mt-6 rounded-2xl bg-primary/10 p-4 text-sm text-secondary">
            If an account exists for <strong>{email}</strong>, a reset link is on the way.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" />
            </div>
            <Button type="submit" disabled={busy} className="h-12 w-full rounded-xl text-base font-semibold">
              Send reset link
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/auth/login" className="font-semibold text-primary hover:underline">Back to sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}