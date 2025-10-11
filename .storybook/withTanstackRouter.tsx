// .storybook/withTanstackRouter.tsx

import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import type { Decorator } from "@storybook/react";
import React from "react";

// --- 1. Define a simple set of routes for Storybook ---
// These routes don't need real components; they will render the Story itself.
const rootRoute = createRootRoute();
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/" });
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
});
const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
});

const routeTree = rootRoute.addChildren([indexRoute, aboutRoute, contactRoute]);

// --- 2. Create a single, reusable router instance ---
// Using memory history is crucial for a clean Storybook environment.
const router = createRouter({
  routeTree,
  history: createMemoryHistory({ initialEntries: ["/"] }),
});

// --- 3. Create the decorator ---
// This decorator will wrap every story in a RouterProvider.
// The `defaultComponent` prop is a clever trick: it tells the router
// to render the currently active Story as the content for any matched route.
export const withTanstackRouter: Decorator = (Story, context) => {
  return (
    <RouterProvider
      router={router}
      defaultPreload="intent"
      defaultComponent={() => <Story {...context} />}
    />
  );
};
