import { useMemo, useRef, useState } from "react";
import { Plus, Search, Sparkles, Star, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PRELOADED_PRODUCTS } from "@/data/preloaded-products";
import type { UserProduct, FavouriteProduct } from "@/models";
import { getCategory } from "@/constants/categories";
import { cn } from "@/lib/utils";

export interface QuickAddItem {
  productId?: string;
  name: string;
  brand?: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
}

export function QuickAddBar({
  userProducts,
  favourites,
  recentNames = [],
  frequentNames = [],
  onAdd,
  onAddFreeText,
  autoFocus,
}: {
  userProducts: UserProduct[];
  favourites: FavouriteProduct[];
  recentNames?: string[];
  frequentNames?: string[];
  onAdd: (item: QuickAddItem) => void | Promise<void>;
  onAddFreeText: (name: string) => void | Promise<void>;
  autoFocus?: boolean;
}) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const all = useMemo<QuickAddItem[]>(() => {
    const usr: QuickAddItem[] = userProducts.map((p) => ({
      productId: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      quantity: p.defaultQuantity,
      unit: p.defaultUnit,
      estimatedPrice: p.estimatedPrice,
    }));
    const pre: QuickAddItem[] = PRELOADED_PRODUCTS.map((p) => ({
      productId: p.id,
      name: p.name,
      category: p.category,
      quantity: p.quantity,
      unit: p.unit,
      estimatedPrice: p.estimatedPrice,
    }));
    return [...usr, ...pre];
  }, [userProducts]);

  const term = q.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!term) return [] as QuickAddItem[];
    return all.filter((a) => a.name.toLowerCase().includes(term)).slice(0, 8);
  }, [term, all]);

  const chips = useMemo(() => {
    if (term) return [] as { label: string; items: QuickAddItem[]; icon: typeof Star }[];
    const favSet = new Set(favourites.map((f) => f.productId));
    const favItems = all.filter((a) => a.productId && favSet.has(a.productId)).slice(0, 6);
    const findByName = (n: string) => all.find((a) => a.name.toLowerCase() === n.toLowerCase());
    const recentItems = recentNames.map(findByName).filter(Boolean).slice(0, 6) as QuickAddItem[];
    const frequentItems = frequentNames.map(findByName).filter(Boolean).slice(0, 8) as QuickAddItem[];
    const suggested = all.slice(0, 8);
    return [
      { label: "Favourites", items: favItems, icon: Star },
      { label: "Frequent", items: frequentItems, icon: Sparkles },
      { label: "Recent", items: recentItems, icon: Clock },
      { label: "Suggested", items: suggested, icon: Sparkles },
    ].filter((g) => g.items.length > 0);
  }, [term, all, favourites, recentNames, frequentNames]);

  async function submitFree() {
    const n = q.trim();
    if (!n) return;
    const exact = matches.find((m) => m.name.toLowerCase() === n.toLowerCase());
    if (exact) {
      await onAdd(exact);
    } else {
      await onAddFreeText(n);
    }
    setQ("");
    inputRef.current?.focus();
  }

  async function pick(item: QuickAddItem) {
    await onAdd(item);
    setQ("");
    inputRef.current?.focus();
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitFree()}
          placeholder="Add anything — milk, bread, avocados…"
          className="h-12 rounded-2xl pl-10 pr-24 text-base"
          autoFocus={autoFocus}
          inputMode="text"
        />
        <Button
          onClick={submitFree}
          disabled={!q.trim()}
          size="sm"
          className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-xl px-3"
        >
          <Plus size={16} /> Add
        </Button>
      </div>

      <AnimatePresence initial={false} mode="wait">
        {term ? (
          <motion.div
            key="matches"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            {matches.length === 0 ? (
              <button
                type="button"
                onClick={submitFree}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-primary hover:bg-primary/5"
              >
                <Plus size={16} /> Add “{q.trim()}” to list
              </button>
            ) : (
              matches.map((m) => {
                const cat = getCategory(m.category);
                const Icon = cat.icon;
                return (
                  <button
                    key={m.productId ?? m.name}
                    type="button"
                    onClick={() => pick(m)}
                    className="flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-left last:border-b-0 hover:bg-accent"
                  >
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", cat.color, cat.text)}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-secondary">{m.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {cat.label} · {m.quantity} {m.unit}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-primary">R {m.estimatedPrice}</p>
                    <Plus size={16} className="text-muted-foreground" />
                  </button>
                );
              })
            )}
          </motion.div>
        ) : (
          <motion.div
            key="chips"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {chips.map((g) => {
              const Icon = g.icon;
              return (
                <div key={g.label}>
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                    <Icon size={11} /> {g.label}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {g.items.map((it) => (
                      <motion.button
                        key={(it.productId ?? it.name) + g.label}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => pick(it)}
                        className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-secondary transition hover:border-primary/40 hover:bg-primary/5"
                      >
                        <span>{it.name}</span>
                        <span className="text-[10px] text-muted-foreground group-hover:text-primary">
                          R{it.estimatedPrice}
                        </span>
                        <Plus size={12} className="text-muted-foreground group-hover:text-primary" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}