import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/firebase-auth";
import { FullScreenLoader } from "@/components/FullScreenLoader";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES, DEFAULT_STORES, SA_PROVINCES } from "@/constants/regions";
import { locationService } from "@/lib/services";
import { cn } from "@/lib/utils";
import type { ShoppingStyle } from "@/models";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up AISLE SPY" },
      { name: "description", content: "Personalise AISLE SPY to your shopping habits." },
    ],
  }),
  component: OnboardingPage,
});

const TOTAL_STEPS = 9;

function OnboardingPage() {
  const { ready, user, profile, saveProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState("ZA");
  const [province, setProvince] = useState<string | undefined>();
  const [locationGranted, setLocationGranted] = useState(false);
  const [favouriteStores, setFavouriteStores] = useState<string[]>([]);
  const [shoppingStyle, setShoppingStyle] = useState<ShoppingStyle | undefined>();
  const [budget, setBudget] = useState<string>("");
  const [household, setHousehold] = useState<string>("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/auth/login", replace: true });
    else if (profile?.onboardingComplete) navigate({ to: "/dashboard", replace: true });
  }, [ready, user, profile, navigate]);

  if (!ready || !user) return <FullScreenLoader />;

  const next = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const toggleStore = (id: string) =>
    setFavouriteStores((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const requestLocation = async () => {
    const pos = await locationService.requestPermission();
    setLocationGranted(!!pos);
    if (pos) toast.success("Location enabled"); else toast.info("You can enable location later");
    next();
  };

  const finish = async () => {
    setBusy(true);
    try {
      await saveProfile({
        country,
        province,
        favouriteStores,
        shoppingStyle,
        monthlyBudget: budget ? Number(budget) : undefined,
        householdSize: household ? Number(household) : undefined,
        onboardingComplete: true,
      });
      toast.success("You're all set!");
      navigate({ to: "/dashboard", replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not save your setup");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent px-4 py-8">
      <div className="mx-auto flex w-full max-w-lg flex-col">
        <header className="mb-6 flex items-center justify-between">
          <BrandLogo size={32} />
          <span className="text-xs font-medium text-muted-foreground">Step {step} of {TOTAL_STEPS}</span>
        </header>

        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-accent">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
          >
            {step === 1 && (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>🛒</div>
                <h2 className="text-2xl font-bold text-secondary">Welcome to AISLE SPY</h2>
                <p className="mt-2 text-muted-foreground">Smart Shopping starts here.</p>
                <Button className="mt-8 h-12 w-full rounded-xl text-base" onClick={next}>Continue</Button>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><MapPin /></div>
                <h2 className="text-xl font-bold text-secondary">Enable location</h2>
                <p className="mt-2 text-sm text-muted-foreground">We use your location to show nearby stores, catalogues, and price drops. You can change this anytime.</p>
                <div className="mt-8 space-y-2">
                  <Button className="h-12 w-full rounded-xl" onClick={requestLocation}>Allow</Button>
                  <Button variant="outline" className="h-12 w-full rounded-xl" onClick={next}>Not now</Button>
                </div>
                {locationGranted && <p className="mt-3 text-xs text-primary">Location enabled ✓</p>}
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold text-secondary">Your country</h2>
                <p className="mt-1 text-sm text-muted-foreground">More countries coming soon.</p>
                <div className="mt-6 space-y-1.5">
                  <Label>Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-xl font-bold text-secondary">Your province</h2>
                <p className="mt-1 text-sm text-muted-foreground">Helps us tailor stores and catalogues.</p>
                <div className="mt-6 space-y-1.5">
                  <Label>Province</Label>
                  <Select value={province} onValueChange={setProvince}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select province" /></SelectTrigger>
                    <SelectContent>
                      {SA_PROVINCES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-xl font-bold text-secondary">Favourite stores</h2>
                <p className="mt-1 text-sm text-muted-foreground">Pick the shops you visit most often.</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {DEFAULT_STORES.map((s) => {
                    const active = favouriteStores.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleStore(s.id)}
                        className={cn(
                          "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-all",
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-secondary hover:border-primary/40",
                        )}
                      >
                        {s.name}
                        {active && <Check size={16} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 6 && (
              <div>
                <h2 className="text-xl font-bold text-secondary">How do you usually shop?</h2>
                <div className="mt-5 space-y-2">
                  {[
                    { id: "single" as const, label: "One supermarket", desc: "I stick with a favourite store." },
                    { id: "multiple" as const, label: "Multiple supermarkets", desc: "I split my shop across stores." },
                    { id: "ask" as const, label: "Ask every trip", desc: "It depends on the day." },
                  ].map((o) => {
                    const active = shoppingStyle === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setShoppingStyle(o.id)}
                        className={cn(
                          "flex w-full flex-col items-start rounded-2xl border px-4 py-3 text-left transition-all",
                          active ? "border-primary bg-primary/10" : "border-border hover:border-primary/40",
                        )}
                      >
                        <span className="text-sm font-semibold text-secondary">{o.label}</span>
                        <span className="text-xs text-muted-foreground">{o.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 7 && (
              <div>
                <h2 className="text-xl font-bold text-secondary">Monthly grocery budget</h2>
                <p className="mt-1 text-sm text-muted-foreground">Optional — skip if you'd rather not say.</p>
                <div className="mt-5 space-y-1.5">
                  <Label htmlFor="budget">Budget (ZAR)</Label>
                  <Input id="budget" inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value.replace(/[^0-9]/g, ""))} className="h-12 rounded-xl" />
                </div>
              </div>
            )}

            {step === 8 && (
              <div>
                <h2 className="text-xl font-bold text-secondary">Household size</h2>
                <p className="mt-1 text-sm text-muted-foreground">Optional. Helps size recommendations.</p>
                <div className="mt-5 space-y-1.5">
                  <Label htmlFor="household">People in household</Label>
                  <Input id="household" inputMode="numeric" value={household} onChange={(e) => setHousehold(e.target.value.replace(/[^0-9]/g, ""))} className="h-12 rounded-xl" />
                </div>
              </div>
            )}

            {step === 9 && (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                  <Check size={28} />
                </div>
                <h2 className="text-2xl font-bold text-secondary">You're all set</h2>
                <p className="mt-2 text-sm text-muted-foreground">We've saved your preferences. Ready to shop smarter?</p>
                <Button className="mt-8 h-12 w-full rounded-xl text-base" disabled={busy} onClick={finish}>
                  Enter AISLE SPY
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {step > 1 && step < 9 && (
          <div className="mt-4 flex gap-2">
            <Button variant="outline" className="h-12 flex-1 rounded-xl" onClick={back}>
              <ArrowLeft size={16} className="mr-1" /> Back
            </Button>
            <Button className="h-12 flex-1 rounded-xl" onClick={next}>
              {step === 7 || step === 8 ? "Skip" : "Continue"} <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}