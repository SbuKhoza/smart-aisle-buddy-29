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