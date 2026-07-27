import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "Shopping History — AISLE SPY" },
      { name: "description", content: "Review past shopping trips, totals and reuse lists in one tap." },
      { property: "og:title", content: "Shopping History — AISLE SPY" },
      { property: "og:description", content: "Review past shopping trips, totals and reuse lists in one tap." },
    ],
  }),
  component: HistoryLayout,
});

function HistoryLayout() {
  useRouterState({ select: (s) => s.location.pathname });
  return <Outlet />;
}