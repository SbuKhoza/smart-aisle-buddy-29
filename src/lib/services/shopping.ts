import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "../firebase";
import type {
  ShoppingList,
  ShoppingItem,
  ShoppingHistoryEntry,
  UserProduct,
  FavouriteProduct,
} from "@/models";

const LISTS = "shoppingLists";
const ITEMS = "shoppingItems";
const HISTORY = "shoppingHistory";
const USER_PRODUCTS = "userProducts";
const FAVS = "userFavourites";

function nowIso() {
  return new Date().toISOString();
}

// ------------------------- Shopping Lists -------------------------

export const shoppingListService = {
  subscribe(
    userId: string,
    cb: (lists: ShoppingList[]) => void,
    onError?: (e: Error) => void,
  ): Unsubscribe {
    const q = query(collection(getDb(), LISTS), where("userId", "==", userId));
    return onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ShoppingList[];
        rows.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
        cb(rows);
      },
      (err) => onError?.(err),
    );
  },

  async get(id: string): Promise<ShoppingList | null> {
    const snap = await getDoc(doc(getDb(), LISTS, id));
    return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) } as ShoppingList) : null;
  },

  async create(userId: string, name: string, budget?: number): Promise<string> {
    const ref = await addDoc(collection(getDb(), LISTS), {
      userId,
      name: name.trim(),
      status: "active",
      archived: false,
      itemCount: 0,
      estimatedTotal: 0,
      actualTotal: 0,
      budget: budget ?? null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
    return ref.id;
  },

  async rename(id: string, name: string) {
    await updateDoc(doc(getDb(), LISTS, id), { name: name.trim(), updatedAt: nowIso() });
  },

  async setBudget(id: string, budget: number | null) {
    await updateDoc(doc(getDb(), LISTS, id), { budget, updatedAt: nowIso() });
  },

  async setStatus(id: string, status: ShoppingList["status"]) {
    await updateDoc(doc(getDb(), LISTS, id), {
      status,
      archived: status === "archived",
      updatedAt: nowIso(),
    });
  },

  async archive(id: string) {
    await this.setStatus(id, "archived");
  },

  async unarchive(id: string) {
    await this.setStatus(id, "active");
  },

  async remove(id: string, userId: string) {
    // Delete list + items
    const itemsSnap = await getDocs(
      query(collection(getDb(), ITEMS), where("listId", "==", id), where("userId", "==", userId)),
    );
    const batch = writeBatch(getDb());
    itemsSnap.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(doc(getDb(), LISTS, id));
    await batch.commit();
  },

  async duplicate(userId: string, sourceId: string, newName?: string): Promise<string> {
    const src = await this.get(sourceId);
    if (!src) throw new Error("List not found");
    const newId = await this.create(userId, newName || `${src.name} (Copy)`, src.budget);
    const items = await shoppingItemService.listOnce(userId, sourceId);
    await shoppingItemService.bulkAdd(
      userId,
      newId,
      items.map((i) => ({
        name: i.name,
        brand: i.brand,
        category: i.category,
        productId: i.productId,
        quantity: i.quantity,
        unit: i.unit,
        estimatedPrice: i.estimatedPrice,
        notes: i.notes,
      })),
    );
    return newId;
  },

  async updateTotals(id: string, itemCount: number, estimatedTotal: number, actualTotal: number) {
    await updateDoc(doc(getDb(), LISTS, id), {
      itemCount,
      estimatedTotal,
      actualTotal,
      updatedAt: nowIso(),
    });
  },
};

// ------------------------- Shopping Items -------------------------

export interface NewItemInput {
  name: string;
  brand?: string;
  category?: string;
  productId?: string;
  quantity: number;
  unit?: string;
  estimatedPrice?: number;
  notes?: string;
}

export const shoppingItemService = {
  subscribe(
    userId: string,
    listId: string,
    cb: (items: ShoppingItem[]) => void,
    onError?: (e: Error) => void,
  ): Unsubscribe {
    const q = query(
      collection(getDb(), ITEMS),
      where("userId", "==", userId),
      where("listId", "==", listId),
    );
    return onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ShoppingItem[];
        rows.sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.createdAt || "").localeCompare(b.createdAt || ""),
        );
        cb(rows);
      },
      (err) => onError?.(err),
    );
  },

  async listOnce(userId: string, listId: string): Promise<ShoppingItem[]> {
    const snap = await getDocs(
      query(
        collection(getDb(), ITEMS),
        where("userId", "==", userId),
        where("listId", "==", listId),
      ),
    );
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ShoppingItem[];
  },

  async add(userId: string, listId: string, input: NewItemInput): Promise<string> {
    const ref = await addDoc(collection(getDb(), ITEMS), {
      userId,
      listId,
      productId: input.productId ?? null,
      name: input.name.trim(),
      brand: input.brand ?? null,
      category: input.category ?? "other",
      quantity: Math.max(0.001, Number(input.quantity) || 1),
      unit: input.unit || "pcs",
      estimatedPrice: Math.max(0, Number(input.estimatedPrice) || 0),
      actualPrice: null,
      purchased: false,
      notes: input.notes ?? null,
      order: Date.now(),
      createdAt: nowIso(),
    });
    return ref.id;
  },

  async bulkAdd(userId: string, listId: string, inputs: NewItemInput[]) {
    const batch = writeBatch(getDb());
    const now = Date.now();
    inputs.forEach((input, i) => {
      const ref = doc(collection(getDb(), ITEMS));
      batch.set(ref, {
        userId,
        listId,
        productId: input.productId ?? null,
        name: input.name.trim(),
        brand: input.brand ?? null,
        category: input.category ?? "other",
        quantity: Math.max(0.001, Number(input.quantity) || 1),
        unit: input.unit || "pcs",
        estimatedPrice: Math.max(0, Number(input.estimatedPrice) || 0),
        actualPrice: null,
        purchased: false,
        notes: input.notes ?? null,
        order: now + i,
        createdAt: nowIso(),
      });
    });
    await batch.commit();
  },

  async update(id: string, patch: Partial<ShoppingItem>) {
    await updateDoc(doc(getDb(), ITEMS, id), patch as any);
  },

  async togglePurchased(id: string, purchased: boolean) {
    await updateDoc(doc(getDb(), ITEMS, id), { purchased });
  },

  async setActualPrice(id: string, price: number | null) {
    await updateDoc(doc(getDb(), ITEMS, id), { actualPrice: price });
  },

  async remove(id: string) {
    await deleteDoc(doc(getDb(), ITEMS, id));
  },
};

// ------------------------- History -------------------------

export interface SaveTripInput {
  listId: string;
  name: string;
  items: ShoppingItem[];
  budget?: number | null;
  storeName?: string;
}

export const historyService = {
  subscribe(
    userId: string,
    cb: (trips: ShoppingHistoryEntry[]) => void,
    onError?: (e: Error) => void,
  ): Unsubscribe {
    const q = query(collection(getDb(), HISTORY), where("userId", "==", userId));
    return onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ShoppingHistoryEntry[];
        rows.sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""));
        cb(rows);
      },
      (err) => onError?.(err),
    );
  },

  async get(id: string): Promise<ShoppingHistoryEntry | null> {
    const snap = await getDoc(doc(getDb(), HISTORY, id));
    return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) } as ShoppingHistoryEntry) : null;
  },

  async saveTrip(userId: string, input: SaveTripInput): Promise<string> {
    const purchasedItems = input.items.filter((i) => i.purchased);
    const estimatedTotal = input.items.reduce(
      (s, i) => s + (Number(i.estimatedPrice) || 0) * (Number(i.quantity) || 0),
      0,
    );
    const actualTotal = purchasedItems.reduce(
      (s, i) => s + (Number(i.actualPrice ?? i.estimatedPrice) || 0) * (Number(i.quantity) || 0),
      0,
    );
    const ref = await addDoc(collection(getDb(), HISTORY), {
      userId,
      listId: input.listId,
      name: input.name,
      storeName: input.storeName ?? null,
      total: actualTotal,
      estimatedTotal,
      actualTotal,
      budget: input.budget ?? null,
      itemCount: input.items.length,
      purchasedCount: purchasedItems.length,
      completedAt: nowIso(),
      items: input.items.map((i) => ({
        id: i.id,
        productId: i.productId ?? null,
        name: i.name,
        brand: i.brand ?? null,
        category: i.category ?? "other",
        quantity: i.quantity,
        unit: i.unit,
        estimatedPrice: i.estimatedPrice ?? 0,
        actualPrice: i.actualPrice ?? null,
        purchased: !!i.purchased,
      })),
    });
    // Mark list completed
    await shoppingListService.setStatus(input.listId, "completed");
    return ref.id;
  },

  async remove(id: string) {
    await deleteDoc(doc(getDb(), HISTORY, id));
  },

  async duplicateToList(userId: string, tripId: string): Promise<string> {
    const trip = await this.get(tripId);
    if (!trip) throw new Error("Trip not found");
    const name = trip.name || "Shopping trip";
    const newListId = await shoppingListService.create(userId, `${name} (Reused)`, trip.budget || undefined);
    if (trip.items?.length) {
      await shoppingItemService.bulkAdd(
        userId,
        newListId,
        trip.items.map((i) => ({
          name: i.name,
          brand: i.brand,
          category: i.category,
          productId: i.productId,
          quantity: i.quantity,
          unit: i.unit || "pcs",
          estimatedPrice: i.estimatedPrice ?? 0,
          notes: i.notes,
        })),
      );
    }
    return newListId;
  },
};

// ------------------------- Favourites -------------------------

export const favouriteService = {
  subscribe(
    userId: string,
    cb: (favs: FavouriteProduct[]) => void,
    onError?: (e: Error) => void,
  ): Unsubscribe {
    const q = query(collection(getDb(), FAVS), where("userId", "==", userId));
    return onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as FavouriteProduct[];
        rows.sort((a, b) => (b.addedAt || "").localeCompare(a.addedAt || ""));
        cb(rows);
      },
      (err) => onError?.(err),
    );
  },

  async listOnce(userId: string): Promise<FavouriteProduct[]> {
    const snap = await getDocs(query(collection(getDb(), FAVS), where("userId", "==", userId)));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as FavouriteProduct[];
  },

  async add(userId: string, fav: Omit<FavouriteProduct, "id" | "userId" | "addedAt">): Promise<string> {
    const existing = await getDocs(
      query(
        collection(getDb(), FAVS),
        where("userId", "==", userId),
        where("productId", "==", fav.productId),
      ),
    );
    if (!existing.empty) return existing.docs[0].id;
    const ref = await addDoc(collection(getDb(), FAVS), {
      ...fav,
      userId,
      addedAt: nowIso(),
    });
    return ref.id;
  },

  async removeByProductId(userId: string, productId: string) {
    const snap = await getDocs(
      query(
        collection(getDb(), FAVS),
        where("userId", "==", userId),
        where("productId", "==", productId),
      ),
    );
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  },

  async remove(id: string) {
    await deleteDoc(doc(getDb(), FAVS, id));
  },
};

// ------------------------- User Products -------------------------

export const userProductService = {
  subscribe(
    userId: string,
    cb: (products: UserProduct[]) => void,
    onError?: (e: Error) => void,
  ): Unsubscribe {
    const q = query(collection(getDb(), USER_PRODUCTS), where("userId", "==", userId));
    return onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as UserProduct[];
        rows.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        cb(rows);
      },
      (err) => onError?.(err),
    );
  },

  async create(userId: string, input: Omit<UserProduct, "id" | "userId" | "createdAt">): Promise<string> {
    const ref = await addDoc(collection(getDb(), USER_PRODUCTS), {
      ...input,
      userId,
      createdAt: nowIso(),
    });
    return ref.id;
  },

  async remove(id: string) {
    await deleteDoc(doc(getDb(), USER_PRODUCTS, id));
  },
};

// ------------------------- Budget -------------------------

export type BudgetStatus = "safe" | "warn" | "over";

export function budgetStatus(estimated: number, budget: number | null | undefined): BudgetStatus {
  if (!budget || budget <= 0) return "safe";
  const ratio = estimated / budget;
  if (ratio > 1) return "over";
  if (ratio >= 0.8) return "warn";
  return "safe";
}

export function budgetColor(status: BudgetStatus): string {
  return status === "over"
    ? "text-red-600"
    : status === "warn"
      ? "text-orange-500"
      : "text-emerald-600";
}

// ------------------------- Future-ready stubs -------------------------
// These are intentional no-ops to keep architecture forward-compatible.

export const priceComparisonService = { compare: async (_productId: string) => [] as unknown[] };
export const catalogueMatchService = { match: async (_productId: string) => [] as unknown[] };
export const crowdsourcedPriceService = { submit: async (_p: unknown) => undefined };
export const barcodeService = { lookup: async (_barcode: string) => null };
export const receiptService = { parse: async (_file: File) => [] as unknown[] };
export const recommendationService = { forUser: async (_userId: string) => [] as unknown[] };
export const aiAssistantService = { suggest: async (_q: string) => [] as unknown[] };