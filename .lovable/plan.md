## Phase 2 — Shopping Lists, Calculator, Mode, History

Build the complete shopping workflow on top of the Phase 1 Firebase foundation. No price comparison, AI, promos, catalogues, or recommendations — but interfaces/services will be structured to accept them later.

### Data model (Firestore)

New / expanded collections:

- `shoppingLists/{listId}` — `{ id, userId, name, status: 'active'|'shopping'|'completed'|'archived', createdAt, updatedAt, estimatedTotal, actualTotal, itemCount, budget?, storeId? }`
- `shoppingItems/{itemId}` — top-level, indexed by `listId`. `{ id, listId, userId, productId?, name, category, brand?, quantity, unit, estimatedPrice, actualPrice?, purchased, notes?, favourite, order, createdAt }`
- `shoppingHistory/{tripId}` — `{ id, userId, listId?, name, estimatedTotal, actualTotal, budget?, itemCount, purchasedCount, completedAt, items: [snapshot] }`
- `userProducts/{productId}` — user's custom products `{ id, userId, name, category, brand?, defaultUnit, defaultQuantity, estimatedPrice, imageURL?, createdAt }`
- `userFavourites/{favId}` — `{ id, userId, productId, name, category, unit, estimatedPrice, addedAt }`
- Preloaded catalog: `src/data/preloaded-products.ts` (~80 common SA groceries with category + typical price) — used for instant search without hitting Firestore.

Firestore rules updated so all new collections are owner-scoped by `userId`.

### Services (`src/lib/services/`)

Each is a thin, typed module with realtime `subscribe*` + CRUD methods, optimistic-friendly and offline-compatible (Firestore persistence enabled):

- `shoppingListService` — create, rename, delete, duplicate, archive, reuse, list (with sort/filter), subscribe.
- `shoppingItemService` — add, update, delete, togglePurchased, setActualPrice, bulk-add for reuse.
- `historyService` — saveTrip, list, get, duplicateToList, delete.
- `favouriteService` — add, remove, list, isFavourite.
- `productService` — search preloaded + userProducts + recent, createCustom, listByCategory.
- `budgetService` — reads monthly budget from profile, computes remaining vs. estimated/actual, status color.

Enable Firestore IndexedDB persistence in `src/lib/firebase.ts` for offline support.

### Routes

- `/dashboard` — rewritten with real data: welcome, budget card (monthly + this-list), active lists count, last trip, recent activity, quick actions (New List, History, Continue Shopping).
- `/shopping-lists` — grid/list with search, sort (date/name/total), filter (active/archived), card per list, FAB "New List", create dialog (name only).
- `/shopping-lists/$listId` — list detail: item rows w/ checkbox, name, qty·unit, est/actual price, notes, edit/delete, swipe on mobile; header with running estimated total; "Start Shopping" button; add-item bar with instant product search + "Create custom product" fallback; category filter chips; favourites tab.
- `/shopping-lists/$listId/shop` — Shopping Mode: per-item purchased toggle, editable actual price, running actual total, progress %, budget bar, "Done Shopping" opens summary dialog → saves trip → routes to `/history/$tripId`.
- `/history` — list of trips with date, name, actual total, item count, status; open/duplicate/delete.
- `/history/$tripId` — trip detail, "Shop Again" duplicates into a new active list.

### Reusable components (`src/components/shopping/`)

`ProductCard`, `ShoppingListCard`, `HistoryCard`, `BudgetCard`, `CategoryChip`, `CategoryFilter`, `FloatingAddButton`, `BottomActionBar`, `ShoppingSummaryDialog`, `ConfirmDeleteDialog`, `SwipeableItemRow`, `ProductSearch`, `CustomProductDialog`, `EmptyState` variants for lists/products/history/favourites, animated `AnimatedTotal`.

Categories constant in `src/constants/categories.ts` with icon + color per category.

### Calculator & budget

- Every item row computes `subtotal = quantity × price` reactively.
- List header shows animated estimated total (framer-motion count).
- Budget card: `budget`, `estimated`, `remaining`, progress bar. Colors: green (<80%), orange (80–100%), red (>100% with "Budget Exceeded" badge).

### Validation

- Zod schemas for list name, product name, quantity (>0), price (≥0).
- Duplicate product in list → prompt "Increase quantity instead?".

### Offline

- Enable Firestore multi-tab IndexedDB persistence.
- Optimistic writes (Firestore SDK handles queueing).
- UI reads via `onSnapshot` from cache-first.

### Animations (framer-motion)

Add-item slide-in, swipe-to-delete, purchased strike-through, animated totals, completion confetti burst on Save Trip, progress bar tween.

### Future-ready hooks

Empty interfaces + stub service files (no-op) for: `priceComparisonService`, `catalogueMatchService`, `crowdsourcedPriceService`, `barcodeService`, `receiptService`, `recommendationService`, `aiAssistantService`. Real services import their types but never call them.

### Scope guardrails

- No price comparison, promotions, catalogues, AI, barcode/receipt scanning implemented.
- Firebase-only backend (no Lovable Cloud).
- Existing TanStack Router + auth guard reused; all new routes live under `_authenticated`.
- Preloaded product catalog is a static TS file this phase; swappable for Firestore later.

### Deliverable checklist

Create/rename lists · add items via instant search or custom · categories & favourites · live calculator · budget with color states · shopping mode with actuals & progress · summary + save to history · reuse trip → new list · offline-capable · dashboard shows real data · all with polished framer-motion transitions.
