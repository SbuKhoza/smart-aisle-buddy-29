import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListChecks, Calendar, Wallet } from "lucide-react";
import type { ShoppingList } from "@/models";
import { motion } from "framer-motion";

function fmt(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function ShoppingListCard({ list, index = 0 }: { list: ShoppingList; index?: number }) {
  const status = list.status ?? (list.archived ? "archived" : "active");
  const badge =
    status === "shopping"
      ? { label: "Shopping", cls: "bg-primary/15 text-primary" }
      : status === "completed"
        ? { label: "Completed", cls: "bg-emerald-100 text-emerald-700" }
        : status === "archived"
          ? { label: "Archived", cls: "bg-slate-100 text-slate-600" }
          : { label: "Active", cls: "bg-sky-100 text-sky-700" };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
      <Link to="/shopping-lists/$listId" params={{ listId: list.id }}>
        <Card className="group h-full rounded-3xl border-border p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ListChecks size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-secondary line-clamp-1">{list.name}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar size={12} /> {fmt(list.createdAt)}
                </p>
              </div>
            </div>
            <Badge className={badge.cls} variant="secondary">{badge.label}</Badge>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Items</p>
              <p className="text-lg font-semibold text-secondary">{list.itemCount ?? 0}</p>
            </div>
            <div className="text-right">
              <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <Wallet size={12} /> Est. total
              </p>
              <p className="text-lg font-semibold text-primary">R {(list.estimatedTotal ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}