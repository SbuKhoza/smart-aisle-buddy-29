import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ListChecks, Clock, Wallet, Plus, ShoppingCart, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/firebase-auth";
import { historyService, shoppingListService } from "@/lib/services/shopping";
import type { ShoppingHistoryEntry, ShoppingList } from "@/models";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateListDialog, type CreateListInput } from "@/components/shopping/CreateListDialog";
import { AnimatedTotal } from "@/components/shopping/AnimatedTotal";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AISLE SPY" },
      { name: "description", content: "Your monthly budget, active shopping lists and latest trip in one place." },
      { property: "og:title", content: "Dashboard — AISLE SPY" },
      { property: "og:description", content: "Your monthly budget, active shopping lists and latest trip in one place." },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const budget = profile?.monthlyBudget;
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [trips, setTrips] = useState<ShoppingHistoryEntry[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const u1 = shoppingListService.subscribe(user.uid, setLists);
    const u2 = historyService.subscribe(user.uid, setTrips);
    return () => { u1(); u2(); };
  }, [user]);

  const monthlySpent = useMemo(() => {
    const now = new Date();
    return trips
      .filter((t) => {
        const d = new Date(t.completedAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((s, t) => s + (t.actualTotal ?? t.total ?? 0), 0);
  }, [trips]);

  const activeLists = lists.filter((l) => (l.status ?? "active") !== "archived" && (l.status ?? "active") !== "completed").slice(0, 3);
  const inProgress = lists.find((l) => l.status === "shopping");
  const lastTrip = trips[0];

  async function createList(input: CreateListInput) {
    if (!user) return;
    const id = await shoppingListService.create(user.uid, input.name, {
      storeId: input.storeId,
      storeName: input.storeName,
      mode: input.mode,
    });
    toast.success("List created");
    navigate({ to: "/shopping-lists/$listId", params: { listId: id } });
  }

  const monthlyPct = budget ? Math.min(100, (monthlySpent / budget) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-sm text-muted-foreground">{greeting()},</p>
        <h1 className="text-2xl font-bold tracking-tight text-secondary md:text-3xl">
          Welcome back, {profile?.firstName || "Shopper"} 👋
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card
          className="col-span-1 rounded-3xl border-border p-6 shadow-[var(--shadow-card)] md:col-span-2"
          style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-80">Monthly budget</p>
              <p className="mt-2 text-3xl font-bold">{budget ? `R ${budget.toLocaleString()}` : "Not set"}</p>
              {budget ? (
                <>
                  <p className="mt-1 text-sm opacity-90">
                    Spent this month{" "}
                    <AnimatedTotal value={monthlySpent} className="font-semibold" />
                  </p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/20">
                    <div className="h-full rounded-full bg-white/90 transition-all" style={{ width: `${monthlyPct}%` }} />
                  </div>
                </>
              ) : (
                <p className="mt-1 text-sm opacity-80">Set a budget in your profile to track monthly spend.</p>
              )}
            </div>
            <Wallet size={32} className="opacity-80" />
          </div>
          <Button variant="secondary" className="mt-5 rounded-xl bg-white/15 text-primary-foreground hover:bg-white/25" asChild>
            <Link to="/profile">Update budget</Link>
          </Button>
        </Card>

        <Card className="rounded-3xl border-border p-6 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Quick actions</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-16 flex-col rounded-2xl" onClick={() => setCreateOpen(true)}>
              <Plus size={18} /><span className="text-xs">New list</span>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col rounded-2xl">
              <Link to="/history"><Clock size={18} /><span className="text-xs">History</span></Link>
            </Button>
            {inProgress ? (
              <Button asChild className="col-span-2 h-12 rounded-2xl">
                <Link to="/shopping-lists/$listId/shop" params={{ listId: inProgress.id }}>
                  <ShoppingCart size={16} /> Continue shopping
                </Link>
              </Button>
            ) : (
              <Button asChild variant="secondary" className="col-span-2 h-12 rounded-2xl">
                <Link to="/shopping-lists">
                  <ListChecks size={16} /> View all lists
                </Link>
              </Button>
            )}
          </div>
        </Card>

        <Card className="rounded-3xl border-border p-5 shadow-[var(--shadow-card)] md:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Active lists</p>
              <p className="text-lg font-semibold text-secondary">{activeLists.length} in progress</p>
            </div>
            <Link to="/shopping-lists" className="text-xs font-medium text-primary hover:underline">See all</Link>
          </div>
          {activeLists.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active lists. Create one to get started.</p>
          ) : (
            <div className="space-y-2">
              {activeLists.map((l) => (
                <Link
                  key={l.id}
                  to="/shopping-lists/$listId"
                  params={{ listId: l.id }}
                  className="flex items-center gap-3 rounded-2xl border border-border p-3 hover:bg-accent"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ListChecks size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-secondary">{l.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.itemCount ?? 0} items · R {(l.estimatedTotal ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="rounded-3xl border-border p-5 shadow-[var(--shadow-card)]">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Last shopping trip</p>
          {lastTrip ? (
            <Link to="/history/$tripId" params={{ tripId: lastTrip.id }} className="block">
              <p className="text-lg font-semibold text-secondary line-clamp-1">{lastTrip.name ?? "Shopping trip"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(lastTrip.completedAt).toLocaleDateString()} · {lastTrip.purchasedCount ?? 0}/{lastTrip.itemCount ?? 0} items
              </p>
              <p className="mt-2 text-2xl font-bold text-primary">
                R {Math.round(lastTrip.actualTotal ?? lastTrip.total ?? 0).toLocaleString()}
              </p>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">Complete a shopping trip to see it here.</p>
          )}
        </Card>

        <Card className="rounded-3xl border-border p-5 shadow-[var(--shadow-card)] md:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Recent activity</p>
            <Link to="/history" className="text-xs font-medium text-primary hover:underline">View history</Link>
          </div>
          {trips.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your recent trips will appear here.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {trips.slice(0, 3).map((t) => (
                <Link
                  key={t.id}
                  to="/history/$tripId"
                  params={{ tripId: t.id }}
                  className="flex items-center justify-between rounded-2xl border border-border p-3 hover:bg-accent"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-secondary">{t.name ?? "Trip"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.completedAt).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">R {Math.round(t.actualTotal ?? t.total ?? 0).toLocaleString()}</p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <CreateListDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={createList} />
    </div>
  );
}