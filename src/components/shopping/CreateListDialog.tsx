import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Pencil, Store, Layers, ChevronRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DEFAULT_STORES } from "@/constants/regions";

export type CreateListMode = "custom" | "store" | "combination";

export interface CreateListInput {
  name: string;
  mode: CreateListMode;
  storeId?: string;
  storeName?: string;
  storeIds?: string[];
  storeNames?: string[];
}

const MODE_OPTIONS: Array<{
  id: CreateListMode;
  title: string;
  body: string;
  icon: typeof Pencil;
  accent: string;
}> = [
  {
    id: "custom",
    title: "Custom list",
    body: "Start blank. Add anything, fast.",
    icon: Pencil,
    accent: "from-primary/15 to-primary/5 text-primary",
  },
  {
    id: "store",
    title: "Shop a store",
    body: "Browse the catalog for one store.",
    icon: Store,
    accent: "from-amber-500/15 to-amber-500/5 text-amber-600",
  },
  {
    id: "combination",
    title: "Combination",
    body: "Multiple stores in one trip.",
    icon: Layers,
    accent: "from-sky-500/15 to-sky-500/5 text-sky-600",
  },
];

export function CreateListDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (input: CreateListInput) => Promise<void> | void;
}) {
  const [step, setStep] = useState<"mode" | "details">("mode");
  const [mode, setMode] = useState<CreateListMode>("custom");
  const [name, setName] = useState("");
  const [storeIds, setStoreIds] = useState<string[]>([DEFAULT_STORES[0].id]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setStep("mode");
      setMode("custom");
      setName("");
      setStoreIds([DEFAULT_STORES[0].id]);
    }
  }, [open]);

  function pickMode(m: CreateListMode) {
    setMode(m);
    if (!name.trim()) {
      setName(
        m === "custom"
          ? "Quick list"
          : m === "store"
            ? `${DEFAULT_STORES.find((s) => s.id === storeIds[0])?.name ?? "Store"} run`
            : "Weekly shop",
      );
    }
    setStep("details");
  }

  function toggleStore(id: string) {
    if (mode === "combination") {
      setStoreIds((prev) => {
        if (prev.includes(id)) {
          // keep at least one store selected
          if (prev.length === 1) return prev;
          return prev.filter((s) => s !== id);
        }
        return [...prev, id];
      });
    } else {
      setStoreIds([id]);
    }
  }

  async function submit() {
    const n = name.trim();
    if (!n) return toast.error("Please enter a name");
    if (n.length > 60) return toast.error("Name is too long");
    setBusy(true);
    try {
      const selected = DEFAULT_STORES.filter((s) => storeIds.includes(s.id));
      if (mode === "combination") {
        await onCreate({
          name: n,
          mode,
          storeIds,
          storeNames: selected.map((s) => s.name),
        });
      } else {
        await onCreate({
          name: n,
          mode,
          storeId: mode === "custom" ? undefined : storeIds[0],
          storeName: mode === "custom" ? undefined : selected[0]?.name,
        });
      }
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === "mode" ? (
          <>
            <DialogHeader>
              <DialogTitle>New shopping list</DialogTitle>
              <DialogDescription>Pick how you want to shop today.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2.5">
              {MODE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <motion.button
                    key={opt.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => pickMode(opt.id)}
                    className={cn(
                      "group flex items-center gap-4 rounded-2xl border border-border bg-gradient-to-br p-4 text-left transition hover:border-primary/40",
                      opt.accent,
                    )}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/70 shadow-sm">
                      <Icon size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-secondary">{opt.title}</p>
                      <p className="text-xs text-muted-foreground">{opt.body}</p>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground transition group-hover:translate-x-0.5" />
                  </motion.button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep("mode")}
                  className="rounded-full p-1 text-muted-foreground hover:bg-accent"
                  aria-label="Back"
                >
                  <ArrowLeft size={16} />
                </button>
                <DialogTitle className="text-lg">
                  {mode === "custom" ? "Custom list" : mode === "store" ? "Shop a store" : "Combination"}
                </DialogTitle>
              </div>
              <DialogDescription>Name your list to get started — you can change it later.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="list-name">List name</Label>
                <Input
                  id="list-name"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Monthly Groceries"
                  maxLength={60}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />
              </div>
              {mode !== "custom" && (
                <div className="space-y-1.5">
                  <Label>{mode === "combination" ? "Stores" : "Store"}</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {DEFAULT_STORES.map((s) => {
                      const selected = storeIds.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleStore(s.id)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition",
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-muted text-muted-foreground hover:bg-accent",
                          )}
                        >
                          {selected && mode === "combination" && <Check size={11} />}
                          {s.name}
                        </button>
                      );
                    })}
                  </div>
                  {mode === "combination" && (
                    <p className="text-[11px] text-muted-foreground">
                      Tap to select the stores you'll visit — pick as many as you need.
                    </p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={busy || !name.trim()}>
                {busy ? "Creating…" : "Create list"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}