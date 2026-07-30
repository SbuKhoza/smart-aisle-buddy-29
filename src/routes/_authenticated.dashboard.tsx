import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ListChecks, Clock, Wallet, Plus, ShoppingCart, ChevronRight, Leaf, ClipboardList } from "lucide-react";
import { useAuth } from "@/lib/firebase-auth";
import { historyService, shoppingListService } from "@/lib/services/shopping";
import type { ShoppingHistoryEntry, ShoppingList } from "@/models";
import { DEFAULT_STORES } from "@/constants/regions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateListDialog, type CreateListInput } from "@/components/shopping/CreateListDialog";
import { AnimatedTotal } from "@/components/shopping/AnimatedTotal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

// TODO: replace with a real specials/adverts service once available.
const PLACEHOLDER_SPECIALS = [
  { id: "s1", storeId: "shoprite", storeName: "Shoprite", tag: "Limited time only", title: "Extra 15% off fresh spreads" },
  { id: "s2", storeId: "checkers", storeName: "Checkers", tag: "This week", title: "Sixty60 delivery specials" },
  { id: "s3", storeId: "woolworths", storeName: "Woolworths", tag: "Today only", title: "2-for-1 on ready meals" },
  { id: "s4", storeId: "picknpay", storeName: "Pick n Pay", tag: "Members", title: "Smart Shopper double points" },
  { id: "s5", storeId: "spar", storeName: "Spar", tag: "Weekend", title: "Braai bundle deals" },
];

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

// Grocery basket illustration for the budget card.
function BasketIllustration() {
  return (
    <svg
      className="pointer-events-none absolute -bottom-2 -right-1"
      width="132" height="112" viewBox="0 0 140 120" fill="none"
    >
      <defs>
        <linearGradient id="basketWeave" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C68A45" />
          <stop offset="100%" stopColor="#8A5A28" />
        </linearGradient>
        <linearGradient id="basketRim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D9A05B" />
          <stop offset="100%" stopColor="#9C6A32" />
        </linearGradient>
        <radialGradient id="tomatoShade" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FF6F5E" />
          <stop offset="100%" stopColor="#C42B1C" />
        </radialGradient>
        <radialGradient id="appleShade" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#8CD05C" />
          <stop offset="100%" stopColor="#4E9A2A" />
        </radialGradient>
        <radialGradient id="orangeShade" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFB25E" />
          <stop offset="100%" stopColor="#E8790F" />
        </radialGradient>
        <linearGradient id="carrotShade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFA24D" />
          <stop offset="100%" stopColor="#E8700F" />
        </linearGradient>
      </defs>

      <circle cx="55" cy="42" r="17" fill="url(#tomatoShade)" />
      <path d="M50 27 Q55 21 60 27" stroke="#3C8A2E" strokeWidth="3.5" strokeLinecap="round" fill="none" />

      <circle cx="82" cy="38" r="14" fill="url(#appleShade)" />
      <path d="M82 26 Q84 20 88 19" stroke="#5C3A1E" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      <circle cx="103" cy="48" r="13" fill="url(#orangeShade)" />

      <path d="M60 48 L78 20 Q80 16 84 19 L68 52 Z" fill="url(#carrotShade)" />
      <path d="M63 40 Q56 32 50 30 M67 36 Q62 26 58 22" stroke="#4E9A2A" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      <path d="M22 55 L118 55 L108 108 Q106 114 100 114 L40 114 Q34 114 32 108 Z" fill="url(#basketWeave)" />
      <path d="M28 66 L112 66 M25 78 L115 78 M28 90 L112 90 M32 102 L108 102" stroke="#6E441C" strokeWidth="2" opacity="0.6" />
      <path d="M40 55 L34 114 M60 55 L56 114 M80 55 L84 114 M100 55 L106 114" stroke="#6E441C" strokeWidth="2" opacity="0.5" />
      <rect x="18" y="50" width="104" height="9" rx="4" fill="url(#basketRim)" />
      <path d="M46 50 Q70 18 94 50" stroke="#9C6A32" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M46 50 Q70 22 94 50" stroke="#D9A05B" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function Dashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const budget = profile?.monthlyBudget;
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [trips, setTrips] = useState<ShoppingHistoryEntry[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string | null>(DEFAULT_STORES[0]?.id ?? null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [specialIndex, setSpecialIndex] = useState(0);

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

  function onCarouselScroll() {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 12 : 1;
    setSpecialIndex(Math.round(el.scrollLeft / cardWidth));
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <p className="text-sm text-muted-foreground">{greeting()},</p>
        <h1 className="text-2xl font-bold tracking-tight text-secondary md:text-3xl">
          Welcome back, {profile?.firstName || "Shopper"} 👋
        </h1>
      </motion.div>

      {/* Specials & adverts carousel — single dark surface per spec */}
      <div className="mb-4">
        <div
          ref={carouselRef}
          onScroll={onCarouselScroll}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {PLACEHOLDER_SPECIALS.map((s) => {
            const style = STORE_STYLE[s.storeId] ?? { bg: "#64748B", text: "#fff", initials: s.storeName.slice(0, 2).toUpperCase() };
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toast.info(`${s.storeName}: ${s.title}`)}
                className="
relative
flex
h-28
w-full
shrink-0
snap-start
items-center
gap-4
overflow-hidden
rounded-3xl
border
border-white/10
bg-gradient-to-br
from-[#1F2A37]
via-[#16202B]
to-[#0F172A]
px-6
py-5
text-left
shadow-xl
sm:w-[calc(100%-2rem)]
"
              >

                {/* Background gradient overlay */}
<div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-transparent" />

{/* Green glow */}
<div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />

{/* Yellow glow */}
<div className="absolute bottom-0 left-10 h-40 w-40 rounded-full bg-yellow-300/15 blur-3xl" />

{/* Blue glow */}
<div className="absolute left-1/2 top-0 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />

                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: style.bg, color: style.text }}
                >
                  {style.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex rounded-full bg-yellow-400/15 px-3 py-1 text-[10px] font-semibold tracking-wide text-yellow-300">{s.tag}</span>
                  <p className="mt-1 truncate text-sm font-semibold leading-snug text-[var(--promo-foreground)]">{s.title}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--promo-muted-foreground)]">{s.storeName}</p>
                </div>
                
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex justify-center gap-1">
          {PLACEHOLDER_SPECIALS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === specialIndex ? "w-4 bg-primary" : "w-1.5 bg-border",
              )}
            />
          ))}
        </div>
      </div>

      {/* Budget card — mint surface, basket illustration */}
      <Card
        className="relative mb-4 overflow-hidden border-0 bg-[var(--budget-bg)] p-4 shadow-[var(--shadow-card)]"
        style={{ maxHeight: 110 }}
      >
        <BasketIllustration />

        <div className="relative flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[var(--budget-title)] shadow-sm">
            <Wallet size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--budget-title)]">Monthly budget</p>
              {budget ? (
                <Link to="/profile" className="shrink-0 text-[11px] font-medium text-[var(--budget-title)] hover:underline">
                  Edit
                </Link>
              ) : (
                <Button asChild size="sm" className="h-6 rounded-lg px-2 text-[10px]">
                  <Link to="/profile">Set budget</Link>
                </Button>
              )}
            </div>
            {budget ? (
              <>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-bold text-secondary">R {budget.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    spent <AnimatedTotal value={monthlySpent} className="font-semibold text-secondary" />
                  </p>
                </div>
                <div className="mt-2 h-1.5 w-2/3 overflow-hidden rounded-full bg-[var(--budget-track)]">
                  <div className="h-full rounded-full bg-[var(--budget-fill)] transition-all" style={{ width: `${monthlyPct}%` }} />
                </div>
              </>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">Track your monthly grocery spend.</p>
            )}
          </div>
        </div>
      </Card>

      {/* Store row — retailer branding kept only inside the logo, selection shown with a green ring */}
      <div className="mb-5">
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {DEFAULT_STORES.map((s) => {
            const style = STORE_STYLE[s.id] ?? { bg: "#64748B", text: "#fff", initials: s.name.slice(0, 2).toUpperCase() };
            const selected = selectedStore === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedStore(s.id)}
                className="flex shrink-0 flex-col items-center gap-1"
              >
                <div
    className="absolute inset-0 opacity-[0.03]"
    style={{
        backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
        backgroundSize: "24px 24px",
    }}
/>
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full text-[11px] font-bold transition-all",
                    selected ? "ring-2 ring-[var(--chip-selected-border)] ring-offset-2 ring-offset-background" : "shadow-sm",
                  )}
                  style={{ backgroundColor: style.bg, color: style.text }}
                >
                  {style.initials}
                </div>
                <span className={cn("max-w-[52px] truncate text-[10px]", selected ? "font-semibold text-[var(--chip-selected-text)]" : "text-muted-foreground")}>
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-border p-4 shadow-[var(--shadow-card)] md:col-span-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Quick actions</p>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
            <Button variant="outline" className="h-11 flex-col gap-0.5 rounded-xl text-[11px]" onClick={() => setCreateOpen(true)}>
              <Plus size={15} /> New list
            </Button>
            <Button asChild variant="outline" className="h-11 flex-col gap-0.5 rounded-xl text-[11px]">
              <Link to="/history"><Clock size={15} /> History</Link>
            </Button>
            {inProgress ? (
              <Button asChild className="col-span-2 h-11 rounded-xl text-[11px] md:col-span-2">
                <Link to="/shopping-lists/$listId/shop" params={{ listId: inProgress.id }}>
                  <ShoppingCart size={15} /> Continue shopping
                </Link>
              </Button>
            ) : (
              <Button asChild className="col-span-2 h-11 rounded-xl text-[11px] md:col-span-2">
                <Link to="/shopping-lists">
                  <ListChecks size={15} /> View all lists
                </Link>
              </Button>
            )}
          </div>
        </Card>

        <Card className="rounded-2xl border-border p-4 shadow-[var(--shadow-card)]">
          <p className="mb-1.5 text-xs uppercase tracking-widest text-muted-foreground">Last shopping trip</p>
          {lastTrip ? (
            <Link to="/history/$tripId" params={{ tripId: lastTrip.id }} className="block">
              <p className="text-base font-semibold text-secondary line-clamp-1">{lastTrip.name ?? "Shopping trip"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {new Date(lastTrip.completedAt).toLocaleDateString()} · {lastTrip.purchasedCount ?? 0}/{lastTrip.itemCount ?? 0} items
              </p>
              <p className="mt-1.5 text-xl font-bold text-primary">
                R {Math.round(lastTrip.actualTotal ?? lastTrip.total ?? 0).toLocaleString()}
              </p>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <ShoppingCart size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-secondary">Complete a shopping trip</p>
                <p className="text-xs text-muted-foreground">to see it here.</p>
              </div>
              <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
            </div>
          )}
        </Card>

        <Card className="rounded-2xl border-border p-5 shadow-[var(--shadow-card)] md:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Active lists</p>
              <p className="text-lg font-semibold text-secondary">{activeLists.length} in progress</p>
            </div>
            <Link to="/shopping-lists" className="text-xs font-medium text-primary hover:underline">See all</Link>
          </div>
          {activeLists.length === 0 ? (
            <div className="flex items-center gap-3">
              <p className="flex-1 text-sm text-muted-foreground">No active lists. Create one to get started.</p>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <ClipboardList size={20} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {activeLists.map((l) => (
                <Link
                  key={l.id}
                  to="/shopping-lists/$listId"
                  params={{ listId: l.id }}
                  className="flex items-center gap-3 rounded-2xl border border-border p-3 hover:bg-accent"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
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

        <Card className="rounded-2xl border-border p-5 shadow-[var(--shadow-card)] md:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Recent activity</p>
            <Link to="/history" className="text-xs font-medium text-primary hover:underline">View history</Link>
          </div>
          {trips.length === 0 ? (
            <div className="flex items-center gap-3">
              <p className="flex-1 text-sm text-muted-foreground">Your recent trips will appear here.</p>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Leaf size={20} />
              </div>
            </div>
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