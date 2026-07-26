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