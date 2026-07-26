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