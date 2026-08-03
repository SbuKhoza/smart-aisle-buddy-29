import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Tag } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Card } from "@/components/ui/card";
import { isPromotionLive, promotionsService } from "@/lib/services/admin";
import type { Promotion } from "@/models";

export const Route = createFileRoute("/_authenticated/specials")({
  head: () => ({ meta: [{ title: "Specials — AISLE SPY" }, { name: "description", content: "Deals and promotions from your favourite stores." }] }),
  component: Specials,
});

function Specials() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  useEffect(() => promotionsService.subscribeAll(setPromos, () => {}), []);
  const live = useMemo(() => promos.filter((p) => isPromotionLive(p)), [promos]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8">
      <h1 className="mb-4 text-[22px] font-bold text-secondary">Specials</h1>
      {live.length === 0 ? (
        <EmptyState icon={<Tag />} title="No specials yet" body="Promotions and catalogues from your stores will show up here." />
      ) : (
        <div className="space-y-2.5">
          {live.map((p) => (
            <Card key={p.id} className="rounded-2xl border-border p-3.5 shadow-[var(--shadow-card)]">
              <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                {p.tag || "Special"}
              </span>
              <p className="mt-2 text-[15px] font-semibold text-secondary">{p.title}</p>
              {p.description && <p className="mt-0.5 text-[13px] text-muted-foreground">{p.description}</p>}
              <p className="mt-1 text-[12px] text-muted-foreground">
                {p.storeName} · until {p.validTo}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
