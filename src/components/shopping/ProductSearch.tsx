import { useMemo, useState } from "react";
import { Search, Plus, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PRELOADED_PRODUCTS, type PreloadedProduct } from "@/data/preloaded-products";
import type { UserProduct, FavouriteProduct } from "@/models";
import { getCategory } from "@/constants/categories";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SearchResult {
  productId: string; name: string; brand?: string; category: string; unit: string; quantity: number; estimatedPrice: number;
  source: "preloaded" | "user" | "favourite";
}

export function ProductSearch({
  userProducts, favourites, recentNames = [], onPick, onCreateCustom, favouriteIds,
}: {
  userProducts: UserProduct[]; favourites: FavouriteProduct[]; recentNames?: string[]; favouriteIds?: Set<string>;
  onPick: (r: SearchResult) => void; onCreateCustom: (name: string) => void;
}) {
  const [q, setQ] = useState("");
  const all = useMemo<SearchResult[]>(() => {
    const pre: SearchResult[] = PRELOADED_PRODUCTS.map((p: PreloadedProduct) => ({
      productId: p.id, name: p.name, category: p.category, unit: p.unit, quantity: p.quantity,
      estimatedPrice: p.estimatedPrice, source: "preloaded" as const,
    }));
    const usr: SearchResult[] = userProducts.map((p) => ({
      productId: p.id, name: p.name, brand: p.brand, category: p.category, unit: p.defaultUnit,
      quantity: p.defaultQuantity, estimatedPrice: p.estimatedPrice, source: "user" as const,
    }));
    return [...usr, ...pre];
  }, [userProducts]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) {
      const favSet = new Set(favourites.map((f) => f.productId));
      const favs = all.filter((a) => favSet.has(a.productId)).slice(0, 6);
      const recents = recentNames
        .map((n) => all.find((a) => a.name.toLowerCase() === n.toLowerCase()))
        .filter(Boolean) as SearchResult[];
      const merged = [...favs, ...recents.filter((r) => !favSet.has(r.productId))];
      const uniq = new Map<string, SearchResult>();
      merged.forEach((r) => uniq.set(r.productId, r));
      return Array.from(uniq.values()).slice(0, 8);
    }
    return all.filter((a) => a.name.toLowerCase().includes(term)).slice(0, 20);
  }, [q, all, favourites, recentNames]);

  const showCreate = q.trim().length > 1 && !filtered.some((r) => r.name.toLowerCase() === q.trim().toLowerCase());

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products (e.g. milk, bread)…" className="pl-9" />
      </div>
      <div className="max-h-80 overflow-y-auto rounded-2xl border border-border bg-card">
        {filtered.length === 0 && !showCreate ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">Start typing to find a product.</div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((r) => {
              const cat = getCategory(r.category);
              const Icon = cat.icon;
              const isFav = favouriteIds?.has(r.productId);
              return (
                <motion.button key={r.productId} layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  onClick={() => onPick(r)}
                  className="flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-left last:border-b-0 hover:bg-accent">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", cat.color, cat.text)}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-secondary">{r.name}</p>
                      {isFav && <Star size={12} className="fill-amber-400 text-amber-400" />}
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {cat.label} · {r.quantity} {r.unit}{r.source === "user" ? " · custom" : ""}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-primary">R {r.estimatedPrice}</p>
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
        {showCreate && (
          <Button variant="ghost"
            className="flex w-full items-center justify-start gap-2 rounded-none border-t border-border px-3 py-3 text-primary hover:bg-primary/5"
            onClick={() => onCreateCustom(q.trim())}>
            <Plus size={16} /> Create custom product “{q.trim()}”
          </Button>
        )}
      </div>
    </div>
  );
}