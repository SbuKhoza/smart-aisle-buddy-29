import {
  Croissant,
  Milk,
  Beef,
  Carrot,
  Apple,
  Snowflake,
  SprayCan,
  Baby,
  CupSoda,
  Cookie,
  HeartPulse,
  PawPrint,
  Package,
  type LucideIcon,
} from "lucide-react";

export type CategoryId =
  | "bakery"
  | "dairy"
  | "meat"
  | "vegetables"
  | "fruit"
  | "frozen"
  | "cleaning"
  | "baby"
  | "beverages"
  | "snacks"
  | "health"
  | "pet"
  | "other";

export interface CategoryDef {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
  color: string; // tailwind bg utility
  text: string; // tailwind text utility
}

export const CATEGORIES: CategoryDef[] = [
  { id: "bakery", label: "Bakery", icon: Croissant, color: "bg-amber-100", text: "text-amber-700" },
  { id: "dairy", label: "Dairy", icon: Milk, color: "bg-sky-100", text: "text-sky-700" },
  { id: "meat", label: "Meat", icon: Beef, color: "bg-rose-100", text: "text-rose-700" },
  { id: "vegetables", label: "Vegetables", icon: Carrot, color: "bg-emerald-100", text: "text-emerald-700" },
  { id: "fruit", label: "Fruit", icon: Apple, color: "bg-lime-100", text: "text-lime-700" },
  { id: "frozen", label: "Frozen", icon: Snowflake, color: "bg-cyan-100", text: "text-cyan-700" },
  { id: "cleaning", label: "Cleaning", icon: SprayCan, color: "bg-violet-100", text: "text-violet-700" },
  { id: "baby", label: "Baby", icon: Baby, color: "bg-pink-100", text: "text-pink-700" },
  { id: "beverages", label: "Beverages", icon: CupSoda, color: "bg-indigo-100", text: "text-indigo-700" },
  { id: "snacks", label: "Snacks", icon: Cookie, color: "bg-orange-100", text: "text-orange-700" },
  { id: "health", label: "Health", icon: HeartPulse, color: "bg-red-100", text: "text-red-700" },
  { id: "pet", label: "Pet Food", icon: PawPrint, color: "bg-yellow-100", text: "text-yellow-700" },
  { id: "other", label: "Other", icon: Package, color: "bg-slate-100", text: "text-slate-700" },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryDef> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, CategoryDef>;

export function getCategory(id?: string): CategoryDef {
  if (id && id in CATEGORY_MAP) return CATEGORY_MAP[id as CategoryId];
  return CATEGORY_MAP.other;
}

export const UNITS = ["pcs", "kg", "g", "L", "ml", "box", "pack", "bottle"] as const;
export type Unit = (typeof UNITS)[number] | string;