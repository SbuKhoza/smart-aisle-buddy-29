import { useEffect, useMemo, useState } from "react";
import { adminProductService, adminStoreService } from "./services/admin";
import type { Product, Store } from "@/models";

type Subscribe<T> = (cb: (rows: T[]) => void, onError?: (e: Error) => void) => () => void;

function createFeed<T>(subscribe: Subscribe<T>) {
  let cache: T[] = [];
  let started = false;
  const listeners = new Set<(rows: T[]) => void>();

  return function useFeed(): T[] {
    const [rows, setRows] = useState<T[]>(cache);
    useEffect(() => {
      listeners.add(setRows);
      setRows(cache);
      if (!started) {
        started = true;
        try {
          subscribe(
            (r) => {
              cache = r;
              listeners.forEach((l) => l(r));
            },
            () => {},
          );
        } catch {
          started = false;
        }
      }
      return () => {
        listeners.delete(setRows);
      };
    }, []);
    return rows;
  };
}

/** All stores managed from the admin dashboard. */
export const useStores = createFeed<Store>((cb, onError) => adminStoreService.subscribe(cb, onError));

/** All products managed from the admin dashboard. */
export const useCatalogProducts = createFeed<Product>((cb, onError) =>
  adminProductService.subscribe(cb, onError),
);

export function useStoreProducts(storeId?: string | null): Product[] {
  const products = useCatalogProducts();
  return useMemo(
    () => (storeId ? products.filter((p) => p.storeId === storeId) : products),
    [products, storeId],
  );
}
