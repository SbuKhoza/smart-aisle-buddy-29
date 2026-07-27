import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function FloatingAddButton({
  onClick,
  label = "Add",
  className,
}: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        "fixed bottom-24 right-5 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] md:bottom-8 md:right-8",
        className,
      )}
    >
      <Plus size={18} /> {label}
    </motion.button>
  );
}