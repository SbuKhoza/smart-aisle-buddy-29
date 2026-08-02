import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Plus, Archive, Copy, Trash2, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/firebase-auth";
import { shoppingListService } from "@/lib/services/shopping";
import type { ShoppingList } from "@/models";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingListCard } from "@/components/shopping/ShoppingListCard";
import { CreateListDialog, type CreateListInput } from "@/components/shopping/CreateListDialog";
import { ConfirmDialog } from "@/components/shopping/ConfirmDialog";
import { FloatingAddButton } from "@/components/shopping/FloatingAddButton";
import { EmptyState } from "@/components/EmptyState";
import { ListChecks } from "lucide-react";

export const Route = createFileRoute("/_authenticated/shopping-lists/")({
  component: ShoppingListsPage,
});

function ShoppingListsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [sort, setSort] = useState<"updated" | "name" | "total">("updated");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState<ShoppingList | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = shoppingListService.subscribe(user.uid, (rows) => {
      setLists(rows);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    let rows = lists.filter((l) => (tab === "archived" ? l.status === "archived" || l.archived : (l.status ?? "active") !== "archived"));
    if (term) rows = rows.filter((l) => l.name.toLowerCase().includes(term));
    rows = [...rows].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "total") return (b.estimatedTotal ?? 0) - (a.estimatedTotal ?? 0);
      return (b.updatedAt || "").localeCompare(a.updatedAt || "");
    });
    return rows;
  }, [lists, query, tab, sort]);

  async function handleCreate(input: CreateListInput) {
    if (!user) return;
    const id = await shoppingListService.create(user.uid, input.name, {
      storeId: input.storeId,
      storeName: input.storeName,
      mode: input.mode,
    });
    toast.success("List created");
    navigate({ to: "/shopping-lists/$listId", params: { listId: id } });
  }

  async function handleDuplicate(list: ShoppingList) {
    if (!user) return;
    const id = await shoppingListService.duplicate(user.uid, list.id);
    toast.success("List duplicated");
    navigate({ to: "/shopping-lists/$listId", params: { listId: id } });
  }

  async function handleArchiveToggle(list: ShoppingList) {
    if (list.status === "archived" || list.archived) {
      await shoppingListService.unarchive(list.id);
      toast.success("Restored");
    } else {
      await shoppingListService.archive(list.id);
      toast.success("Archived");
    }
  }

  async function handleDelete() {
    if (!user || !deleting) return;
    await shoppingListService.remove(deleting.id, user.uid);
    toast.success("List deleted");
    setDeleting(null);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-5 md:px-8 md:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-secondary md:text-2xl">Shopping Lists</h1>
          <p className="mt-1 text-sm text-muted-foreground">Plan, track and reuse your grocery lists.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="hidden md:inline-flex">
          <Plus size={16} /> New list
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search lists…" className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-muted-foreground" />
          <Select value={sort} onValueChange={(v: any) => setSort(v)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Recently updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="total">Estimated total</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mb-4">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ListChecks />}
          title={query ? "No lists match your search" : tab === "archived" ? "Nothing archived" : "No lists yet"}
          body={tab === "archived" ? "Archived lists show up here so your active view stays tidy." : "Create your first list to start planning."}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AnimatePresence>
            {filtered.map((list, i) => (
              <motion.div key={list.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative">
                <ShoppingListCard list={list} index={i} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/70 text-muted-foreground hover:bg-accent hover:text-foreground">
                      <MoreHorizontal size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDuplicate(list)}>
                      <Copy size={14} className="mr-2" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleArchiveToggle(list)}>
                      <Archive size={14} className="mr-2" />
                      {list.status === "archived" || list.archived ? "Unarchive" : "Archive"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleting(list)} className="text-destructive">
                      <Trash2 size={14} className="mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <FloatingAddButton onClick={() => setCreateOpen(true)} label="New list" />
      <CreateListDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={handleCreate} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete this list?"
        description="This will permanently remove the list and all of its items."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}