import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ShoppingCart, MoreHorizontal, Pencil, Copy, Archive, Trash2, Wallet } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/firebase-auth";
import { useShoppingList } from "@/hooks/useShoppingList";
import {
  favouriteService, shoppingItemService, shoppingListService, userProductService,
  type NewItemInput,
} from "@/lib/services/shopping";
import type { CategoryId } from "@/constants/categories";
import type { FavouriteProduct, ShoppingItem, UserProduct } from "@/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ItemRow } from "@/components/shopping/ItemRow";
import { BudgetCard } from "@/components/shopping/BudgetCard";
import { AnimatedTotal } from "@/components/shopping/AnimatedTotal";
import { CategoryFilter } from "@/components/shopping/CategoryChip";
import { QuickAddBar, type QuickAddItem } from "@/components/shopping/QuickAddBar";
import { StoreCatalog } from "@/components/shopping/StoreCatalog";
import type { PreloadedProduct } from "@/data/preloaded-products";
import { EditItemDialog } from "@/components/shopping/EditItemDialog";
import { ConfirmDialog } from "@/components/shopping/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/_authenticated/shopping-lists/$listId")({
  head: () => ({
    meta: [
      { title: "Shopping List — AISLE SPY" },
      { name: "description", content: "Add products, track estimated cost and monitor your budget in real time." },
    ],
  }),
  component: ListDetailPage,
});

function ListDetailPage() {
  const { listId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { list, items, loading, refreshList, setList } = useShoppingList(listId);

  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [favs, setFavs] = useState<FavouriteProduct[]>([]);
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [editing, setEditing] = useState<ShoppingItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ShoppingItem | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budgetValue, setBudgetValue] = useState("");
  const [deleteListOpen, setDeleteListOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const u1 = userProductService.subscribe(user.uid, setUserProducts);
    const u2 = favouriteService.subscribe(user.uid, setFavs);
    return () => { u1(); u2(); };
  }, [user]);

  const favouriteIds = useMemo(() => new Set(favs.map((f) => f.productId)), [favs]);
  const filteredItems = useMemo(() => (category === "all" ? items : items.filter((i) => (i.category || "other") === category)), [items, category]);

  async function addQuick(r: QuickAddItem) {
    if (!user || !listId) return;
    const existing = items.find(
      (i) => (r.productId && i.productId === r.productId) || i.name.toLowerCase() === r.name.toLowerCase(),
    );
    if (existing) {
      const next = (Number(existing.quantity) || 0) + 1;
      await shoppingItemService.update(existing.id, { quantity: next });
      toast.success(`Increased ${existing.name} to ${next}`);
      return;
    }
    const input: NewItemInput = {
      productId: r.productId,
      name: r.name,
      brand: r.brand,
      category: r.category,
      quantity: r.quantity,
      unit: r.unit,
      estimatedPrice: r.estimatedPrice,
    };
    await shoppingItemService.add(user.uid, listId, input);
    toast.success(`Added ${r.name}`);
  }

  async function addFreeText(name: string) {
    if (!user || !listId) return;
    const trimmed = name.trim();
    const existing = items.find((i) => i.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      const next = (Number(existing.quantity) || 0) + 1;
      await shoppingItemService.update(existing.id, { quantity: next });
      toast.success(`Increased ${existing.name} to ${next}`);
      return;
    }
    await shoppingItemService.add(user.uid, listId, {
      name: trimmed,
      category: "other",
      quantity: 1,
      unit: "pcs",
      estimatedPrice: 0,
    });
    toast.success(`Added ${trimmed}`);
  }

  async function incrementProduct(p: PreloadedProduct) {
    await addQuick({
      productId: p.id,
      name: p.name,
      category: p.category,
      quantity: p.quantity,
      unit: p.unit,
      estimatedPrice: p.estimatedPrice,
    });
  }

  async function decrementProduct(productId: string) {
    const existing = items.find((i) => i.productId === productId);
    if (!existing) return;
    const next = (Number(existing.quantity) || 0) - 1;
    if (next <= 0) {
      await shoppingItemService.remove(existing.id);
    } else {
      await shoppingItemService.update(existing.id, { quantity: next });
    }
  }

  async function toggleFavourite(item: ShoppingItem) {
    if (!user) return;
    const pid = item.productId || item.id;
    if (favouriteIds.has(pid)) {
      await favouriteService.removeByProductId(user.uid, pid);
      toast.success("Removed from favourites");
    } else {
      await favouriteService.add(user.uid, {
        productId: pid, name: item.name, brand: item.brand, category: item.category || "other",
        unit: item.unit || "pcs", estimatedPrice: item.estimatedPrice ?? 0,
      });
      toast.success("Added to favourites");
    }
  }

  async function handleRename() {
    if (!list) return;
    const n = renameValue.trim();
    if (!n) return toast.error("Name required");
    await shoppingListService.rename(list.id, n);
    setList({ ...list, name: n });
    setRenameOpen(false);
    toast.success("Renamed");
  }

  async function handleSetBudget() {
    if (!list) return;
    const v = budgetValue.trim();
    const num = v === "" ? null : Number(v);
    if (v !== "" && (Number.isNaN(num) || (num as number) < 0)) return toast.error("Invalid budget");
    await shoppingListService.setBudget(list.id, num as any);
    setList({ ...list, budget: (num ?? undefined) as any });
    setBudgetOpen(false);
    toast.success("Budget updated");
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
    toast.success("Duplicated");
    navigate({ to: "/shopping-lists/$listId", params: { listId: id } });
  }

  const estimated = items.reduce((s, i) => s + (Number(i.estimatedPrice) || 0) * (Number(i.quantity) || 0), 0);
  const recentNames = items.slice(0, 5).map((i) => i.name);

  if (loading || !list) {
    return <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">Loading list…</div>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-4 flex items-center gap-2">
        <Link to="/shopping-lists" className="rounded-full p-2 hover:bg-accent"><ArrowLeft size={18} /></Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold text-secondary md:text-3xl">{list.name}</h1>
          <p className="text-xs text-muted-foreground">
            {items.length} item{items.length === 1 ? "" : "s"} · Estimated <AnimatedTotal value={estimated} className="font-semibold text-primary" />
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal size={18} /></Button>
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
                  await shoppingListService.unarchive(list.id); refreshList(); toast.success("Restored");
                } else {
                  await shoppingListService.archive(list.id); refreshList(); toast.success("Archived");
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

      <div className="mb-4">
        <BudgetCard budget={list.budget ?? null} estimated={estimated} />
      </div>

      <Card className="mb-4 rounded-3xl border-border p-4">
        <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Add products</p>
        <QuickAddBar
          userProducts={userProducts}
          favourites={favs}
          recentNames={recentNames}
          onAdd={addQuick}
          onAddFreeText={addFreeText}
        />
      </Card>

      {(list.mode === "store" || list.mode === "combination") && (
        <div className="mb-4">
          <StoreCatalog
            storeName={list.storeName}
            quantitiesByProductId={Object.fromEntries(
              items.filter((i) => i.productId).map((i) => [i.productId as string, Number(i.quantity) || 0]),
            )}
            onIncrement={incrementProduct}
            onDecrement={decrementProduct}
            defaultOpen={items.length === 0}
          />
        </div>
      )}

      <div className="mb-3">
        <CategoryFilter value={category} onChange={setCategory} />
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart />}
          title={items.length === 0 ? "No items yet" : "Nothing in this category"}
          body={items.length === 0 ? "Search above to add your first product." : "Try a different category filter."}
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filteredItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                mode="plan"
                isFavourite={favouriteIds.has(item.productId || item.id)}
                onToggle={() => shoppingItemService.togglePurchased(item.id, !item.purchased)}
                onDelete={() => setDeletingItem(item)}
                onEdit={() => setEditing(item)}
                onFavourite={() => toggleFavourite(item)}
                onQuantityChange={(q) => shoppingItemService.update(item.id, { quantity: q })}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card/95 px-4 py-3 backdrop-blur md:static md:mt-6 md:rounded-3xl md:border md:bg-card md:p-4">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Estimated total</p>
              <AnimatedTotal value={estimated} className="text-xl font-bold text-secondary" />
            </div>
            <Button
              onClick={async () => {
                await shoppingListService.setStatus(list.id, "shopping");
                navigate({ to: "/shopping-lists/$listId/shop", params: { listId: list.id } });
              }}
              className="rounded-full"
            >
              <ShoppingCart size={16} /> Start shopping
            </Button>
          </div>
        </div>
      )}

      <EditItemDialog item={editing} open={!!editing} onOpenChange={(v) => !v && setEditing(null)}
        onSave={async (patch) => { if (editing) { await shoppingItemService.update(editing.id, patch); toast.success("Updated"); } }} />
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