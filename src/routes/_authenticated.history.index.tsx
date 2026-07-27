import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useAuth } from "@/lib/firebase-auth";
import { historyService } from "@/lib/services/shopping";
import type { ShoppingHistoryEntry } from "@/models";
import { HistoryCard } from "@/components/shopping/HistoryCard";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/_authenticated/history/")({
  component: HistoryPage,
});

function HistoryPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<ShoppingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = historyService.subscribe(user.uid, (rows) => { setTrips(rows); setLoading(false); });
    return () => unsub();
  }, [user]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="mb-1 text-2xl font-bold text-secondary md:text-3xl">Shopping History</h1>
      <p className="mb-6 text-sm text-muted-foreground">Every completed trip in one place.</p>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : trips.length === 0 ? (
        <EmptyState icon={<Clock />} title="No trips yet" body="Complete a shopping trip and it'll appear here." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {trips.map((t, i) => <HistoryCard key={t.id} trip={t} index={i} />)}
        </div>
      )}
    </div>
  );
}