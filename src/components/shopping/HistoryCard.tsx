import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Package } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ShoppingHistoryEntry } from "@/models";
import { motion } from "framer-motion";

function fmt(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function HistoryCard({ trip, index = 0 }: { trip: ShoppingHistoryEntry; index?: number }) {
  const overBudget = trip.budget && trip.actualTotal && trip.actualTotal > trip.budget;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
      <Link to="/history/$tripId" params={{ tripId: trip.id }}>
        <Card className="rounded-3xl border-border p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-secondary line-clamp-1">{trip.name ?? "Shopping trip"}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{fmt(trip.completedAt)}</p>
              </div>
            </div>
            {overBudget ? (
              <Badge variant="secondary" className="bg-red-100 text-red-700">Over budget</Badge>
            ) : (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Completed</Badge>
            )}
          </div>
          <div className="mt-4 flex items-end justify-between">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Package size={12} /> {trip.purchasedCount ?? 0}/{trip.itemCount ?? 0} items
            </p>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-semibold text-primary">
                R {Math.round(trip.actualTotal ?? trip.total ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}