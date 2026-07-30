import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Pencil, Minus, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { ShoppingItem } from "@/models";
import { cn } from "@/lib/utils";

export function ListRow({
  item,
  shopping,
  onToggle,
  onDelete,
  onEdit,
  onQuantityChange,
  onActualPriceChange,
}: {
  item: ShoppingItem;
  shopping: boolean;
  onToggle: (v: boolean) => void;
  onDelete: () => void;
  onEdit: () => void;
  onQuantityChange: (q: number) => void;
  onActualPriceChange: (v: number | null) => void;
}) {
  const qty = Number(item.quantity) || 1;
  const est = item.estimatedPrice == null ? null : Number(item.estimatedPrice);
  const [draft, setDraft] = useState(item.actualPrice == null ? "" : String(item.actualPrice));

  useEffect(() => {
    setDraft(item.actualPrice == null ? "" : String(item.actualPrice));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.actualPrice]);

  function handlePrice(v: string) {
    setDraft(v);
    const n = v.trim() === "" ? null : Number(v);
    onActualPriceChange(n !== null && Number.isFinite(n) ? n : null);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2.5",
        item.purchased && "border-primary/30 bg-primary/5",
      )}
    >
      <Checkbox checked={!!item.purchased} onCheckedChange={(v) => onToggle(!!v)} />

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-semibold text-secondary",
            item.purchased && "text-muted-foreground line-through",
          )}
        >
          {item.name}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Est {est == null ? "—" : `R ${est}`} · Actual{" "}
          {item.actualPrice == null ? "—" : `R ${item.actualPrice}`}
        </p>
      </div>

      {shopping ? (
        <Input
          data-price-input
          value={draft}
          onChange={(e) => handlePrice(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            const nodes = Array.from(document.querySelectorAll<HTMLInputElement>("[data-price-input]"));
            const next = nodes[nodes.indexOf(e.currentTarget) + 1];
            if (next) next.focus();
            else e.currentTarget.blur();
          }}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          enterKeyHint="next"
          placeholder="Actual"
          className="h-9 w-24 rounded-xl text-sm"
        />
      ) : (
        <div className="flex items-center gap-0.5 rounded-full border border-border">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => onQuantityChange(Math.max(1, qty - 1))}
            className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-secondary"
          >
            <Minus size={12} />
          </button>
          <span className="min-w-[1.1rem] text-center text-xs font-semibold text-secondary">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => onQuantityChange(qty + 1)}
            className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-secondary"
          >
            <Plus size={12} />
          </button>
        </div>
      )}

      <button
        type="button"
        aria-label="Edit item"
        onClick={onEdit}
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
      >
        <Pencil size={14} />
      </button>
      <button
        type="button"
        aria-label="Delete item"
        onClick={onDelete}
        className="flex h-8 w-8 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}
