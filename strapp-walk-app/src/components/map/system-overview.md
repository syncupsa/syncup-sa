<!--
This document provides an overview of the Durban Core Connect system, focusing on key architectural components and how they interact, particularly in the context of a modern web application built with TanStack Router.
-->

# Durban Core Connect System Overview

This document outlines the core components and functionalities of the Durban Core Connect application, with a particular focus on its frontend architecture built around **TanStack Router** for navigation, data management, and user experience.

## 1. Core Technologies

The system leverages several modern web development technologies:

- **TanStack Router**: A robust and type-safe routing library for React/Solid applications, enabling file-based routing, automatic code splitting, and advanced data loading patterns.
- **Vite/Webpack Plugin (`@tanstack/router-plugin`)**: Integrates TanStack Router with bundlers for route generation and optimized code splitting.
- **Source Map Support (`@cspotcode/source-map-support`)**: Enhances debugging by mapping compiled code back to original source files, crucial for development and error reporting.
- **Playwright (`@playwright/test`)**: A powerful end-to-end testing framework for reliable browser automation.

## 2. Frontend Routing with TanStack Router

The application's navigation and view management are powered by TanStack Router, offering a highly structured and performant approach.

### 2.1 Router Initialization (`createRouter`)

The central piece of the routing system is the router instance, created using `createRouter`. It defines the application's route tree and global configurations.

**Key Concepts:**

- **`routeTree`**: The hierarchical structure of all defined routes, often generated automatically via file-based routing.
- **`context`**: Allows injecting application-wide state (e.g., authentication status, API clients) into the router, making it accessible to all routes.
- **Type Safety**: Achieved by declaring the router's type within the `@tanstack/react-router` module, enabling comprehensive type checking across all routing APIs.

**Example (`src/router.tsx`, `src/App.tsx`):**

```typescript
// src/routes/__root.tsx
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

interface AuthState { /* ... */ }
interface MyRouterContext {
  auth: AuthState
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => <Outlet />,
})

// src/router.tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // Placeholder, filled by RouterProvider
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// src/App.tsx
import { RouterProvider } from '@tanstack/react-router'
import { AuthProvider, useAuth } from './auth' // Custom AuthProvider
import { router } from './router'

function InnerApp() {
  const auth = useAuth() // Get live auth state
  return <RouterProvider router={router} context={{ auth }} />
}

function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  )
}
```

### 2.2 Route Definition and File-Based Routing

Routes are typically defined using a file-based convention, where file and folder names correspond to URL segments. This simplifies route management and improves maintainability.

- `src/routes/` is the default directory for route files.
- `createFileRoute` defines individual routes.
- Layout routes (e.g., `_authenticated.tsx`) protect groups of child routes.

## 3. Authentication and Authorization (Auth and Guards)

Route protection is a critical aspect, preventing unauthorized access to parts of the application.

### 3.1 `beforeLoad` for Route Protection

The `beforeLoad` option in a route definition is the primary mechanism for implementing route guards. It executes before any component renders or data loads for that route.

**Example (Protected Layout Route):**

```typescript
// src/routes/_authenticated.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});
```

### 3.2 Redirecting Users

When `beforeLoad` determines a user is unauthorized, it `throw redirect()` to send them to a login page, often preserving the intended destination in search parameters for redirection after successful login. The `isRedirect` helper is crucial for distinguishing actual errors from intentional redirects within `try/catch` blocks.

### 3.3 Non-Redirected (Inline) Authentication

Instead of redirecting, an application can render a login form directly within the protected route's layout if the user is not authenticated. This keeps the URL unchanged and provides a seamless experience.

### 3.4 Role-Based Access Control (RBAC)

By extending the authentication context with `hasRole` or `hasPermission` helpers, `beforeLoad` can enforce granular access control for routes based on user roles or specific permissions.

**Critical Note**: Route guards (`beforeLoad`) **do not protect server functions** (`createServerFn`). Server functions are RPC endpoints accessible directly. Authentication for server functions must be enforced at the handler level (e.g., via middleware) to prevent unauthorized data access.

## 4. Code Splitting and Performance

TanStack Router optimizes application performance through automatic and configurable code splitting.

### 4.1 Automatic Code Splitting

Enabled via the `@tanstack/router-plugin` bundler plugin, this feature automatically splits route components and non-critical assets into separate, lazily loaded JavaScript chunks. This significantly reduces the initial bundle size and improves load times.

**Configuration (Vite example):**

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true, // Enables automatic code splitting
    }),
    react(),
  ],
});
```

### 4.2 How It Works

The plugin transforms route files during development and build, using lazy-loading wrappers that point to "virtual" files. When requested, these virtual files generate minimal, on-the-fly chunks containing only the required code (e.g., `component`, `errorComponent`).

**What gets split by default:** `component`, `errorComponent`, `pendingComponent`, `notFoundComponent`.

**Important Rule:** Do not export route properties (like `component`, `loader`) directly from route files when using automatic code splitting; they should be local to the route file.

### 4.3 Granular Control

Developers can customize splitting behavior globally (`defaultBehavior`), programmatically (`splitBehavior`), or per-route (`codeSplitGroupings`) for fine-grained optimization. Data loaders (`loader`) are typically kept in the initial bundle for immediate data fetching, but can be split if necessary.

## 5. Data Loading

TanStack Router provides a sophisticated data loading mechanism with built-in caching and dependency management.

### 5.1 Route Loading Lifecycle

A defined sequence of events occurs upon URL/history updates:

1.  **Route Matching**: `params.parse`, `validateSearch`.
2.  **Route Pre-Loading (Serial)**: `beforeLoad`, `onError`.
3.  **Route Loading (Parallel)**: `component.preload?`, `loader`, rendering `pendingComponent` (optional), `component`, `onError`.

### 5.2 The `loader` Function

Route loaders fetch data for a route. They receive an object with `abortController`, `cause`, `context`, `deps`, `location`, `params`, `preload` flags, and the `route` object itself.

- **Consuming Data**: Data from a `loader` is accessed via `Route.useLoaderData()` or `getRouteApi().useLoaderData()` within components.

### 5.3 Dependency-based Stale-While-Revalidate Caching

The router includes an SWR (Stale-While-Revalidate) cache for `loader` data, keyed by the route's pathname and any explicit `loaderDeps`.

- **`loaderDeps`**: Specifies dependencies (e.g., search params) that, when changed, force a reload. Only include actual dependencies to avoid unnecessary reloads.
- **`staleTime`**: Configures how long data is considered "fresh" before triggering a background revalidation. Default is 0ms (always stale) for navigations, and 30 seconds for preloads.
- **`gcTime`**: Determines how long unused data remains in the cache before garbage collection (default: 30 minutes).
- **`staleReloadMode`**: Controls whether stale data reloads block rendering (`'blocking'`) or happen in the background (`'background'`, default).

### 5.4 Handling Errors

Errors during loading can be managed with `onError`, `onCatch` functions, or by rendering an `errorComponent` on the route.

### 5.5 Deferred Data Loading

For non-critical or slow-loading data, loaders can return unawaited promises wrapped in `defer()`. The `Await` component (or React 19's `use()`) in the UI displays a fallback while deferred data resolves. This pattern enhances perceived performance by rendering critical content sooner.

## 6. Navigation

Navigation in TanStack Router is type-safe and flexible, offering various ways to move users between routes.

### 6.1 Core Navigation APIs

- **`<Link>` Component**: The primary way for user-initiated navigation, rendering a standard `<a>` tag with proper `href` attributes, supporting preloading on hover, and active/inactive styling.
- **`useNavigate()` Hook**: For imperative navigation, typically triggered by side effects (e.g., after form submission).
- **`router.navigate()` Method**: Similar to `useNavigate`, but accessible from anywhere the `router` instance is available (e.g., outside React components).
- **`<Navigate>` Component**: Renders nothing but performs an immediate client-side navigation upon mounting.

### 6.2 Link Options (`ToOptions`, `NavigateOptions`, `LinkOptions`)

These interfaces define common properties for navigation:

- `to`: Destination route path (absolute or relative).
- `from`: Origin route path for relative navigation.
- `params`: Path parameters.
- `search`: Search/query parameters.
- `hash`: URL hash fragment.
- `replace`: Whether to replace the current history entry.
- `preload`: Strategy for preloading (e.g., `'intent'` for hover).

### 6.3 Dynamic and Optional Parameters

Links can include dynamic path segments (e.g., `/blog/$postId`) and optional path segments (e.g., `/-$locale/about`) for flexible URL structures, especially useful for i18n.

## 7. URL Rewrites

URL rewrites provide a powerful mechanism to transform URLs bidirectionally between what the browser displays and what the router internally interprets.

### 7.1 How It Works

- **`input` rewrite**: Transforms the URL _from the browser_ before the router processes it.
- **`output` rewrite**: Transforms the URL _from the router_ before it's written to the browser.

This enables scenarios like stripping locale prefixes for internal routing (`/en/about` -> `/about`) and re-adding them for external display.

### 7.2 Common Patterns

- **i18n Locale Prefixes**: Managing multilingual URLs.
- **Subdomain Routing**: Mapping `admin.example.com` to internal `/admin` routes.
- **Legacy URL Migration**: Handling old URL patterns that redirect to new routes.
- **Composing Rewrites**: Multiple rewrite rules can be chained using `composeRewrites`.

The `location` object provides `href` (internal URL) and `publicHref` (external URL) to distinguish between the two.

## 8. Search Parameters

TanStack Router significantly enhances the handling of URL search parameters, treating them as a first-class state management mechanism.

### 8.1 JSON-first Approach

Unlike traditional `URLSearchParams`, TanStack Router automatically converts search strings to structured JSON, preserving primitive types (numbers, booleans) and handling nested data structures. This allows complex state to be stored directly in the URL.

### 8.2 Validation and Typing (`validateSearch`)

The `validateSearch` option on a route allows developers to define a schema (e.g., using Zod, Valibot) to validate and type incoming search parameters. This ensures that search params are always in a trusted format for application logic. Invalid search params can trigger `onError` and display an `errorComponent`.

### 8.3 Reading and Writing Search Params

- **Reading**: `Route.useSearch()` in components, or `search` property in `loaderDeps` for loaders.
- **Writing**: `search` prop on `<Link>` components or `search` option in `navigate()` calls.

### 8.4 Search Middlewares

Functions that can transform search parameters before link generation or after validation. Useful for retaining specific params (`retainSearchParams`) or stripping default values (`stripSearchParams`).

## 9. Server-Side Rendering (SSR)

TanStack Router supports both non-streaming and streaming SSR for improved initial load performance and SEO.

### 9.1 Non-Streaming SSR

The entire page HTML and data are rendered on the server and sent as a single response. The client then hydrates the static markup into an interactive application.

- Uses `createRequestHandler` and `defaultRenderHandler` (or `renderRouterToString` with `RouterServer`) on the server.
- `RouterClient` component is used for client-side hydration.
- Automatic server-side history (`createMemoryHistory`) and loader data dehydration/hydration are handled.

### 9.2 Streaming SSR

Critical HTML and data are sent first, while lower-priority content streams
