import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Store as StoreIcon, Package, Tag, Trash2, ShieldAlert, Pencil, X, LogOut } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "firebase/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// ...(keep all your existing imports: Input, Label, Switch, Tabs, Select, CATEGORIES, types, FullScreenLoader)
import { useIsAdmin } from "@/lib/use-admin";
import { useAuth } from "@/lib/firebase-auth";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  adminProductService,
  adminStoreService,
  promotionsService,
} from "@/lib/services/admin";
import { CATEGORIES } from "@/constants/categories";
import type { Product, Promotion, Store } from "@/models";
import { FullScreenLoader } from "@/components/FullScreenLoader";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin — AISLE SPY" },
      { name: "description", content: "Manage stores, products and specials shown across AISLE SPY." },
      { property: "og:title", content: "Admin — AISLE SPY" },
      { property: "og:description", content: "Manage stores, products and specials shown across AISLE SPY." },
    ],
  }),
  component: AdminPage,
});

const today = () => new Date().toISOString().slice(0, 10);
const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

function SectionCard({ children }: { children: React.ReactNode }) {
  return <Card className="rounded-2xl border-border p-3.5 shadow-[var(--shadow-card)]">{children}</Card>;
}

function AdminPage() {
  const { user, ready } = useAuth();
  const { isAdmin, checked } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready || !checked) return;
    if (!user) {
      navigate({ to: "/admin/login", replace: true });
    }
  }, [ready, checked, user, navigate]);

  if (!ready || !checked || !user) return <FullScreenLoader />;

  if (!isAdmin) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-12 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert size={22} />
        </div>
        <h1 className="text-[18px] font-bold text-secondary">Admin access required</h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          This account isn't in the <span className="font-medium text-secondary">admins</span> collection. Add a
          document with the ID below to grant access.
        </p>
        <code className="mt-3 inline-block break-all rounded-lg bg-accent px-2.5 py-1.5 text-[12px]">
          {user.uid}
        </code>
        <Button
          variant="ghost"
          className="mt-4 h-9 text-[13px]"
          onClick={async () => {
            await signOut(getFirebaseAuth());
            navigate({ to: "/admin/login", replace: true });
          }}
        >
          <LogOut size={14} className="mr-1.5" /> Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex items-start justify-between"
      >
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-secondary">Admin</h1>
          <p className="text-[13px] text-muted-foreground">Manage stores, products and specials.</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-[12px]"
          onClick={async () => {
            await signOut(getFirebaseAuth());
            navigate({ to: "/admin/login", replace: true });
          }}
        >
          <LogOut size={13} className="mr-1.5" /> Sign out
        </Button>
      </motion.div>

      {/* ...keep your existing <Tabs> block with StoresTab / ProductsTab / SpecialsTab exactly as-is... */}
    </div>
  );
}

/* Keep StoresTab, ProductsTab, SpecialsTab exactly as you already have them below this point. */