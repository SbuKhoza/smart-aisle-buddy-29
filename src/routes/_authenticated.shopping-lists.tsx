import { createFileRoute } from "@tanstack/react-router";
import { ListChecks } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/_authenticated/shopping-lists")({
  head: () => ({ meta: [{ title: "Shopping Lists — AISLE SPY" }, { name: "description", content: "Your shopping lists." }] }),
  component: () => (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8">
      <h1 className="mb-6 text-2xl font-bold text-secondary">Shopping Lists</h1>
      <EmptyState icon={<ListChecks />} title="No lists yet" body="Shopping lists arrive in Phase 2. We're prepping the foundation." />
    </div>
  ),
});
*** Add File: src/routes/_authenticated.history.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — AISLE SPY" }, { name: "description", content: "Your shopping history." }] }),
  component: () => (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8">
      <h1 className="mb-6 text-2xl font-bold text-secondary">History</h1>
      <EmptyState icon={<Clock />} title="No trips yet" body="Once you complete shopping trips, they'll appear here." />
    </div>
  ),
});
*** Add File: src/routes/_authenticated.specials.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Tag } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/_authenticated/specials")({
  head: () => ({ meta: [{ title: "Specials — AISLE SPY" }, { name: "description", content: "Deals and promotions from your favourite stores." }] }),
  component: () => (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8">
      <h1 className="mb-6 text-2xl font-bold text-secondary">Specials</h1>
      <EmptyState icon={<Tag />} title="No specials yet" body="Promotions and catalogues from your stores will show up here." />
    </div>
  ),
});
*** Add File: src/components/EmptyState.tsx
import type { ReactNode } from "react";

export function EmptyState({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">{icon}</div>
      <h3 className="text-lg font-semibold text-secondary">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
    </div>
  );
}