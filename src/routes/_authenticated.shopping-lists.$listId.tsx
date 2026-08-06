import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ShoppingCart, MoreHorizontal, Pencil, Copy, Archive, Trash2, Wallet, CheckCircle2, Check, Plus, ChevronUp,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/firebase-auth";
import { useShoppingList } from "@/hooks/useShoppingList";
import {
  historyService, shoppingItemService, shoppingListService, userProductService,
} from "@/lib/services/shopping";
import type { ShoppingItem, UserProduct } from "@/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuickAddForm, type QuickAddPayload } from "@/components/shopping/QuickAddForm";
import { ListRow } from "@/components/shopping/ListRow";
import { EditItemDialog } from "@/components/shopping/EditItemDialog";
import { ConfirmDialog } from "@/components/shopping/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useOnline } from "@/lib/offline";

export const Route = createFileRoute("/_authenticated/shopping-lists/$listId")({
  head: () => ({
    meta: [
      { title: "Shopping List — AISLE SPY" },
      { name: "description", content: "Jot down products in seconds and watch your totals update live as you shop." },
      { property: "og:title", content: "Shopping List — AISLE SPY" },
      { property: "og:description", content: "A shopping calculator that feels as fast as writing on paper." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ListDetailPage,
});

const money = (n: number) => `R ${Math.round(n).toLocaleString()}`;

function ListDetailPage() {
  const { listId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { list, items, loading, refreshList, setList } = useShoppingList(listId);

  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [shopping, setShopping] = useState(false);
  const [editing, setEditing] = useState<ShoppingItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ShoppingItem | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budgetValue, setBudgetValue] = useState("");
  const [deleteListOpen, setDeleteListOpen] = useState(false);
  const [savingTrip, setSavingTrip] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [planAddOpen, setPlanAddOpen] = useState(true);
  const [statsOpen, setStatsOpen] = useState(false);
  const [finishPromptOpen, setFinishPromptOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const promptedRef = useRef(false);
  const online = useOnline();

  useEffect(() => {
    if (!user) return;
    return userProductService.subscribe(user.uid, setUserProducts);
  }, [user]);

  useEffect(() => {
    if (list?.status === "shopping") setShopping(true);
  }, [list?.status]);

  const totals = useMemo(() => {
    let estimated = 0;
    let actual = 0;
    let purchased = 0;
    for (const i of items) {
      const qty = Number(i.quantity) || 1;
      if (i.estimatedPrice != null) estimated += Number(i.estimatedPrice) * qty;
      if (i.purchased) {
        purchased += 1;
        const price = i.actualPrice ?? i.estimatedPrice;
        if (price != null) actual += Number(price) * qty;
      }
    }
    return { estimated, actual, purchased };
  }, [items]);

  const budget = list?.budget ?? null;
  const remaining = budget == null ? null : budget - totals.actual;
  const complete = items.length > 0 && totals.purchased === items.length;

  useEffect(() => {
    if (complete && shopping) {
      if (!promptedRef.current) {
        promptedRef.current = true;
        setFinishPromptOpen(true);
      }
    } else {
      promptedRef.current = false;
      setFinishPromptOpen(false);
      setShowSummary(false);
    }
  }, [complete, shopping]);

  async function addItem(p: QuickAddPayload) {
    if (!user || !listId) return;
    try {
      await shoppingItemService.add(user.uid, listId, {
        name: p.name,
        productId: p.productId,
        category: p.category ?? "other",
        unit: p.unit ?? "pcs",
        quantity: 1,
        estimatedPrice: p.estimatedPrice,
      });
      if (!online) toast("Saved on this device — will sync when you're back online");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't add that product");
    }
  }

  async function setActualPrice(item: ShoppingItem, v: number | null) {
    try {
      await shoppingItemService.update(item.id, {
        actualPrice: v as any,
        purchased: v != null,
      });
    } catch (e) {
      console.error(e);
      toast.error("Couldn't update that price");
    }
  }

  async function handleRename() {
    if (!list) return;
    const n = renameValue.trim();
    if (!n) return toast.error("Name required");
    await shoppingListService.rename(list.id, n);
    setList({ ...list, name: n });
    setRenameOpen(false);
  }

  async function handleSetBudget() {
    if (!list) return;
    const v = budgetValue.trim();
    const num = v === "" ? null : Number(v);
    if (v !== "" && (Number.isNaN(num) || (num as number) < 0)) return toast.error("Invalid budget");
    await shoppingListService.setBudget(list.id, num as any);
    setList({ ...list, budget: (num ?? undefined) as any });
    setBudgetOpen(false);
  }

  async function handleDeleteList() {
    if (!user || !list) return;
    await shoppingListService.remove(list.id, user.uid);
    toast.success("List deleted");
    navigate({ to: "/shopping-lists" });
  }

  async function handleDuplicate() {
    if (!user || !list) return;
    const id = await shoppingListService.duplicate(user.uid, list.id);
    navigate({ to: "/shopping-lists/$listId", params: { listId: id } });
  }

  async function toggleShopping() {
    if (!list) return;
    const next = !shopping;
    setShopping(next);
    await shoppingListService.setStatus(list.id, next ? "shopping" : "active");
  }

  async function saveTrip() {
    if (!user || !list) return;
    setSavingTrip(true);
    try {
      const tripId = await historyService.saveTrip(user.uid, {
        listId: list.id, name: list.name, items, budget: list.budget ?? null,
        storeName: list.storeName,
      });
      toast.success("Shopping trip saved");
      navigate({ to: "/history/$tripId", params: { tripId } });
    } catch (e) {
      console.error(e);
      toast.error("Could not save trip");
    } finally {
      setSavingTrip(false);
    }
  }

  if (loading || !list) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 pb-40 pt-4 md:px-8 md:pt-8">
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-11 flex-1 rounded-2xl" />
          <Skeleton className="h-11 w-28 rounded-2xl" />
          <Skeleton className="h-11 w-11 rounded-2xl" />
        </div>
        <div className="space-y-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-28 pt-4 md:px-8 md:pt-8">
      <div className="mb-3 flex items-center gap-1.5">
        <Link to="/shopping-lists" className="-ml-1 rounded-full p-2 text-secondary active:bg-accent"><ArrowLeft size={18} /></Link>
        <div className="min-w-0 flex-1">
          {shopping && <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Shopping mode</p>}
          <h1 className="truncate text-[19px] font-bold leading-tight tracking-tight text-secondary md:text-2xl">{list.name}</h1>
          <p className="text-[11px] text-muted-foreground">
            {items.length} item{items.length === 1 ? "" : "s"}
            {budget != null ? ` · Budget ${money(budget)}` : ""}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9"><MoreHorizontal size={18} /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setRenameValue(list.name); setRenameOpen(true); }}>
              <Pencil size={14} className="mr-2" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setBudgetValue(list.budget ? String(list.budget) : ""); setBudgetOpen(true); }}>
              <Wallet size={14} className="mr-2" /> Set budget
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate}><Copy size={14} className="mr-2" /> Duplicate</DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                if (list.status === "archived" || list.archived) {
                  await shoppingListService.unarchive(list.id); refreshList();
                } else {
                  await shoppingListService.archive(list.id); refreshList();
                }
              }}>
              <Archive size={14} className="mr-2" /> {list.status === "archived" || list.archived ? "Unarchive" : "Archive"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteListOpen(true)} className="text-destructive">
              <Trash2 size={14} className="mr-2" /> Delete list
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => (shopping ? setAddOpen(true) : setPlanAddOpen((v) => !v))}
          aria-label="Add product"
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-2xl border border-dashed border-border bg-card px-3 text-[14px] font-medium text-secondary active:bg-accent"
        >
          <Plus size={16} /> Add
        </button>
        <button
          type="button"
          onClick={() => setStatsOpen(true)}
          aria-label="Show shopping totals"
          className="flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-3 active:bg-accent"
        >
          <span className="truncate text-[15px] font-bold tabular-nums text-primary">
            {money(shopping ? totals.actual : totals.estimated)}
          </span>
          <ChevronUp size={14} className="shrink-0 text-muted-foreground" />
        </button>
        <Button
          onClick={toggleShopping}
          variant={shopping ? "outline" : "default"}
          className="h-11 shrink-0 rounded-2xl px-3.5 text-[14px]"
        >
          {shopping ? "Pause" : (<><ShoppingCart size={16} /> Shop</>)}
        </Button>
      </div>

      {!shopping && planAddOpen && (
        <Card className="mb-3 gap-0 rounded-2xl border-border p-3 shadow-[var(--shadow-card)]">
          <QuickAddForm userProducts={userProducts} onAdd={addItem} />
        </Card>
      )}

      <Dialog open={shopping && addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add while shopping</DialogTitle></DialogHeader>
          <QuickAddForm userProducts={userProducts} onAdd={addItem} autoFocus />
        </DialogContent>
      </Dialog>

      <Dialog open={statsOpen} onOpenChange={setStatsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Totals</DialogTitle></DialogHeader>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <SummaryRow label="Estimated" value={money(totals.estimated)} />
            <SummaryRow label="Actual" value={money(totals.actual)} />
            <SummaryRow label="Budget" value={budget == null ? "—" : money(budget)} />
            <SummaryRow label="Remaining" value={remaining == null ? "—" : money(remaining)} />
            <SummaryRow label="Difference" value={money(totals.actual - totals.estimated)} />
            <SummaryRow label="Purchased" value={`${totals.purchased} / ${items.length}`} />
          </dl>
        </DialogContent>
      </Dialog>

      {complete && showSummary && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-3 gap-0 rounded-2xl border-primary/30 bg-primary/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-primary">
              <CheckCircle2 size={18} />
              <p className="text-base font-bold">Shopping complete</p>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <SummaryRow label="Estimated total" value={money(totals.estimated)} />
              <SummaryRow label="Actual total" value={money(totals.actual)} />
              <SummaryRow label="Difference" value={money(totals.actual - totals.estimated)} />
              <SummaryRow label="Budget remaining" value={remaining == null ? "—" : money(remaining)} />
              <SummaryRow label="Items purchased" value={`${totals.purchased} / ${items.length}`} />
              <SummaryRow label="Date" value={new Date().toLocaleDateString()} />
            </dl>
            <Button onClick={saveTrip} disabled={savingTrip} className="mt-4 w-full rounded-2xl">
              <Check size={16} /> {savingTrip ? "Saving…" : "Save shopping trip"}
            </Button>
          </Card>
        </motion.div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart />}
          title="Nothing on the list yet"
          body="Type a product name above and hit Add to list. A price is optional."
        />
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <ListRow
                key={item.id}
                item={item}
                shopping={shopping}
                onToggle={(v) => shoppingItemService.togglePurchased(item.id, v)}
                onDelete={() => setDeletingItem(item)}
                onEdit={() => setEditing(item)}
                onQuantityChange={(q) => shoppingItemService.update(item.id, { quantity: q })}
                onActualPriceChange={(v) => setActualPrice(item, v)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={finishPromptOpen} onOpenChange={setFinishPromptOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>All items purchased</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you done shopping, or would you like to keep adding products to this list?
          </p>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setFinishPromptOpen(false)}>Keep shopping</Button>
            <Button onClick={() => { setFinishPromptOpen(false); setShowSummary(true); }}>I'm done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditItemDialog item={editing} open={!!editing} onOpenChange={(v) => !v && setEditing(null)}
        onSave={async (patch) => { if (editing) await shoppingItemService.update(editing.id, patch); }} />
      <ConfirmDialog open={!!deletingItem} onOpenChange={(v) => !v && setDeletingItem(null)}
        title="Delete item?" description={deletingItem ? `Remove “${deletingItem.name}” from this list?` : ""}
        onConfirm={async () => { if (deletingItem) { await shoppingItemService.remove(deletingItem.id); setDeletingItem(null); } }} />
      <ConfirmDialog open={deleteListOpen} onOpenChange={setDeleteListOpen}
        title="Delete this list?" description="This permanently removes the list and every item on it."
        onConfirm={handleDeleteList} />

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Rename list</DialogTitle></DialogHeader>
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} autoFocus maxLength={60}
              onKeyDown={(e) => e.key === "Enter" && handleRename()} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameOpen(false)}>Cancel</Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Set budget</DialogTitle></DialogHeader>
          <div className="space-y-1.5">
            <Label>Budget (R)</Label>
            <Input type="number" min="0" step="1" value={budgetValue}
              onChange={(e) => setBudgetValue(e.target.value)} placeholder="e.g. 2500" autoFocus />
            <p className="text-xs text-muted-foreground">Leave blank to remove.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBudgetOpen(false)}>Cancel</Button>
            <Button onClick={handleSetBudget}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-secondary">{value}</dd>
    </div>
  );
}
