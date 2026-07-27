import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, UNITS } from "@/constants/categories";
import { toast } from "sonner";

export interface CustomProductValue {
  name: string; category: string; unit: string; quantity: number; estimatedPrice: number; brand?: string; savePersonal?: boolean;
}

export function CustomProductDialog({
  open, onOpenChange, initialName = "", onSubmit,
}: { open: boolean; onOpenChange: (v: boolean) => void; initialName?: string; onSubmit: (v: CustomProductValue) => Promise<void> | void }) {
  const [name, setName] = useState(initialName);
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("other");
  const [unit, setUnit] = useState("pcs");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [savePersonal, setSavePersonal] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (open) setName(initialName); }, [open, initialName]);

  async function submit() {
    const q = Number(quantity); const p = Number(price);
    if (!name.trim()) return toast.error("Name is required");
    if (!(q > 0)) return toast.error("Quantity must be greater than 0");
    if (p < 0 || Number.isNaN(p)) return toast.error("Price must be 0 or more");
    setBusy(true);
    try {
      await onSubmit({ name: name.trim(), brand: brand.trim() || undefined, category, unit, quantity: q, estimatedPrice: p || 0, savePersonal });
      onOpenChange(false);
      setName(""); setBrand(""); setPrice(""); setQuantity("1");
    } finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Create custom product</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} autoFocus maxLength={80} /></div>
          <div className="space-y-1.5"><Label>Brand (optional)</Label><Input value={brand} onChange={(e) => setBrand(e.target.value)} maxLength={40} /></div>
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
            <div className="space-y-1.5"><Label>Quantity</Label><Input type="number" inputMode="decimal" min="0" step="0.1" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Estimated price (R)</Label><Input type="number" inputMode="decimal" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={savePersonal} onChange={(e) => setSavePersonal(e.target.checked)} className="h-4 w-4" />
            Save to my personal products
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !name.trim()}>{busy ? "Adding…" : "Add to list"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}