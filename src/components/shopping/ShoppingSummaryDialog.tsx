import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Wallet, TrendingDown, TrendingUp } from "lucide-react";

export interface SummaryData {
  name: string; estimatedTotal: number; actualTotal: number; budget?: number | null; itemCount: number; purchasedCount: number;
}

export function ShoppingSummaryDialog({
  open, onOpenChange, data, onSave, busy,
}: { open: boolean; onOpenChange: (v: boolean) => void; data: SummaryData | null; onSave: () => void; busy?: boolean }) {
  if (!data) return null;
  const diff = data.actualTotal - data.estimatedTotal;
  const overBudget = data.budget != null && data.actualTotal > data.budget;
  const remaining = data.budget != null ? data.budget - data.actualTotal : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles size={26} />
          </div>
          <DialogTitle className="text-center">Shopping summary</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-center text-sm text-muted-foreground">{data.name}</p>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Estimated" value={data.estimatedTotal} />
            <Stat label="Actual" value={data.actualTotal} highlight />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-border p-3">
            <span className="text-sm text-muted-foreground">Difference</span>
            <span className={"flex items-center gap-1 text-sm font-semibold " + (diff > 0 ? "text-red-600" : "text-emerald-600")}>
              {diff > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              R {Math.round(Math.abs(diff)).toLocaleString()}
            </span>
          </div>
          {data.budget != null && (
            <div className={"flex items-center justify-between rounded-2xl border p-3 " + (overBudget ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50")}>
              <span className="flex items-center gap-2 text-sm"><Wallet size={14} /> Budget R {data.budget.toLocaleString()}</span>
              <span className={"text-sm font-semibold " + (overBudget ? "text-red-700" : "text-emerald-700")}>
                {overBudget ? `R ${Math.round(Math.abs(remaining!)).toLocaleString()} over` : `R ${Math.round(remaining!).toLocaleString()} left`}
              </span>
            </div>
          )}
          <p className="text-center text-xs text-muted-foreground">
            {data.purchasedCount} of {data.itemCount} items purchased · {new Date().toLocaleDateString()}
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Keep shopping</Button>
          <Button onClick={onSave} disabled={busy}>{busy ? "Saving…" : "Save shopping trip"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={"rounded-2xl border border-border p-3 " + (highlight ? "bg-primary/5" : "")}>
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={"mt-1 text-xl font-bold " + (highlight ? "text-primary" : "text-secondary")}>
        R {Math.round(value).toLocaleString()}
      </p>
    </div>
  );
}