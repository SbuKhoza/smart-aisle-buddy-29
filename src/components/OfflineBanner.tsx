import { AnimatePresence, motion } from "framer-motion";
import { CloudOff, RefreshCw } from "lucide-react";
import { useOnline, usePendingWrites } from "@/lib/offline";

export function OfflineBanner() {
  const online = useOnline();
  const pending = usePendingWrites();
  const syncing = online && pending > 0;
  const show = !online || syncing;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-secondary px-3 py-1.5 text-[12px] font-medium text-background"
        >
          {online ? <RefreshCw size={13} className="animate-spin" /> : <CloudOff size={13} />}
          {online
            ? `Syncing ${pending} change${pending === 1 ? "" : "s"}…`
            : "Offline — changes are saved on this device and sync automatically"}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
