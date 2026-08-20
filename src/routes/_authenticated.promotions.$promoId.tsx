import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Store as StoreIcon, Tag } from "lucide-react";
import { isPromotionLive, promotionsService } from "@/lib/services/admin";
import { useStores } from "@/lib/catalog";
import type { Promotion } from "@/models";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/_authenticated/promotions/$promoId")({
  head: () => ({
    meta: [
      { title: "Promotion — AISLE SPY" },
      { name: "description", content: "Details for this store promotion." },
    ],
  }),
  component: PromotionPage,
});

// Kept in sync with the fallback branding used on the dashboard carousel.
const STORE_STYLE: Record<string, { bg: string; text: string; initials: string }> = {
  shoprite: { bg: "#E31E24", text: "#fff", initials: "SR" },
  checkers: { bg: "#3B6FD4", text: "#fff", initials: "CH" },
  picknpay: { bg: "#EF4A5B", text: "#fff", initials: "PnP" },
  woolworths: { bg: "#1F1F1F", text: "#fff", initials: "WW" },
  makro: { bg: "#3D8BFF", text: "#fff", initials: "MK" },
  boxer: { bg: "#F58220", text: "#fff", initials: "BX" },
  spar: { bg: "#2FAE66", text: "#fff", initials: "SP" },
  clicks: { bg: "#2B8FE0", text: "#fff", initials: "CL" },
  dischem: { bg: "#22B06B", text: "#fff", initials: "DC" },
};

function PromotionPage() {
  const { promoId } = Route.useParams();
  const stores = useStores();
  const [promo, setPromo] = useState<Promotion | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    promotionsService.get(promoId).then((p) => {
      if (alive) setPromo(p);
    });
    return () => {
      alive = false;
    };
  }, [promoId]);

  if (promo === undefined) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <Skeleton className="mb-4 h-9 w-24 rounded-full" />
        <Skeleton className="mb-4 h-48 w-full rounded-3xl" />
        <Skeleton className="mb-2 h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (!promo) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10 md:px-8">
        <Link
          to="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-secondary"
        >
          <ArrowLeft size={16} /> Back
        </Link>
        <EmptyState
          icon={<Tag />}
          title="Promotion not found"
          body="This promotion may have expired or been removed."
        />
      </div>
    );
  }

  const store = stores.find((s) => s.id === promo.storeId);
  const style = {
    bg: store?.colour || STORE_STYLE[promo.storeId]?.bg || "#64748B",
    initials:
      store?.initials ||
      STORE_STYLE[promo.storeId]?.initials ||
      (promo.storeName || "ST").slice(0, 2).toUpperCase(),
  };
  const live = isPromotionLive(promo);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
      <Link
        to="/dashboard"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-secondary"
      >
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      <Card className="overflow-hidden rounded-3xl border-border p-0 shadow-[var(--shadow-card)]">
        <div
          className="relative flex h-48 items-start justify-end p-5"
          style={
            promo.imageURL
              ? {
                  backgroundImage: `url(${promo.imageURL})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : { background: `linear-gradient(135deg, ${style.bg}, ${style.bg}99)` }
          }
        >
          {!promo.imageURL && (
            <div
              className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full text-sm font-bold shadow-sm"
              style={{ backgroundColor: "#fff", color: style.bg }}
            >
              {store?.logoURL ? (
                <img
                  src={store.logoURL}
                  alt={`${promo.storeName || store?.name || "Store"} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                style.initials
              )}
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              {promo.tag || "Special"}
            </span>
            {!live && (
              <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                Expired
              </span>
            )}
          </div>

          <h1 className="text-xl font-bold text-secondary md:text-2xl">{promo.title}</h1>

          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <StoreIcon size={14} /> {promo.storeName || store?.name || "Store"}
          </p>

          {promo.description && (
            <p className="mt-4 text-sm leading-relaxed text-secondary">{promo.description}</p>
          )}

          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar size={13} />
            {promo.validFrom} — {promo.validTo}
          </p>
        </div>
      </Card>

      <div className="mt-4">
        <Button asChild className="w-full rounded-2xl">
          <Link to="/shopping-lists">Start a shopping list</Link>
        </Button>
      </div>
    </div>
  );
}