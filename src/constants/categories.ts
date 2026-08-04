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
  { id: "bakery", label: "Bakery", icon: Croissant, color: "bg-accent", text: "text-accent-foreground" },
  { id: "dairy", label: "Dairy", icon: Milk, color: "bg-accent", text: "text-accent-foreground" },
  { id: "meat", label: "Meat", icon: Beef, color: "bg-accent", text: "text-accent-foreground" },
  { id: "vegetables", label: "Vegetables", icon: Carrot, color: "bg-accent", text: "text-accent-foreground" },
  { id: "fruit", label: "Fruit", icon: Apple, color: "bg-accent", text: "text-accent-foreground" },
  { id: "frozen", label: "Frozen", icon: Snowflake, color: "bg-accent", text: "text-accent-foreground" },
  { id: "cleaning", label: "Cleaning", icon: SprayCan, color: "bg-accent", text: "text-accent-foreground" },
  { id: "baby", label: "Baby", icon: Baby, color: "bg-accent", text: "text-accent-foreground" },
  { id: "beverages", label: "Beverages", icon: CupSoda, color: "bg-accent", text: "text-accent-foreground" },
  { id: "snacks", label: "Snacks", icon: Cookie, color: "bg-accent", text: "text-accent-foreground" },
  { id: "health", label: "Health", icon: HeartPulse, color: "bg-accent", text: "text-accent-foreground" },
  { id: "pet", label: "Pet Food", icon: PawPrint, color: "bg-accent", text: "text-accent-foreground" },
  { id: "other", label: "Other", icon: Package, color: "bg-accent", text: "text-accent-foreground" },
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