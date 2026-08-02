import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnimatedTotal } from "./AnimatedTotal";
import { budgetStatus } from "@/lib/services/shopping";
import { AlertTriangle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export function BudgetCard({
  budget,
  estimated,
  actual,
  variant = "estimated",
  label,
}: {
  budget: number | null | undefined;
  estimated: number;
  actual?: number;
  variant?: "estimated" | "actual";
  label?: string;
}) {
  const spend = variant === "actual" ? (actual ?? 0) : estimated;
  const status = budgetStatus(spend, budget);
  const pct = budget && budget > 0 ? Math.min(100, (spend / budget) * 100) : 0;
  const barColor =
    status === "over"
      ? "[&>div]:bg-destructive"
      : status === "warn"
        ? "[&>div]:bg-orange-500"
        : "[&>div]:bg-primary";
  const remaining = (budget ?? 0) - spend;

  return (
    <Card className="rounded-3xl border-border p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Wallet size={18} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {label ?? (variant === "actual" ? "Actual spend" : "Estimated spend")}
            </p>
            <AnimatedTotal value={spend} className="text-2xl font-bold text-secondary" />
          </div>
        </div>
        {status === "over" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
            <AlertTriangle size={12} /> Over budget
          </span>
        )}
      </div>
      {budget && budget > 0 ? (
        <div className="mt-4">
          <Progress value={pct} className={cn("h-2 rounded-full", barColor)} />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Budget R {budget.toLocaleString()}</span>
            <span
              className={cn(
                "font-semibold",
                status === "over" ? "text-destructive" : status === "warn" ? "text-orange-500" : "text-primary",
              )}
            >
              {remaining >= 0
                ? `R ${Math.round(remaining).toLocaleString()} left`
                : `R ${Math.round(Math.abs(remaining)).toLocaleString()} over`}
            </span>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">Set a budget on this list to see progress.</p>
      )}
    </Card>
  );
}