import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const EXAMPLES = ["Monthly Groceries", "Weekend Braai", "Baby Supplies", "Party", "Holiday Shopping"];

export function CreateListDialog({
  open, onOpenChange, onCreate,
}: { open: boolean; onOpenChange: (v: boolean) => void; onCreate: (name: string) => Promise<void> | void }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() {
    const n = name.trim();
    if (!n) return toast.error("Please enter a name");
    if (n.length > 60) return toast.error("Name is too long");
    setBusy(true);
    try { await onCreate(n); setName(""); onOpenChange(false); } finally { setBusy(false); }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create shopping list</DialogTitle>
          <DialogDescription>Give your list a memorable name.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="list-name">List name</Label>
            <Input id="list-name" autoFocus value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Monthly Groceries" maxLength={60}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />
          </div>
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Examples</p>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((e) => (
                <button key={e} type="button" onClick={() => setName(e)}
                  className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground">{e}</button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !name.trim()}>{busy ? "Creating…" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}