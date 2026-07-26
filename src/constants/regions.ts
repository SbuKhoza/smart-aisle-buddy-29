export const COUNTRIES = [{ code: "ZA", name: "South Africa" }];

export const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

export interface StoreOption {
  id: string;
  name: string;
}

export const DEFAULT_STORES: StoreOption[] = [
  { id: "shoprite", name: "Shoprite" },
  { id: "checkers", name: "Checkers" },
  { id: "picknpay", name: "Pick n Pay" },
  { id: "woolworths", name: "Woolworths" },
  { id: "makro", name: "Makro" },
  { id: "boxer", name: "Boxer" },
  { id: "spar", name: "Spar" },
  { id: "clicks", name: "Clicks" },
  { id: "dischem", name: "Dis-Chem" },
];