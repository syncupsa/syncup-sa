import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Menu,
  LayoutDashboard,
  Map,
  Route as RouteIcon,
  Users,
  Wallet,
  Palette,
} from "lucide-react";
import { SideSheet } from "./SideSheet";
import { useTheme, THEMES, type ThemeName } from "@/lib/theme";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/map": "Map",
  "/routes": "Routes",
  "/clients": "Clients",
  "/finance": "Finance",
  "/outreach": "Outreach Hub",
  "/templates": "Templates",
  "/contracts": "Contracts",
  "/settings": "Settings",
};

type Nav = { to: string; label: string; icon: any; exact?: boolean };
const desktopNav: Nav[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/map", label: "Map", icon: Map },
  { to: "/routes", label: "Routes", icon: RouteIcon },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/finance", label: "Finance", icon: Wallet },
];

export function TopBar({ onLogout }: { onLogout?: () => void } = {}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = PAGE_TITLES[pathname] || (pathname.startsWith("/clients/") ? "Client" : "STRAPP");

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur safe-top">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link to={"/" as any} className="flex items-center gap-2">
              {/* Add logout button if onLogout is provided */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="ml-4 px-3 py-1 rounded bg-red-500 text-white text-xs font-semibold"
                >
                  Logout
                </button>
              )}
              <span className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground">
                STRAPP
              </span>
              <span className="h-3 w-px bg-border" />
              <span className="font-mono text-[11px] tracking-[0.3em] text-foreground">WALK</span>
            </Link>
            <span className="hidden sm:block text-sm text-muted-foreground">/ {title}</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {desktopNav.map(({ to, label, icon: Icon, exact }) => {
              const active = exact
                ? pathname === to
                : pathname === to || pathname.startsWith(to + "/");
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-panel text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-panel/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeQuickSwitch />
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-panel"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <SideSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function ThemeQuickSwitch() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch theme"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-panel"
      >
        <Palette className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-48 rounded-md border border-border bg-panel p-1 shadow-lg">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id as ThemeName);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-sm ${
                  theme === t.id
                    ? "bg-panel-elevated text-foreground"
                    : "text-muted-foreground hover:bg-panel-elevated hover:text-foreground"
                }`}
              >
                <span>{t.label}</span>
                {theme === t.id && <span className="text-[10px] meta">on</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
