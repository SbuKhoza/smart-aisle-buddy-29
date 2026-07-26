// AISLE SPY domain models. Kept in one file for Phase 1; split by domain later.

export type ID = string;
export type ISODate = string;

export type ShoppingStyle = "single" | "multiple" | "ask";

export interface User {
  id: ID;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Profile {
  userId: ID;
  firstName: string;
  lastName: string;
  photoURL?: string;
  country: string;
  province?: string;
  favouriteStores: ID[];
  shoppingStyle?: ShoppingStyle;
  monthlyBudget?: number;
  householdSize?: number;
  onboardingComplete: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Settings {
  userId: ID;
  notifications: {
    promotions: boolean;
    priceDrops: boolean;
    weeklyDigest: boolean;
    push: boolean;
    email: boolean;
  };
  location: { enabled: boolean; lastKnown?: { lat: number; lng: number } };
  privacy: { analytics: boolean; crashReports: boolean; shareUsage: boolean };
  theme: "system" | "light" | "dark";
  language: string;
}

export interface Store {
  id: ID;
  name: string;
  logoURL?: string;
  country: string;
}

export interface Product {
  id: ID;
  name: string;
  brand?: string;
  category?: string;
  barcode?: string;
  imageURL?: string;
}

export interface Price {
  id: ID;
  productId: ID;
  storeId: ID;
  amount: number;
  currency: string;
  observedAt: ISODate;
}

export interface ShoppingList {
  id: ID;
  userId: ID;
  name: string;
  storeId?: ID;
  createdAt: ISODate;
  updatedAt: ISODate;
  archived: boolean;
}

export interface ShoppingItem {
  id: ID;
  listId: ID;
  productId?: ID;
  name: string;
  quantity: number;
  unit?: string;
  estimatedPrice?: number;
  purchased: boolean;
}

export interface Promotion {
  id: ID;
  storeId: ID;
  title: string;
  description?: string;
  imageURL?: string;
  validFrom: ISODate;
  validTo: ISODate;
}

export interface Catalogue {
  id: ID;
  storeId: ID;
  title: string;
  fileURL: string;
  validFrom: ISODate;
  validTo: ISODate;
}

export interface Notification {
  id: ID;
  userId: ID;
  title: string;
  body: string;
  read: boolean;
  createdAt: ISODate;
}

export interface CrowdsourcedPrice {
  id: ID;
  productId: ID;
  storeId: ID;
  userId: ID;
  amount: number;
  observedAt: ISODate;
  verified: boolean;
}

export interface ShoppingHistoryEntry {
  id: ID;
  userId: ID;
  listId?: ID;
  storeId?: ID;
  total: number;
  itemCount: number;
  completedAt: ISODate;
}