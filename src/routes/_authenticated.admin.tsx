import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Store as StoreIcon, Package, Tag, Trash2, ShieldAlert, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsAdmin } from "@/lib/use-admin";
import { useAuth } from "@/lib/firebase-auth";
import {
  adminProductService,
  adminStoreService,
  promotionsService,
} from "@/lib/services/admin";
import { CATEGORIES } from "@/constants/categories";
import type { Product, Promotion, Store } from "@/models";
import { FullScreenLoader } from "@/components/FullScreenLoader";

export const Route = createFileRoute("/_authenticated/admin")({
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
  const { user } = useAuth();
  const { isAdmin, checked } = useIsAdmin();

  if (!checked) return <FullScreenLoader />;

  if (!isAdmin) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-12 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert size={22} />
        </div>
        <h1 className="text-[18px] font-bold text-secondary">Admin access required</h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          This area is restricted. To grant access, add a document with the ID below to the{" "}
          <span className="font-medium text-secondary">admins</span> collection.
        </p>
        <code className="mt-3 inline-block break-all rounded-lg bg-accent px-2.5 py-1.5 text-[12px]">
          {user?.uid ?? "—"}
        </code>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8 md:py-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <h1 className="text-[22px] font-bold tracking-tight text-secondary">Admin</h1>
        <p className="text-[13px] text-muted-foreground">Manage stores, products and specials.</p>
      </motion.div>

      <Tabs defaultValue="stores">
        <TabsList className="mb-3 grid w-full grid-cols-3">
          <TabsTrigger value="stores" className="text-[13px]">
            <StoreIcon size={14} className="mr-1.5" /> Stores
          </TabsTrigger>
          <TabsTrigger value="products" className="text-[13px]">
            <Package size={14} className="mr-1.5" /> Products
          </TabsTrigger>
          <TabsTrigger value="specials" className="text-[13px]">
            <Tag size={14} className="mr-1.5" /> Specials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stores"><StoresTab /></TabsContent>
        <TabsContent value="products"><ProductsTab /></TabsContent>
        <TabsContent value="specials"><SpecialsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ------------------------------- Stores ------------------------------- */

function StoresTab() {
  const [stores, setStores] = useState<Store[]>([]);
  const [name, setName] = useState("");
  const [logoURL, setLogoURL] = useState("");
  const [colour, setColour] = useState("#10b981");
  const [editing, setEditing] = useState<Store | null>(null);

  useEffect(() => adminStoreService.subscribe(setStores, () => toast.error("Could not load stores")), []);

  function reset() {
    setEditing(null);
    setName("");
    setLogoURL("");
    setColour("#10b981");
  }

  function save() {
    if (!name.trim()) return toast.error("Store name is required");
    adminStoreService.save({
      id: editing?.id,
      name: name.trim(),
      logoURL: logoURL.trim() || undefined,
      colour,
      initials: name.trim().slice(0, 2).toUpperCase(),
      country: "ZA",
    });
    toast.success(editing ? "Store updated" : "Store added");
    reset();
  }

  return (
    <div className="space-y-3">
      <SectionCard>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-secondary">{editing ? "Edit store" : "Add store"}</p>
          {editing && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" onClick={reset}>
              <X size={13} className="mr-1" /> Cancel
            </Button>
          )}
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-[12px]">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Shoprite" className="h-9 text-[14px]" />
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Logo URL (optional)</Label>
            <Input value={logoURL} onChange={(e) => setLogoURL(e.target.value)} placeholder="https://…" className="h-9 text-[14px]" />
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Brand colour</Label>
            <Input type="color" value={colour} onChange={(e) => setColour(e.target.value)} className="h-9 w-20 p-1" />
          </div>
        </div>
        <Button onClick={save} className="mt-3 h-9 w-full text-[14px] sm:w-auto">
          <Plus size={15} className="mr-1.5" /> {editing ? "Save store" : "Add store"}
        </Button>
      </SectionCard>

      <SectionCard>
        <p className="mb-2 text-[13px] font-semibold text-secondary">Stores ({stores.length})</p>
        {stores.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-muted-foreground">No stores yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {stores.map((s) => (
              <li key={s.id} className="flex items-center gap-2.5 py-2">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: s.colour || "#64748B" }}
                >
                  {s.initials || s.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate text-[14px] text-secondary">{s.name}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                  setEditing(s); setName(s.name); setLogoURL(s.logoURL || ""); setColour(s.colour || "#10b981");
                }}>
                  <Pencil size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                  adminStoreService.remove(s.id); toast.success("Store removed");
                }}>
                  <Trash2 size={14} />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

/* ------------------------------ Products ------------------------------ */

function ProductsTab() {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [form, setForm] = useState({ name: "", brand: "", category: "other", unit: "pcs", price: "", storeId: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => adminStoreService.subscribe(setStores), []);
  useEffect(() => adminProductService.subscribe(setProducts, () => toast.error("Could not load products")), []);

  const visible = useMemo(
    () => (storeFilter === "all" ? products : products.filter((p) => p.storeId === storeFilter)),
    [products, storeFilter],
  );

  function reset() {
    setEditingId(null);
    setForm({ name: "", brand: "", category: "other", unit: "pcs", price: "", storeId: form.storeId });
  }

  function save() {
    if (!form.name.trim()) return toast.error("Product name is required");
    if (!form.storeId) return toast.error("Pick a store");
    const store = stores.find((s) => s.id === form.storeId);
    adminProductService.save({
      id: editingId ?? undefined,
      name: form.name.trim(),
      brand: form.brand.trim() || undefined,
      category: form.category,
      unit: form.unit,
      price: form.price === "" ? null : Number(form.price),
      storeId: form.storeId,
      storeName: store?.name,
    });
    toast.success(editingId ? "Product updated" : "Product added");
    reset();
  }

  return (
    <div className="space-y-3">
      <SectionCard>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-secondary">{editingId ? "Edit product" : "Add product"}</p>
          {editingId && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" onClick={reset}>
              <X size={13} className="mr-1" /> Cancel
            </Button>
          )}
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-[12px]">Store</Label>
            <Select value={form.storeId} onValueChange={(v) => setForm({ ...form, storeId: v })}>
              <SelectTrigger className="h-9 text-[14px]"><SelectValue placeholder="Select store" /></SelectTrigger>
              <SelectContent>
                {stores.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full cream milk 2L" className="h-9 text-[14px]" />
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Brand</Label>
            <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="h-9 text-[14px]" />
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="h-9 text-[14px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c: any) => (
                  <SelectItem key={c.id ?? c} value={c.id ?? c}>{c.label ?? c.name ?? c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Unit</Label>
            <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="h-9 text-[14px]" />
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Price (R)</Label>
            <Input value={form.price} inputMode="decimal" onChange={(e) => setForm({ ...form, price: e.target.value })} className="h-9 text-[14px]" />
          </div>
        </div>
        <Button onClick={save} className="mt-3 h-9 w-full text-[14px] sm:w-auto">
          <Plus size={15} className="mr-1.5" /> {editingId ? "Save product" : "Add product"}
        </Button>
      </SectionCard>

      <SectionCard>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[13px] font-semibold text-secondary">Products ({visible.length})</p>
          <Select value={storeFilter} onValueChange={setStoreFilter}>
            <SelectTrigger className="h-8 w-40 text-[12px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stores</SelectItem>
              {stores.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {visible.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-muted-foreground">No products yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((p) => (
              <li key={p.id} className="flex items-center gap-2 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] text-secondary">{p.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {[p.storeName, p.brand, p.category].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {p.price != null && <span className="text-[13px] font-semibold text-secondary">R{Number(p.price).toFixed(2)}</span>}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                  setEditingId(p.id);
                  setForm({
                    name: p.name, brand: p.brand ?? "", category: p.category ?? "other",
                    unit: p.unit ?? "pcs", price: p.price == null ? "" : String(p.price), storeId: p.storeId ?? "",
                  });
                }}>
                  <Pencil size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                  adminProductService.remove(p.id); toast.success("Product removed");
                }}>
                  <Trash2 size={14} />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

/* ------------------------------ Specials ------------------------------ */

function SpecialsTab() {
  const [stores, setStores] = useState<Store[]>([]);
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", tag: "This week", storeId: "", description: "",
    validFrom: today(), validTo: inDays(7), active: true,
  });

  useEffect(() => adminStoreService.subscribe(setStores), []);
  useEffect(() => promotionsService.subscribeAll(setPromos, () => toast.error("Could not load specials")), []);

  function reset() {
    setEditingId(null);
    setForm({ title: "", tag: "This week", storeId: "", description: "", validFrom: today(), validTo: inDays(7), active: true });
  }

  function save() {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.storeId) return toast.error("Pick a store");
    const store = stores.find((s) => s.id === form.storeId);
    promotionsService.save({
      id: editingId ?? undefined,
      title: form.title.trim(),
      tag: form.tag.trim() || undefined,
      description: form.description.trim() || undefined,
      storeId: form.storeId,
      storeName: store?.name,
      validFrom: form.validFrom,
      validTo: form.validTo,
      active: form.active,
    });
    toast.success(editingId ? "Special updated" : "Special published to the carousel");
    reset();
  }

  return (
    <div className="space-y-3">
      <SectionCard>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-secondary">{editingId ? "Edit special" : "Add special / sale deal"}</p>
          {editingId && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" onClick={reset}>
              <X size={13} className="mr-1" /> Cancel
            </Button>
          )}
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-[12px]">Store</Label>
            <Select value={form.storeId} onValueChange={(v) => setForm({ ...form, storeId: v })}>
              <SelectTrigger className="h-9 text-[14px]"><SelectValue placeholder="Select store" /></SelectTrigger>
              <SelectContent>
                {stores.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Extra 15% off fresh spreads" className="h-9 text-[14px]" />
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Badge</Label>
            <Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="Limited time only" className="h-9 text-[14px]" />
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Description (optional)</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-9 text-[14px]" />
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Valid from</Label>
            <Input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="h-9 text-[14px]" />
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Valid to</Label>
            <Input type="date" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} className="h-9 text-[14px]" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-accent/50 px-3 py-2">
          <span className="text-[13px] text-secondary">Show on dashboard carousel</span>
          <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
        </div>
        <Button onClick={save} className="mt-3 h-9 w-full text-[14px] sm:w-auto">
          <Plus size={15} className="mr-1.5" /> {editingId ? "Save special" : "Publish special"}
        </Button>
      </SectionCard>

      <SectionCard>
        <p className="mb-2 text-[13px] font-semibold text-secondary">Specials ({promos.length})</p>
        {promos.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-muted-foreground">No specials yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {promos.map((p) => (
              <li key={p.id} className="flex items-center gap-2 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] text-secondary">{p.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {[p.storeName, p.tag, `${p.validFrom} → ${p.validTo}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <Switch checked={p.active !== false} onCheckedChange={(v) => promotionsService.setActive(p.id, v)} />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                  setEditingId(p.id);
                  setForm({
                    title: p.title, tag: p.tag ?? "", storeId: p.storeId ?? "", description: p.description ?? "",
                    validFrom: (p.validFrom || today()).slice(0, 10), validTo: (p.validTo || inDays(7)).slice(0, 10),
                    active: p.active !== false,
                  });
                }}>
                  <Pencil size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                  promotionsService.remove(p.id); toast.success("Special removed");
                }}>
                  <Trash2 size={14} />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
