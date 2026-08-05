import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Store as StoreIcon, Package, Tag, Trash2, ShieldAlert, Pencil, X, LogOut, Upload } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "firebase/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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

      <Tabs defaultValue="stores">
        <TabsList className="mb-4 grid w-full grid-cols-3">
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

        <TabsContent value="stores">
          <StoresTab />
        </TabsContent>
        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>
        <TabsContent value="specials">
          <SpecialsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function useStores() {
  const [stores, setStores] = useState<Store[]>([]);
  useEffect(() => adminStoreService.subscribe(setStores, () => {}), []);
  return stores;
}

const emptyStore = { name: "", country: "ZA", colour: "#111111", logoURL: "", initials: "" };

function StoresTab() {
  const stores = useStores();
  const [form, setForm] = useState<any>(emptyStore);
  const editing = Boolean(form.id);

  const save = () => {
    if (!form.name.trim()) return toast.error("Store name is required");
    adminStoreService.save({ ...form, name: form.name.trim() });
    toast.success(editing ? "Store updated" : "Store added");
    setForm(emptyStore);
  };

  return (
    <div className="space-y-3">
      <SectionCard>
        <p className="mb-2.5 text-[13px] font-semibold text-secondary">
          {editing ? "Edit store" : "Add store"}
        </p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-[12px]">Name</Label>
            <Input
              className="h-9 text-[13px]"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Checkers"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Initials / short code</Label>
            <Input
              className="h-9 text-[13px]"
              value={form.initials ?? ""}
              onChange={(e) => setForm({ ...form, initials: e.target.value })}
              placeholder="CHK"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Logo URL</Label>
            <Input
              className="h-9 text-[13px]"
              value={form.logoURL ?? ""}
              onChange={(e) => setForm({ ...form, logoURL: e.target.value })}
              placeholder="https://…"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Brand colour</Label>
            <Input
              type="color"
              className="h-9 w-full p-1"
              value={form.colour ?? "#111111"}
              onChange={(e) => setForm({ ...form, colour: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" className="h-9 text-[13px]" onClick={save}>
            <Plus size={14} className="mr-1.5" /> {editing ? "Save changes" : "Add store"}
          </Button>
          {editing && (
            <Button size="sm" variant="ghost" className="h-9 text-[13px]" onClick={() => setForm(emptyStore)}>
              <X size={14} className="mr-1.5" /> Cancel
            </Button>
          )}
        </div>
      </SectionCard>

      {stores.length === 0 ? (
        <p className="px-1 text-[13px] text-muted-foreground">No stores yet.</p>
      ) : (
        stores.map((s) => (
          <SectionCard key={s.id}>
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[12px] font-bold text-primary-foreground"
                style={{ background: s.colour || "var(--primary)" }}
              >
                {(s.initials || s.name || "?").slice(0, 3).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-secondary">{s.name}</p>
                <p className="text-[12px] text-muted-foreground">{s.country || "ZA"}</p>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setForm(s)}>
                <Pencil size={14} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive"
                onClick={() => {
                  adminStoreService.remove(s.id);
                  toast.success("Store removed");
                }}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </SectionCard>
        ))
      )}
    </div>
  );
}

const emptyProduct = {
  name: "",
  brand: "",
  category: "other",
  unit: "each",
  price: "",
  storeId: "",
  imageURL: "",
};

/** Minimal CSV parser supporting quoted fields; returns lowercase-keyed rows. */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/\r\n?/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const filled = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (filled.length < 2) return [];
  const headers = filled[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, ""));
  return filled.slice(1).map((r) => {
    const o: Record<string, string> = {};
    headers.forEach((h, i) => (o[h] = (r[i] ?? "").trim()));
    return o;
  });
}

const _emptyProductUnused = {
  name: "",
  brand: "",
  category: "other",
  unit: "each",
  price: "",
  storeId: "",
  imageURL: "",
};

function ProductsTab() {
  const stores = useStores();
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [form, setForm] = useState<any>(emptyProduct);
  const [importing, setImporting] = useState(false);
  const editing = Boolean(form.id);

  useEffect(() => adminProductService.subscribe(setProducts, () => {}), []);

  const rows = useMemo(
    () => (filter === "all" ? products : products.filter((p) => p.storeId === filter)),
    [products, filter],
  );

  const save = () => {
    if (!form.name.trim()) return toast.error("Product name is required");
    const store = stores.find((s) => s.id === form.storeId);
    adminProductService.save({
      ...form,
      name: form.name.trim(),
      storeName: store?.name ?? "",
      price: form.price === "" ? null : Number(form.price),
    });
    toast.success(editing ? "Product updated" : "Product added");
    setForm({ ...emptyProduct, storeId: form.storeId });
  };

  async function importCsv(file: File) {
    setImporting(true);
    try {
      const rowsCsv = parseCsv(await file.text());
      if (rowsCsv.length === 0) {
        toast.error("No rows found in that CSV");
        return;
      }
      let added = 0;
      let skipped = 0;
      for (const r of rowsCsv) {
        const name = (r["name"] ?? r["product"] ?? "").trim();
        if (!name) {
          skipped++;
          continue;
        }
        const storeKey = (r["storeid"] ?? r["store"] ?? "").trim().toLowerCase();
        const store =
          stores.find((s) => s.id.toLowerCase() === storeKey) ??
          stores.find((s) => (s.name ?? "").toLowerCase() === storeKey);
        const priceRaw = (r["price"] ?? "").replace(/[^0-9.]/g, "");
        const category = (r["category"] ?? "other").trim().toLowerCase();
        adminProductService.save({
          name,
          brand: (r["brand"] ?? "").trim(),
          category: CATEGORIES.some((c) => c.id === category) ? category : "other",
          unit: (r["unit"] ?? "each").trim() || "each",
          price: priceRaw === "" ? null : Number(priceRaw),
          storeId: store?.id ?? "",
          storeName: store?.name ?? "",
          imageURL: (r["imageurl"] ?? "").trim(),
        } as any);
        added++;
      }
      toast.success(`Imported ${added} product${added === 1 ? "" : "s"}${skipped ? ` · ${skipped} skipped` : ""}`);
    } catch {
      toast.error("Could not read that CSV file");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-3">
      <SectionCard>
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-secondary">Bulk import products (CSV)</p>
            <p className="text-[12px] text-muted-foreground">
              Header row: name, brand, store, category, unit, price. Store matches a store id or name.
            </p>
          </div>
          <Button size="sm" variant="outline" className="h-9 text-[13px]" disabled={importing} asChild>
            <label className="cursor-pointer">
              <Upload size={14} className="mr-1.5" />
              {importing ? "Importing…" : "Upload CSV"}
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) void importCsv(f);
                }}
              />
            </label>
          </Button>
        </div>
      </SectionCard>

      <SectionCard>
        <p className="mb-2.5 text-[13px] font-semibold text-secondary">
          {editing ? "Edit product" : "Add product"}
        </p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-[12px]">Name</Label>
            <Input
              className="h-9 text-[13px]"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full cream milk 2L"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Brand</Label>
            <Input
              className="h-9 text-[13px]"
              value={form.brand ?? ""}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Store</Label>
            <Select value={form.storeId || undefined} onValueChange={(v) => setForm({ ...form, storeId: v })}>
              <SelectTrigger className="h-9 text-[13px]">
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="h-9 text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Unit</Label>
            <Input
              className="h-9 text-[13px]"
              value={form.unit ?? ""}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="each / kg / 2L"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Price (R)</Label>
            <Input
              className="h-9 text-[13px]"
              inputMode="decimal"
              value={form.price ?? ""}
              onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^0-9.]/g, "") })}
            />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" className="h-9 text-[13px]" onClick={save}>
            <Plus size={14} className="mr-1.5" /> {editing ? "Save changes" : "Add product"}
          </Button>
          {editing && (
            <Button size="sm" variant="ghost" className="h-9 text-[13px]" onClick={() => setForm(emptyProduct)}>
              <X size={14} className="mr-1.5" /> Cancel
            </Button>
          )}
        </div>
      </SectionCard>

      <div className="flex items-center gap-2 px-1">
        <span className="text-[12px] text-muted-foreground">Filter</span>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-8 w-48 text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stores</SelectItem>
            {stores.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <p className="px-1 text-[13px] text-muted-foreground">No products yet.</p>
      ) : (
        rows.map((p) => (
          <SectionCard key={p.id}>
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-secondary">{p.name}</p>
                <p className="truncate text-[12px] text-muted-foreground">
                  {[p.brand, p.storeName, p.unit].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <span className="text-[13px] font-semibold text-secondary">
                {p.price != null ? `R${Number(p.price).toFixed(2)}` : "—"}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setForm({ ...p, price: p.price ?? "" })}
              >
                <Pencil size={14} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive"
                onClick={() => {
                  adminProductService.remove(p.id);
                  toast.success("Product removed");
                }}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </SectionCard>
        ))
      )}
    </div>
  );
}

const emptyPromo = {
  title: "",
  tag: "Special",
  description: "",
  imageURL: "",
  storeId: "",
  active: true,
  validFrom: today(),
  validTo: inDays(14),
};

function SpecialsTab() {
  const stores = useStores();
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [form, setForm] = useState<any>(emptyPromo);
  const editing = Boolean(form.id);

  useEffect(() => promotionsService.subscribeAll(setPromos, () => {}), []);

  const save = () => {
    if (!form.title.trim()) return toast.error("Title is required");
    const store = stores.find((s) => s.id === form.storeId);
    promotionsService.save({
      ...form,
      title: form.title.trim(),
      storeName: store?.name ?? "",
    });
    toast.success(editing ? "Special updated" : "Special added to the carousel");
    setForm(emptyPromo);
  };

  return (
    <div className="space-y-3">
      <SectionCard>
        <p className="mb-0.5 text-[13px] font-semibold text-secondary">
          {editing ? "Edit special" : "Add special / advert"}
        </p>
        <p className="mb-2.5 text-[12px] text-muted-foreground">
          Active specials appear in the dashboard carousel and on the Specials page.
        </p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-[12px]">Title</Label>
            <Input
              className="h-9 text-[13px]"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="30% off fresh produce"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Badge</Label>
            <Input
              className="h-9 text-[13px]"
              value={form.tag ?? ""}
              onChange={(e) => setForm({ ...form, tag: e.target.value })}
              placeholder="Special / Advert / Deal"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Store</Label>
            <Select value={form.storeId || undefined} onValueChange={(v) => setForm({ ...form, storeId: v })}>
              <SelectTrigger className="h-9 text-[13px]">
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Image URL (advert artwork)</Label>
            <Input
              className="h-9 text-[13px]"
              value={form.imageURL ?? ""}
              onChange={(e) => setForm({ ...form, imageURL: e.target.value })}
              placeholder="https://…"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Valid from</Label>
            <Input
              type="date"
              className="h-9 text-[13px]"
              value={form.validFrom}
              onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[12px]">Valid to</Label>
            <Input
              type="date"
              className="h-9 text-[13px]"
              value={form.validTo}
              onChange={(e) => setForm({ ...form, validTo: e.target.value })}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-[12px]">Description</Label>
            <Textarea
              className="min-h-16 text-[13px]"
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button size="sm" className="h-9 text-[13px]" onClick={save}>
            <Plus size={14} className="mr-1.5" /> {editing ? "Save changes" : "Add special"}
          </Button>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.active !== false}
              onCheckedChange={(v) => setForm({ ...form, active: v })}
            />
            <span className="text-[12px] text-muted-foreground">Active</span>
          </div>
          {editing && (
            <Button size="sm" variant="ghost" className="h-9 text-[13px]" onClick={() => setForm(emptyPromo)}>
              <X size={14} className="mr-1.5" /> Cancel
            </Button>
          )}
        </div>
      </SectionCard>

      {promos.length === 0 ? (
        <p className="px-1 text-[13px] text-muted-foreground">No specials yet.</p>
      ) : (
        promos.map((p) => (
          <SectionCard key={p.id}>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <span className="inline-flex rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
                  {p.tag || "Special"}
                </span>
                <p className="mt-1.5 truncate text-[14px] font-semibold text-secondary">{p.title}</p>
                <p className="truncate text-[12px] text-muted-foreground">
                  {[p.storeName, `${p.validFrom} → ${p.validTo}`].filter(Boolean).join(" · ")}
                </p>
              </div>
              <Switch
                checked={p.active !== false}
                onCheckedChange={(v) => promotionsService.setActive(p.id, v)}
              />
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setForm(p)}>
                <Pencil size={14} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive"
                onClick={() => {
                  promotionsService.remove(p.id);
                  toast.success("Special removed");
                }}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </SectionCard>
        ))
      )}
    </div>
  );
}