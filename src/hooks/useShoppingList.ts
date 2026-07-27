import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase-auth";
import { shoppingItemService, shoppingListService } from "@/lib/services/shopping";
import type { ShoppingItem, ShoppingList } from "@/models";

export function useShoppingList(listId: string | undefined) {
  const { user } = useAuth();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !listId) return;
    let cancelled = false;
    shoppingListService.get(listId).then((l) => {
      if (!cancelled) setList(l);
    });
    const unsub = shoppingItemService.subscribe(user.uid, listId, (rows) => {
      setItems(rows);
      setLoading(false);
    });
    return () => { cancelled = true; unsub(); };
  }, [user, listId]);

  // Keep list totals in sync
  useEffect(() => {
    if (!listId || !list) return;
    const est = items.reduce((s, i) => s + (Number(i.estimatedPrice) || 0) * (Number(i.quantity) || 0), 0);
    const act = items.filter((i) => i.purchased).reduce((s, i) => s + (Number(i.actualPrice ?? i.estimatedPrice) || 0) * (Number(i.quantity) || 0), 0);
    if ((list.itemCount ?? 0) !== items.length || Math.abs((list.estimatedTotal ?? 0) - est) > 0.01 || Math.abs((list.actualTotal ?? 0) - act) > 0.01) {
      shoppingListService.updateTotals(listId, items.length, est, act).catch(() => {});
      setList((prev) => (prev ? { ...prev, itemCount: items.length, estimatedTotal: est, actualTotal: act } : prev));
    }
  }, [items, listId, list]);

  async function refreshList() {
    if (!listId) return;
    const l = await shoppingListService.get(listId);
    setList(l);
  }

  return { list, items, loading, refreshList, setList };
}