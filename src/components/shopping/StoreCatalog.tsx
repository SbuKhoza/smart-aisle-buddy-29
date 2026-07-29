import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Minus, Plus, Store } from "lucide-react";
import { PRELOADED_PRODUCTS, type PreloadedProduct } from "@/data/preloaded-products";
import { CATEGORIES, getCategory, type CategoryId } from "@/constants/categories";
import { cn } from "@/lib/utils";

export function StoreCatalog({
  storeName,
  quantitiesByProductId,
  onIncrement,
  onDecrement,
  defaultOpen = true,
}: {
  storeName?: string;
  quantitiesByProductId: Record<string, number>;
  onIncrement: (p: PreloadedProduct) => void;
  onDecrement: (productId: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [expanded, setExpanded] = useState<CategoryId | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<CategoryId, PreloadedProduct[]>();
    for (const p of PRELOADED_PRODUCTS) {
      const arr = map.get(p.category) ?? [];
      arr.push(p);
      map.set(p.category, arr);
    }
    return CATEGORIES.filter((c) => (map.get(c.id) ?? []).length > 0).map((c) => ({
      cat: c,
      products: map.get(c.id) ?? [],
    }));
  }, []);

  return (
    <div className="rounded-3xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Store size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-secondary">
            {storeName ? `${storeName} catalog` : "Browse catalog"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Tap + to add. Tap again to increase quantity.
          </p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown size={18} className="text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="divide-y divide-border">
              {grouped.map(({ cat, products }) => {
                const Icon = cat.icon;
                const isOpen = expanded === cat.id;
                const totalInList = products.reduce(
                  (s, p) => s + (quantitiesByProductId[p.id] ?? 0),
                  0,
                );
                return (
                  <div key={cat.id}>
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : cat.id)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-accent"
                    >
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", cat.color, cat.text)}>
                        <Icon size={14} />
                      </div>
                      <p className="flex-1 text-sm font-medium text-secondary">{cat.label}</p>
                      {totalInList > 0 && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          {totalInList} added
                        </span>
                      )}
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                        <ChevronDown size={16} className="text-muted-foreground" />
                      </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-muted/30"
                        >
                          <div className="grid grid-cols-1 gap-1.5 p-3 sm:grid-cols-2">
                            {products.map((p) => {
                              const qty = quantitiesByProductId[p.id] ?? 0;
                              return (
                                <div
                                  key={p.id}
                                  className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 shadow-sm"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-secondary">{p.name}</p>
                                    <p className="text-[11px] text-muted-foreground">R {p.estimatedPrice}</p>
                                  </div>
                                  {qty > 0 && (
                                    <button
                                      onClick={() => onDecrement(p.id)}
                                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent"
                                      aria-label="Decrease"
                                    >
                                      <Minus size={14} />
                                    </button>
                                  )}
                                  {qty > 0 && (
                                    <span className="min-w-[1.5rem] text-center text-sm font-semibold text-secondary">
                                      {qty}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => onIncrement(p)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:opacity-90"
                                    aria-label="Add"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}