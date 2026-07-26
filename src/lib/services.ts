// Service layer. Phase 1 implements auth+profile paths; others are stubbed.
import { getDb, getStorageBucket } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type {
  Product,
  Price,
  ShoppingList,
  Promotion,
  Catalogue,
  Notification,
  Store,
} from "@/models";

export const firestoreService = {
  async getById<T>(coll: string, id: string): Promise<T | null> {
    const snap = await getDoc(doc(getDb(), coll, id));
    return snap.exists() ? (snap.data() as T) : null;
  },
  async list<T>(coll: string): Promise<T[]> {
    const snap = await getDocs(collection(getDb(), coll));
    return snap.docs.map((d) => d.data() as T);
  },
  async listWhere<T>(coll: string, field: string, value: unknown): Promise<T[]> {
    const q = query(collection(getDb(), coll), where(field, "==", value));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as T);
  },
  async upsert<T extends { id: string }>(coll: string, entity: T): Promise<void> {
    await setDoc(doc(getDb(), coll, entity.id), entity, { merge: true });
  },
};

export const storageService = {
  async upload(path: string, file: File): Promise<string> {
    const r = ref(getStorageBucket(), path);
    await uploadBytes(r, file);
    return getDownloadURL(r);
  },
};

export const locationService = {
  async requestPermission(): Promise<GeolocationPosition | null> {
    if (typeof navigator === "undefined" || !navigator.geolocation) return null;
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        () => resolve(null),
        { timeout: 8000 },
      );
    });
  },
};

export const productService = {
  get: (id: string) => firestoreService.getById<Product>("products", id),
  list: () => firestoreService.list<Product>("products"),
};
export const priceService = {
  forProduct: (productId: string) =>
    firestoreService.listWhere<Price>("prices", "productId", productId),
};
export const shoppingService = {
  listsForUser: (userId: string) =>
    firestoreService.listWhere<ShoppingList>("shoppingLists", "userId", userId),
};
export const catalogueService = {
  forStore: (storeId: string) =>
    firestoreService.listWhere<Catalogue>("catalogues", "storeId", storeId),
};
export const promotionService = {
  forStore: (storeId: string) =>
    firestoreService.listWhere<Promotion>("promotions", "storeId", storeId),
};
export const storeService = {
  list: () => firestoreService.list<Store>("stores"),
};
export const notificationService = {
  forUser: (userId: string) =>
    firestoreService.listWhere<Notification>("notifications", "userId", userId),
};