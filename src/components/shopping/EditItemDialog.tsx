import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, UNITS } from "@/constants/categories";
import type { ShoppingItem } from "@/models";
import { toast } from "sonner";

export function EditItemDialog({
  item, open, onOpenChange, onSave,
}: { item: ShoppingItem | null; open: boolean; onOpenChange: (v: boolean) => void; onSave: (patch: Partial<ShoppingItem>) => Promise<void> }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("other");
  const [unit, setUnit] = useState("pcs");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("0");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!item) return;
    setName(item.name);
    setCategory(item.category || "other");
    setUnit(item.unit || "pcs");
    setQuantity(String(item.quantity ?? 1));
    setPrice(String(item.estimatedPrice ?? 0));
    setNotes(item.notes || "");
  }, [item]);

  async function save() {
    if (!item) return;
    const q = Number(quantity); const p = Number(price);
    if (!name.trim()) return toast.error("Name required");
    if (!(q > 0)) return toast.error("Quantity must be > 0");
    if (p < 0 || Number.isNaN(p)) return toast.error("Price must be ≥ 0");
    setBusy(true);
    try {
      await onSave({ name: name.trim(), category, unit, quantity: q, estimatedPrice: p, notes: notes.trim() || undefined });
      onOpenChange(false);
    } finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit item</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => (<SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{UNITS.map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Quantity</Label><Input type="number" min="0" step="0.1" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Estimated price (R)</Label><Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          </div>
          <div className="space-y-1.5"><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}