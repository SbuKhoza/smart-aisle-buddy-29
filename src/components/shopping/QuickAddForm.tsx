import { useMemo, useRef, useState } from "react";
import { Plus, CornerDownLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PRELOADED_PRODUCTS } from "@/data/preloaded-products";
import type { UserProduct } from "@/models";

export interface QuickAddPayload {
  name: string;
  estimatedPrice: number | null;
  productId?: string;
  category?: string;
  unit?: string;
}

interface Suggestion {
  id: string;
  name: string;
  category: string;
  unit: string;
  estimatedPrice: number;
}

export function QuickAddForm({
  userProducts = [],
  onAdd,
  autoFocus,
}: {
  userProducts?: UserProduct[];
  onAdd: (payload: QuickAddPayload) => void | Promise<void>;
  autoFocus?: boolean;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  const catalog = useMemo<Suggestion[]>(
    () => [
      ...userProducts.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        unit: p.defaultUnit,
        estimatedPrice: p.estimatedPrice,
      })),
      ...PRELOADED_PRODUCTS.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category as string,
        unit: p.unit,
        estimatedPrice: p.estimatedPrice,
      })),
    ],
    [userProducts],
  );

  const term = name.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (term.length < 2) return [] as Suggestion[];
    return catalog.filter((c) => c.name.toLowerCase().includes(term)).slice(0, 6);
  }, [term, catalog]);

  function reset() {
    setName("");
    setPrice("");
    // keep the keyboard open on mobile
    nameRef.current?.focus();
  }

  async function submit() {
    const n = name.trim();
    if (!n) return;
    const p = price.trim();
    const parsed = p === "" ? null : Number(p);
    reset();
    await onAdd({ name: n, estimatedPrice: parsed !== null && Number.isFinite(parsed) ? parsed : null });
  }

  async function pick(s: Suggestion) {
    reset();
    await onAdd({
      name: s.name,
      estimatedPrice: s.estimatedPrice,
      productId: s.id,
      category: s.category,
      unit: s.unit,
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Product name
          </label>
          <Input
            ref={nameRef}
            value={name}
            autoFocus={autoFocus}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Milk"
            enterKeyHint="done"
            className="h-12 rounded-2xl text-base"
          />
        </div>
        <div className="w-28 shrink-0">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Est. price
          </label>
          <Input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            enterKeyHint="done"
            placeholder="optional"
            className="h-12 rounded-2xl text-base"
          />
        </div>
      </div>

      <Button onClick={submit} disabled={!name.trim()} className="h-11 w-full rounded-2xl text-sm font-semibold">
        <Plus size={16} /> Add to list
      </Button>

      <AnimatePresence initial={false}>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            <p className="border-b border-border px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Suggestions · optional
            </p>
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(s)}
                className="flex w-full items-center gap-3 border-b border-border px-3 py-2 text-left last:border-b-0 hover:bg-accent"
              >
                <span className="min-w-0 flex-1 truncate text-sm text-secondary">{s.name}</span>
                <span className="text-xs font-semibold text-primary">R {s.estimatedPrice}</span>
                <CornerDownLeft size={13} className="text-muted-foreground" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
