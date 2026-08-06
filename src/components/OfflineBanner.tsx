import { AnimatePresence, motion } from "framer-motion";
import { CloudOff, Loader2 } from "lucide-react";
import { useOnline, usePendingWrites } from "@/lib/offline";

export function OfflineBanner() {
  const online = useOnline();
  const pending = usePendingWrites();
  const syncing = online && pending > 0;
  const show = !online || syncing;

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.15 }}
            role="status"
            aria-live="polite"
            className="flex max-w-[80%] flex-col items-center gap-2 rounded-2xl bg-secondary px-5 py-4 text-center text-[12px] font-medium text-background shadow-[var(--shadow-elegant)]"
          >
            {online ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <CloudOff size={20} />
            )}
            <span>
              {online
                ? `Syncing ${pending} change${pending === 1 ? "" : "s"}…`
                : "Offline — changes are saved on this device and sync automatically"}
            </span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
