import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Pencil, Minus, Plus, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
        "flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-1.5 active:bg-accent/40",
        item.purchased && "border-primary/30 bg-primary/5",
      )}
    >
      <Checkbox checked={!!item.purchased} onCheckedChange={(v) => onToggle(!!v)} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p
            className={cn(
              "truncate text-[15px] font-medium leading-tight text-secondary",
              item.purchased && "text-muted-foreground line-through",
            )}
          >
            {item.name}
          </p>
          {qty > 1 && (
            <span className="shrink-0 rounded-md bg-accent px-1.5 py-[1px] text-[10px] font-bold text-secondary">
              ×{qty}
            </span>
          )}
        </div>
        <p className="text-[11px] leading-tight text-muted-foreground">
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
  placeholder="Price"
  className="h-8 w-25 shrink-0 rounded-none border-x-0 border-t-0 border-b-2 border-border bg-transparent px-1 text-sm focus-visible:border-primary focus-visible:ring-0"

        />
      ) : (
        <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-border">
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="More options"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
          >
            <MoreVertical size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil size={14} className="mr-2" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 size={14} className="mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}