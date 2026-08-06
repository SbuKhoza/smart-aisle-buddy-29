import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase-auth";
import { shoppingItemService, shoppingListService } from "@/lib/services/shopping";
import type { ShoppingItem, ShoppingList } from "@/models";

const cacheKey = (listId: string) => `aislespy:list-cache:${listId}`;

function readCache(listId: string | undefined) {
  if (!listId || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(cacheKey(listId));
    return raw ? (JSON.parse(raw) as { list: ShoppingList | null; items: ShoppingItem[] }) : null;
  } catch {
    return null;
  }
}

function writeCache(listId: string, data: { list: ShoppingList | null; items: ShoppingItem[] }) {
  try {
    window.localStorage.setItem(cacheKey(listId), JSON.stringify(data));
  } catch {
    /* quota — ignore */
  }
}

export function useShoppingList(listId: string | undefined) {
  const { user } = useAuth();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Hydrate last known list + items instantly (offline / pending sync).
  useEffect(() => {
    const cached = readCache(listId);
    if (cached) {
      setList(cached.list);
      setItems(cached.items);
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [listId]);

  useEffect(() => {
    if (!user || !listId) return;
    let cancelled = false;
    shoppingListService.get(listId).then((l) => {
      if (!cancelled && l) setList(l);
    });
    const unsub = shoppingItemService.subscribe(user.uid, listId, (rows) => {
      setItems(rows);
      setLoading(false);
    });
    return () => { cancelled = true; unsub(); };
  }, [user, listId]);

  // Persist latest snapshot so totals survive reloads while offline.
  useEffect(() => {
    if (!listId || loading) return;
    writeCache(listId, { list, items });
  }, [listId, list, items, loading]);

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