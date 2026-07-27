import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/firebase-auth";
import { useShoppingList } from "@/hooks/useShoppingList";
import { historyService, shoppingItemService, shoppingListService } from "@/lib/services/shopping";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ItemRow } from "@/components/shopping/ItemRow";
import { BudgetCard } from "@/components/shopping/BudgetCard";
import { AnimatedTotal } from "@/components/shopping/AnimatedTotal";
import { ShoppingSummaryDialog } from "@/components/shopping/ShoppingSummaryDialog";
import { ConfirmDialog } from "@/components/shopping/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/_authenticated/shopping-lists/$listId/shop")({
  head: () => ({
    meta: [
      { title: "Shopping Mode — AISLE SPY" },
      { name: "description", content: "Track actual prices and progress while you shop." },
    ],
  }),
  component: ShopModePage,
});

function ShopModePage() {
  const { listId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { list, items, loading } = useShoppingList(listId);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [savingTrip, setSavingTrip] = useState(false);
  const [deletingItem, setDeletingItem] = useState<string | null>(null);

  const { estimated, actual, purchasedCount } = useMemo(() => {
    let est = 0, act = 0, pc = 0;
    for (const i of items) {
      const qty = Number(i.quantity) || 0;
      est += (Number(i.estimatedPrice) || 0) * qty;
      if (i.purchased) {
        pc += 1;
        act += (Number(i.actualPrice ?? i.estimatedPrice) || 0) * qty;
      }
    }
    return { estimated: est, actual: act, purchasedCount: pc };
  }, [items]);

  const total = items.length;
  const pct = total === 0 ? 0 : (purchasedCount / total) * 100;

  async function saveTrip() {
    if (!user || !list) return;
    setSavingTrip(true);
    try {
      const tripId = await historyService.saveTrip(user.uid, {
        listId: list.id, name: list.name, items,
        budget: list.budget ?? null,
      });
      toast.success("Shopping trip saved");
      navigate({ to: "/history/$tripId", params: { tripId } });
    } catch (e) {
      console.error(e);
      toast.error("Could not save trip");
    } finally {
      setSavingTrip(false);
      setSummaryOpen(false);
    }
  }

  if (loading || !list) {
    return <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-4 flex items-center gap-2">
        <Link to="/shopping-lists/$listId" params={{ listId: list.id }} className="rounded-full p-2 hover:bg-accent">
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-widest text-primary">Shopping mode</p>
          <h1 className="truncate text-xl font-bold text-secondary md:text-2xl">{list.name}</h1>
        </div>
        <Button
          onClick={async () => { await shoppingListService.setStatus(list.id, "active"); navigate({ to: "/shopping-lists/$listId", params: { listId: list.id } }); }}
          variant="outline" size="sm"
        >
          Pause
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card className="rounded-3xl border-border p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Running total</p>
          <AnimatedTotal value={actual} className="text-3xl font-bold text-primary" />
          <p className="mt-1 text-xs text-muted-foreground">Estimated R {Math.round(estimated).toLocaleString()}</p>
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{purchasedCount}/{total} · {Math.round(pct)}%</span>
            </div>
            <motion.div initial={false} animate={{ opacity: 1 }}>
              <Progress value={pct} className="h-2 [&>div]:bg-primary" />
            </motion.div>
          </div>
        </Card>
        <BudgetCard budget={list.budget ?? null} estimated={estimated} actual={actual} variant="actual" label="Actual vs budget" />
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<Trash2 />} title="Nothing to shop" body="Add items to this list before starting shopping mode." />
      ) : (
        <div className="space-y-2 pb-32">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                mode="shop"
                onToggle={() => shoppingItemService.togglePurchased(item.id, !item.purchased)}
                onDelete={() => setDeletingItem(item.id)}
                onActualPriceChange={(v) => shoppingItemService.setActualPrice(item.id, v)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card/95 px-4 py-3 backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Running total</p>
            <AnimatedTotal value={actual} className="text-lg font-bold text-primary" />
          </div>
          <Button className="rounded-full" onClick={() => setSummaryOpen(true)}>
            <CheckCircle2 size={16} /> Done shopping
          </Button>
        </div>
      </div>

      <ShoppingSummaryDialog
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        busy={savingTrip}
        data={{
          name: list.name,
          estimatedTotal: estimated,
          actualTotal: actual,
          budget: list.budget ?? null,
          itemCount: items.length,
          purchasedCount,
        }}
        onSave={saveTrip}
      />

      <ConfirmDialog
        open={!!deletingItem}
        onOpenChange={(v) => !v && setDeletingItem(null)}
        title="Delete item?"
        onConfirm={async () => { if (deletingItem) { await shoppingItemService.remove(deletingItem); setDeletingItem(null); } }}
      />
    </div>
  );
}