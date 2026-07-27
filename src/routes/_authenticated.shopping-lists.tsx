import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/shopping-lists")({
  head: () => ({
    meta: [
      { title: "Shopping Lists — AISLE SPY" },
      { name: "description", content: "Plan groceries and track spending with reusable shopping lists." },
      { property: "og:title", content: "Shopping Lists — AISLE SPY" },
      { property: "og:description", content: "Plan groceries and track spending with reusable shopping lists." },
    ],
  }),
  component: ShoppingListsLayout,
});

function ShoppingListsLayout() {
  // Layout wrapper for /shopping-lists and its children.
  useRouterState({ select: (s) => s.location.pathname });
  return <Outlet />;
}