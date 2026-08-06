// Offline-first write queue helpers.
// Firestore already persists writes locally and replays them when the
// connection returns; these helpers make the UI never *wait* for the server.
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Listener = () => void;

let pending = 0;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribePending(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function getPendingCount() {
  return pending;
}

export function isOnline() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

/**
 * Fire a Firestore write without blocking the UI.
 * Offline the promise simply stays unresolved until sync — that's expected.
 */
export function queueWrite<T>(promise: Promise<T>): void {
  pending += 1;
  emit();
  promise
    .catch((err) => {
      if (isOnline()) {
        console.error("Write failed", err);
        toast.error("Couldn't save that change", {
          description: "We'll keep retrying — check your connection.",
        });
      }
    })
    .finally(() => {
      pending = Math.max(0, pending - 1);
      emit();
    });
}

export function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

export function usePendingWrites() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => setCount(getPendingCount());
    update();
    return subscribePending(update);
  }, []);
  return count;
}
