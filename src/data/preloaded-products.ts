import type { CategoryId } from "@/constants/categories";

export interface PreloadedProduct {
  id: string;
  name: string;
  brand?: string;
  category: CategoryId;
  unit: string;
  quantity: number;
  estimatedPrice: number;
}

// Common South African grocery basket. Prices are indicative in ZAR.
export const PRELOADED_PRODUCTS: PreloadedProduct[] = [
  { id: "p_milk_1l", name: "Milk 1L", category: "dairy", unit: "L", quantity: 1, estimatedPrice: 22 },
  { id: "p_milk_2l", name: "Milk 2L", category: "dairy", unit: "L", quantity: 2, estimatedPrice: 38 },
  { id: "p_long_life_milk", name: "Long Life Milk 1L", category: "dairy", unit: "L", quantity: 1, estimatedPrice: 24 },
  { id: "p_almond_milk", name: "Almond Milk 1L", category: "dairy", unit: "L", quantity: 1, estimatedPrice: 42 },
  { id: "p_yoghurt", name: "Yoghurt 1kg", category: "dairy", unit: "kg", quantity: 1, estimatedPrice: 48 },
  { id: "p_cheese", name: "Cheddar Cheese 250g", category: "dairy", unit: "g", quantity: 250, estimatedPrice: 55 },
  { id: "p_butter", name: "Butter 500g", category: "dairy", unit: "g", quantity: 500, estimatedPrice: 75 },
  { id: "p_eggs_18", name: "Eggs (18 pack)", category: "dairy", unit: "pack", quantity: 1, estimatedPrice: 78 },
  { id: "p_eggs_6", name: "Eggs (6 pack)", category: "dairy", unit: "pack", quantity: 1, estimatedPrice: 32 },

  { id: "p_bread_white", name: "White Bread", category: "bakery", unit: "pcs", quantity: 1, estimatedPrice: 20 },
  { id: "p_bread_brown", name: "Brown Bread", category: "bakery", unit: "pcs", quantity: 1, estimatedPrice: 20 },
  { id: "p_bread_seed", name: "Seed Loaf", category: "bakery", unit: "pcs", quantity: 1, estimatedPrice: 35 },
  { id: "p_rolls", name: "Bread Rolls (6)", category: "bakery", unit: "pack", quantity: 1, estimatedPrice: 25 },
  { id: "p_croissant", name: "Croissants (4)", category: "bakery", unit: "pack", quantity: 1, estimatedPrice: 45 },

  { id: "p_chicken_breast", name: "Chicken Breasts 1kg", category: "meat", unit: "kg", quantity: 1, estimatedPrice: 95 },
  { id: "p_chicken_whole", name: "Whole Chicken", category: "meat", unit: "kg", quantity: 1.5, estimatedPrice: 105 },
  { id: "p_mince", name: "Beef Mince 500g", category: "meat", unit: "g", quantity: 500, estimatedPrice: 78 },
  { id: "p_steak", name: "Rump Steak 500g", category: "meat", unit: "g", quantity: 500, estimatedPrice: 145 },
  { id: "p_bacon", name: "Bacon 250g", category: "meat", unit: "g", quantity: 250, estimatedPrice: 60 },
  { id: "p_sausage", name: "Boerewors 1kg", category: "meat", unit: "kg", quantity: 1, estimatedPrice: 120 },

  { id: "p_potatoes", name: "Potatoes 2kg", category: "vegetables", unit: "kg", quantity: 2, estimatedPrice: 45 },
  { id: "p_onions", name: "Onions 1kg", category: "vegetables", unit: "kg", quantity: 1, estimatedPrice: 25 },
  { id: "p_tomatoes", name: "Tomatoes 1kg", category: "vegetables", unit: "kg", quantity: 1, estimatedPrice: 30 },
  { id: "p_carrots", name: "Carrots 1kg", category: "vegetables", unit: "kg", quantity: 1, estimatedPrice: 22 },
  { id: "p_spinach", name: "Spinach Bunch", category: "vegetables", unit: "pcs", quantity: 1, estimatedPrice: 18 },
  { id: "p_lettuce", name: "Lettuce", category: "vegetables", unit: "pcs", quantity: 1, estimatedPrice: 20 },
  { id: "p_cucumber", name: "Cucumber", category: "vegetables", unit: "pcs", quantity: 1, estimatedPrice: 15 },
  { id: "p_peppers", name: "Peppers (3 pack)", category: "vegetables", unit: "pack", quantity: 1, estimatedPrice: 35 },

  { id: "p_apples", name: "Apples 1.5kg", category: "fruit", unit: "kg", quantity: 1.5, estimatedPrice: 45 },
  { id: "p_bananas", name: "Bananas 1kg", category: "fruit", unit: "kg", quantity: 1, estimatedPrice: 22 },
  { id: "p_oranges", name: "Oranges 2kg", category: "fruit", unit: "kg", quantity: 2, estimatedPrice: 40 },
  { id: "p_grapes", name: "Grapes 500g", category: "fruit", unit: "g", quantity: 500, estimatedPrice: 45 },
  { id: "p_avocado", name: "Avocado", category: "fruit", unit: "pcs", quantity: 1, estimatedPrice: 15 },

  { id: "p_frozen_veg", name: "Frozen Mixed Veg 1kg", category: "frozen", unit: "kg", quantity: 1, estimatedPrice: 55 },
  { id: "p_frozen_chips", name: "Frozen Chips 1kg", category: "frozen", unit: "kg", quantity: 1, estimatedPrice: 45 },
  { id: "p_ice_cream", name: "Ice Cream 2L", category: "frozen", unit: "L", quantity: 2, estimatedPrice: 80 },
  { id: "p_frozen_pizza", name: "Frozen Pizza", category: "frozen", unit: "pcs", quantity: 1, estimatedPrice: 55 },

  { id: "p_rice", name: "Rice 2kg", category: "other", unit: "kg", quantity: 2, estimatedPrice: 55 },
  { id: "p_pasta", name: "Pasta 500g", category: "other", unit: "g", quantity: 500, estimatedPrice: 25 },
  { id: "p_sugar", name: "Sugar 2.5kg", category: "other", unit: "kg", quantity: 2.5, estimatedPrice: 65 },
  { id: "p_flour", name: "Flour 2.5kg", category: "other", unit: "kg", quantity: 2.5, estimatedPrice: 55 },
  { id: "p_oil", name: "Cooking Oil 2L", category: "other", unit: "L", quantity: 2, estimatedPrice: 95 },
  { id: "p_salt", name: "Salt 1kg", category: "other", unit: "kg", quantity: 1, estimatedPrice: 15 },
  { id: "p_maize", name: "Maize Meal 5kg", category: "other", unit: "kg", quantity: 5, estimatedPrice: 78 },
  { id: "p_cereal", name: "Cereal 750g", category: "other", unit: "g", quantity: 750, estimatedPrice: 65 },

  { id: "p_coffee", name: "Coffee 250g", category: "beverages", unit: "g", quantity: 250, estimatedPrice: 85 },
  { id: "p_tea", name: "Tea Bags (100)", category: "beverages", unit: "box", quantity: 1, estimatedPrice: 55 },
  { id: "p_juice", name: "Fruit Juice 1L", category: "beverages", unit: "L", quantity: 1, estimatedPrice: 30 },
  { id: "p_coke", name: "Coca-Cola 2L", category: "beverages", unit: "L", quantity: 2, estimatedPrice: 30 },
  { id: "p_water", name: "Still Water 5L", category: "beverages", unit: "L", quantity: 5, estimatedPrice: 22 },

  { id: "p_chips", name: "Potato Chips 125g", category: "snacks", unit: "g", quantity: 125, estimatedPrice: 22 },
  { id: "p_choc", name: "Chocolate Slab", category: "snacks", unit: "pcs", quantity: 1, estimatedPrice: 30 },
  { id: "p_biscuits", name: "Biscuits 200g", category: "snacks", unit: "g", quantity: 200, estimatedPrice: 25 },
  { id: "p_nuts", name: "Mixed Nuts 250g", category: "snacks", unit: "g", quantity: 250, estimatedPrice: 65 },

  { id: "p_soap", name: "Bath Soap (4 pack)", category: "cleaning", unit: "pack", quantity: 1, estimatedPrice: 45 },
  { id: "p_dish_soap", name: "Dishwashing Liquid 750ml", category: "cleaning", unit: "ml", quantity: 750, estimatedPrice: 35 },
  { id: "p_washing_powder", name: "Washing Powder 2kg", category: "cleaning", unit: "kg", quantity: 2, estimatedPrice: 95 },
  { id: "p_toilet_paper", name: "Toilet Paper (9 pack)", category: "cleaning", unit: "pack", quantity: 1, estimatedPrice: 75 },
  { id: "p_bleach", name: "Bleach 750ml", category: "cleaning", unit: "ml", quantity: 750, estimatedPrice: 28 },

  { id: "p_toothpaste", name: "Toothpaste 100ml", category: "health", unit: "ml", quantity: 100, estimatedPrice: 35 },
  { id: "p_shampoo", name: "Shampoo 400ml", category: "health", unit: "ml", quantity: 400, estimatedPrice: 65 },
  { id: "p_deodorant", name: "Deodorant 150ml", category: "health", unit: "ml", quantity: 150, estimatedPrice: 42 },
  { id: "p_plasters", name: "Plasters (20)", category: "health", unit: "box", quantity: 1, estimatedPrice: 25 },

  { id: "p_nappies", name: "Nappies (44 pack)", category: "baby", unit: "pack", quantity: 1, estimatedPrice: 220 },
  { id: "p_baby_wipes", name: "Baby Wipes (80)", category: "baby", unit: "pack", quantity: 1, estimatedPrice: 45 },
  { id: "p_baby_formula", name: "Baby Formula 900g", category: "baby", unit: "g", quantity: 900, estimatedPrice: 280 },

  { id: "p_dog_food", name: "Dog Food 8kg", category: "pet", unit: "kg", quantity: 8, estimatedPrice: 220 },
  { id: "p_cat_food", name: "Cat Food 2kg", category: "pet", unit: "kg", quantity: 2, estimatedPrice: 95 },
  { id: "p_cat_litter", name: "Cat Litter 5kg", category: "pet", unit: "kg", quantity: 5, estimatedPrice: 85 },
];