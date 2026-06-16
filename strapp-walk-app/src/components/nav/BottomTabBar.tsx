import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Map, Route as RouteIcon, Users, Wallet } from "lucide-react";

type Tab = { to: string; label: string; icon: any; exact?: boolean };
const tabs: Tab[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/map", label: "Map", icon: Map },
  { to: "/routes", label: "Routes", icon: RouteIcon },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/campaigns", label: "Campaigns", icon: Wallet },
];

export function BottomTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur safe-bottom">
      <ul className="grid grid-cols-5">
        {tabs.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
          return (
            <li key={to}>
              <Link
                to={to as any}
                className="relative flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] tracking-wide"
              >
                <span
                  className={`absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full transition-colors ${
                    active ? "bg-foreground" : "bg-transparent"
                  }`}
                />
                <Icon
                  className={`h-[20px] w-[20px] transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}
                  strokeWidth={active ? 2.2 : 1.6}
                />
                <span className={active ? "text-foreground" : "text-muted-foreground"}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
