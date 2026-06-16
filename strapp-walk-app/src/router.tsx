import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { QueryClient } from "@tanstack/react-query";

let router: ReturnType<typeof createRouter> | undefined = undefined;

export function getRouter() {
  if (!router) {
    router = createRouter({
      routeTree,
      defaultPreload: "intent",
      context: { queryClient: new QueryClient() },
    });
  }
  return router;
}

export function AppRouter() {
  const r = getRouter();
  if (!r) return null;
  return <RouterProvider router={r} />;
}
