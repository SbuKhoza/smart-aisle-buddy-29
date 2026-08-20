import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "../firebase";
import { queueWrite } from "../offline";
import type { Product, Promotion, Store } from "@/models";

const STORES = "stores";
const PRODUCTS = "products";
const PROMOTIONS = "promotions";
const ADMINS = "admins";

const nowIso = () => new Date().toISOString();

export async function isAdminUser(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(getDb(), ADMINS, uid));
    return snap.exists();
  } catch {
    return false;
  }
}

export const adminStoreService = {
  subscribe(cb: (rows: Store[]) => void, onError?: (e: Error) => void): Unsubscribe {
    return onSnapshot(
      collection(getDb(), STORES),
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Store[];
        rows.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        cb(rows);
      },
      (e) => onError?.(e),
    );
  },
  save(store: Omit<Store, "id"> & { id?: string }): string {
    const ref = store.id
      ? doc(getDb(), STORES, store.id)
      : doc(collection(getDb(), STORES));
    queueWrite(
      setDoc(
        ref,
        { ...store, id: ref.id, createdAt: store.createdAt ?? nowIso() },
        { merge: true },
      ),
    );
    return ref.id;
  },
  remove(id: string) {
    queueWrite(deleteDoc(doc(getDb(), STORES, id)));
  },
};

export const adminProductService = {
  subscribe(cb: (rows: Product[]) => void, onError?: (e: Error) => void): Unsubscribe {
    return onSnapshot(
      collection(getDb(), PRODUCTS),
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Product[];
        rows.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        cb(rows);
      },
      (e) => onError?.(e),
    );
  },
  subscribeByStore(storeId: string, cb: (rows: Product[]) => void): Unsubscribe {
    return onSnapshot(query(collection(getDb(), PRODUCTS), where("storeId", "==", storeId)), (snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Product[]);
    });
  },
  save(product: Omit<Product, "id"> & { id?: string }): string {
    const ref = product.id
      ? doc(getDb(), PRODUCTS, product.id)
      : doc(collection(getDb(), PRODUCTS));
    queueWrite(
      setDoc(
        ref,
        { ...product, id: ref.id, createdAt: product.createdAt ?? nowIso() },
        { merge: true },
      ),
    );
    return ref.id;
  },
  remove(id: string) {
    queueWrite(deleteDoc(doc(getDb(), PRODUCTS, id)));
  },
};

export const promotionsService = {
  async get(id: string): Promise<Promotion | null> {
    const snap = await getDoc(doc(getDb(), PROMOTIONS, id));
    return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) } as Promotion) : null;
  },
  subscribeAll(cb: (rows: Promotion[]) => void, onError?: (e: Error) => void): Unsubscribe {
    return onSnapshot(
      collection(getDb(), PROMOTIONS),
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Promotion[];
        rows.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        cb(rows);
      },
      (e) => onError?.(e),
    );
  },
  save(promo: Omit<Promotion, "id"> & { id?: string }): string {
    const ref = promo.id
      ? doc(getDb(), PROMOTIONS, promo.id)
      : doc(collection(getDb(), PROMOTIONS));
    queueWrite(
      setDoc(
        ref,
        {
          ...promo,
          id: ref.id,
          createdAt: promo.createdAt ?? nowIso(),
          updatedAt: nowIso(),
        },
        { merge: true },
      ),
    );
    return ref.id;
  },
  setActive(id: string, active: boolean) {
    queueWrite(updateDoc(doc(getDb(), PROMOTIONS, id), { active, updatedAt: nowIso() }));
  },
  remove(id: string) {
    queueWrite(deleteDoc(doc(getDb(), PROMOTIONS, id)));
  },
};

export function isPromotionLive(p: Promotion, at = new Date()): boolean {
  if (p.active === false) return false;
  const from = p.validFrom ? new Date(p.validFrom) : null;
  const to = p.validTo ? new Date(p.validTo) : null;
  if (from && at < from) return false;
  if (to && at > new Date(to.getTime() + 86_400_000 - 1)) return false;
  return true;
}