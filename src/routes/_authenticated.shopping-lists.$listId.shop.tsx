import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/shopping-lists/$listId/shop")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/shopping-lists/$listId", params: { listId: params.listId } });
  },
});
