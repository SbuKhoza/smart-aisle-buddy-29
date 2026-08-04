import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/firebase-auth";
import { historyService } from "@/lib/services/shopping";
import type { ShoppingHistoryEntry } from "@/models";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CategoryChip } from "@/components/shopping/CategoryChip";
import { ConfirmDialog } from "@/components/shopping/ConfirmDialog";

export const Route = createFileRoute("/_authenticated/history/$tripId")({
  head: () => ({ meta: [{ title: "Shopping Trip — AISLE SPY" }, { name: "description", content: "Details of a completed shopping trip." }] }),
  component: TripPage,
});

function TripPage() {
  const { tripId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<ShoppingHistoryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    historyService.get(tripId).then((t) => { setTrip(t); setLoading(false); });
  }, [tripId]);

  async function shopAgain() {
    if (!user || !trip) return;
    const id = await historyService.duplicateToList(user.uid, trip.id);
    toast.success("New list created");
    navigate({ to: "/shopping-lists/$listId", params: { listId: id } });
  }

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">Loading…</div>;
  if (!trip) return <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">Trip not found.</div>;

  const overBudget = trip.budget != null && (trip.actualTotal ?? 0) > trip.budget;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-4 flex items-center gap-2">
        <Link to="/history" className="rounded-full p-2 hover:bg-accent"><ArrowLeft size={18} /></Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold text-secondary md:text-3xl">{trip.name ?? "Shopping trip"}</h1>
          <p className="text-xs text-muted-foreground">{new Date(trip.completedAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Card className="rounded-3xl border-border p-4">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Estimated</p>
          <p className="mt-1 text-xl font-bold text-secondary">R {Math.round(trip.estimatedTotal ?? 0).toLocaleString()}</p>
        </Card>
        <Card className="rounded-3xl border-border p-4">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Actual</p>
          <p className={"mt-1 text-xl font-bold " + (overBudget ? "text-red-600" : "text-primary")}>
            R {Math.round(trip.actualTotal ?? trip.total ?? 0).toLocaleString()}
          </p>
        </Card>
        {trip.budget != null && (
          <Card className="col-span-2 rounded-3xl border-border p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Budget R {trip.budget.toLocaleString()}</p>
              <p className={"text-xs font-semibold " + (overBudget ? "text-destructive" : "text-secondary")}>
                {overBudget
                  ? `R ${Math.round(Math.abs(trip.budget - (trip.actualTotal ?? 0))).toLocaleString()} over`
                  : `R ${Math.round(trip.budget - (trip.actualTotal ?? 0)).toLocaleString()} left`}
              </p>
            </div>
          </Card>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button onClick={shopAgain} className="rounded-full"><Copy size={14} /> Shop again</Button>
        <Button variant="outline" onClick={() => setDeleteOpen(true)} className="rounded-full text-destructive">
          <Trash2 size={14} /> Delete trip
        </Button>
      </div>

      <div className="space-y-2">
        {(trip.items ?? []).map((i) => (
          <div key={i.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-secondary">{i.name}</p>
                <CategoryChip categoryId={i.category} />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {i.quantity} {i.unit || "pcs"} · Est R {i.estimatedPrice ?? 0}
                {i.actualPrice != null ? ` · Actual R ${i.actualPrice}` : ""}
              </p>
            </div>
            <span className={"text-xs font-medium " + (i.purchased ? "text-secondary" : "text-muted-foreground")}>
              {i.purchased ? "Bought" : "Missed"}
            </span>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={deleteOpen} onOpenChange={setDeleteOpen}
        title="Delete this trip?" description="Trip data will be permanently removed from history."
        onConfirm={async () => { await historyService.remove(trip.id); toast.success("Deleted"); navigate({ to: "/history" }); }}
      />
    </div>
  );
}