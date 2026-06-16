import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { StrappProvider } from "@/lib/strapp/store";
import { ThemeProvider } from "@/lib/theme";
import { TopBar } from "@/components/nav/TopBar";
import { BottomTabBar } from "@/components/nav/BottomTabBar";

import "../styles.css";

function DevelopmentScripts() {
  // REMOVED HYDRATION MISMATCH TRIGGER:
  // Returning null on mount while the server rendered <Scripts/>
  // causes a hard recovery loop in React 19.
  return <Scripts />;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  const handleLogout = React.useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("strapp_token");
      localStorage.removeItem("strapp_token_expiry");
      router.navigate({ to: "/login" });
    }
  }, [router]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const expiry = Number(localStorage.getItem("strapp_token_expiry"));
    if (expiry && Date.now() > expiry) {
      handleLogout();
    }
  }, [handleLogout]);

  return (
    <ThemeProvider>
      <StrappProvider>
        <QueryClientProvider client={queryClient}>
          <HeadContent />
          {router.state.location.pathname !== "/login" && <TopBar onLogout={handleLogout} />}
          <Outlet />
          {router.state.location.pathname !== "/login" && <BottomTabBar />}
          <DevelopmentScripts />
        </QueryClientProvider>
      </StrappProvider>
    </ThemeProvider>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-semibold text-foreground">404</h1>
        <h2 className="mt-3 text-lg font-medium text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This route doesn't exist.</p>
        <Link
          to={"/" as any}
          className="mt-6 inline-flex rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-lg font-medium text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#05070B" },
      { title: "Strapp Walk — Field Operations" },
      {
        name: "description",
        content: "Mobile-first field acquisition platform for Durban operators.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&family=Archivo+Black&family=Playfair+Display:wght@600;700;800&display=swap",
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
