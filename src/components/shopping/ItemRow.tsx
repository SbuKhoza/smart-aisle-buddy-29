import { motion } from "framer-motion";
import { Trash2, Pencil, Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategoryChip } from "./CategoryChip";
import type { ShoppingItem } from "@/models";
import { cn } from "@/lib/utils";

export function ItemRow({
  item, mode, isFavourite, onToggle, onDelete, onEdit, onFavourite, onActualPriceChange,
}: {
  item: ShoppingItem; mode: "plan" | "shop"; isFavourite?: boolean;
  onToggle: () => void; onDelete: () => void; onEdit?: () => void; onFavourite?: () => void;
  onActualPriceChange?: (v: number | null) => void;
}) {
  const subtotal = (Number(item.estimatedPrice) || 0) * (Number(item.quantity) || 0);
  const actualSubtotal = (Number(item.actualPrice ?? item.estimatedPrice) || 0) * (Number(item.quantity) || 0);

  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
      className={cn("flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm transition-colors",
        item.purchased && "bg-emerald-50/60")}>
      <Checkbox checked={item.purchased} onCheckedChange={onToggle} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("truncate text-sm font-semibold text-secondary", item.purchased && "text-muted-foreground line-through")}>
            {item.name}
          </p>
          <CategoryChip categoryId={item.category} />
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {item.quantity} {item.unit || "pcs"} · R {item.estimatedPrice ?? 0} each
          {item.notes ? ` · ${item.notes}` : ""}
        </p>
        {mode === "shop" && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Actual R</span>
            <Input type="number" min="0" step="0.01" inputMode="decimal"
              value={item.actualPrice ?? ""} placeholder={String(item.estimatedPrice ?? 0)}
              onChange={(e) => { const v = e.target.value; onActualPriceChange?.(v === "" ? null : Number(v)); }}
              className="h-7 w-24 text-sm" />
            <span className="ml-auto text-xs text-muted-foreground">= R {Math.round(actualSubtotal).toLocaleString()}</span>
          </div>
        )}
      </div>
      {mode === "plan" ? (
        <div className="flex items-center gap-1">
          <p className="mr-1 text-sm font-semibold text-primary">R {Math.round(subtotal).toLocaleString()}</p>
          {onFavourite && (
            <Button variant="ghost" size="icon" onClick={onFavourite} className="h-8 w-8">
              <Star size={16} className={cn(isFavourite ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
            </Button>
          )}
          {onEdit && (<Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8"><Pencil size={16} /></Button>)}
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-destructive"><Trash2 size={16} /></Button>
        </div>
      ) : (
        <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-destructive"><Trash2 size={16} /></Button>
      )}
    </motion.div>
  );
}