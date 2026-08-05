import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/firebase-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES, SA_PROVINCES } from "@/constants/regions";
import { useStores } from "@/lib/catalog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ShoppingStyle } from "@/models";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — AISLE SPY" }, { name: "description", content: "Manage your AISLE SPY profile." }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, user, saveProfile } = useAuth();
  const [form, setForm] = useState(() => ({
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    country: profile?.country ?? "ZA",
    province: profile?.province ?? "",
    favouriteStores: profile?.favouriteStores ?? [],
    shoppingStyle: (profile?.shoppingStyle ?? "single") as ShoppingStyle,
    monthlyBudget: profile?.monthlyBudget?.toString() ?? "",
    householdSize: profile?.householdSize?.toString() ?? "",
  }));
  const [busy, setBusy] = useState(false);
  const stores = useStores();

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        country: profile.country,
        province: profile.province ?? "",
        favouriteStores: profile.favouriteStores,
        shoppingStyle: profile.shoppingStyle ?? "single",
        monthlyBudget: profile.monthlyBudget?.toString() ?? "",
        householdSize: profile.householdSize?.toString() ?? "",
      });
    }
  }, [profile]);

  const toggleStore = (id: string) =>
    setForm((f) => ({
      ...f,
      favouriteStores: f.favouriteStores.includes(id)
        ? f.favouriteStores.filter((x) => x !== id)
        : [...f.favouriteStores, id],
    }));

  async function onSave() {
    setBusy(true);
    try {
      await saveProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        country: form.country,
        province: form.province || undefined,
        favouriteStores: form.favouriteStores,
        shoppingStyle: form.shoppingStyle,
        monthlyBudget: form.monthlyBudget ? Number(form.monthlyBudget) : undefined,
        householdSize: form.householdSize ? Number(form.householdSize) : undefined,
      });
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not save profile");
    } finally {
      setBusy(false);
    }
  }

  const initials = `${form.firstName[0] ?? ""}${form.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8">
      <h1 className="mb-4 text-[22px] font-bold text-secondary">Profile</h1>

      <Card className="rounded-2xl border-border p-4 shadow-[var(--shadow-card)]">
        <div className="mb-6 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.photoURL ?? user?.photoURL ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">{initials || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-secondary">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Photo uploads coming soon.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="First name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
          <Field label="Last name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />

          <div className="space-y-1.5">
            <Label>Country</Label>
            <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Province</Label>
            <Select value={form.province} onValueChange={(v) => setForm({ ...form, province: v })}>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{SA_PROVINCES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <Field label="Monthly budget (ZAR)" value={form.monthlyBudget} onChange={(v) => setForm({ ...form, monthlyBudget: v.replace(/[^0-9]/g, "") })} />
          <Field label="Household size" value={form.householdSize} onChange={(v) => setForm({ ...form, householdSize: v.replace(/[^0-9]/g, "") })} />
        </div>

        <div className="mt-6">
          <Label className="mb-2 block">Shopping style</Label>
          <div className="grid grid-cols-3 gap-2">
            {(["single", "multiple", "ask"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm({ ...form, shoppingStyle: s })}
                className={cn(
                  "rounded-2xl border px-3 py-3 text-xs font-medium capitalize transition-all",
                  form.shoppingStyle === s ? "border-primary bg-primary/10 text-primary" : "border-border text-secondary hover:border-primary/40",
                )}
              >
                {s === "single" ? "One store" : s === "multiple" ? "Multiple" : "Ask each trip"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <Label className="mb-2 block">Favourite stores</Label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {stores.length === 0 && (
              <p className="col-span-full text-[13px] text-muted-foreground">No stores available yet.</p>
            )}
            {stores.map((s) => {
              const active = form.favouriteStores.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleStore(s.id)}
                  className={cn(
                    "rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all",
                    active ? "border-primary bg-primary/10 text-primary" : "border-border text-secondary hover:border-primary/40",
                  )}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        <Button className="mt-8 h-12 w-full rounded-xl text-base" disabled={busy} onClick={onSave}>
          Save changes
        </Button>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-12 rounded-xl" />
    </div>
  );
}