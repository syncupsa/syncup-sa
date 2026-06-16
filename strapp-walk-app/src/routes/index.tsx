import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useStrapp } from "@/lib/strapp/store";
import {
  PageContainer,
  PageHeader,
  Card,
  CardHeader,
  Money,
  StatusDot,
  Empty,
} from "@/components/shared/ui";
import { Sparkles } from "lucide-react";
import { balanceDue, formatZAR, totalQuote } from "@/lib/strapp/types";
import { Map as MapIcon, Plus, Navigation, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard · STRAPP Walk" },
      {
        name: "description",
        content: "Operational overview — revenue, routes, follow-ups, today's tasks.",
      },
    ],
  }),
});

function Dashboard() {
  const { businesses, campaigns, routes, revenueGoal, setWalking, walkingMode } = useStrapp();

  // --- Daily Target Tracker State ---
  // Persist target and date in localStorage
  const todayStr = new Date().toISOString().slice(0, 10);
  const [dailyTarget, setDailyTarget] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("strapp.dailyTarget");
      if (saved) {
        try {
          const obj = JSON.parse(saved);
          if (obj.date === todayStr) return obj.target;
        } catch {}
      }
    }
    return 10; // default target
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "strapp.dailyTarget",
        JSON.stringify({ date: todayStr, target: dailyTarget }),
      );
    }
  }, [dailyTarget, todayStr]);

  // Count businesses created today
  const todayCount = useMemo(() => {
    const start = new Date(todayStr);
    return businesses.filter((b) => b.createdAt >= start.getTime()).length;
  }, [businesses, todayStr]);

  // Gamified feedback state
  const [showCongrats, setShowCongrats] = useState(false);
  useEffect(() => {
    if (todayCount >= dailyTarget) {
      setShowCongrats(true);
      const t = setTimeout(() => setShowCongrats(false), 3500);
      return () => clearTimeout(t);
    }
  }, [todayCount, dailyTarget]);

  const stats = useMemo(() => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const revenueMonth = businesses
      .filter((b) => (b.visitedAt || b.createdAt) >= monthStart.getTime())
      .reduce((a, b) => a + (b.amountPaid || 0), 0);
    const revenueAll = businesses.reduce((a, b) => a + (b.amountPaid || 0), 0);
    const outstanding = businesses.reduce((a, b) => a + balanceDue(b), 0);
    const activeRoutes = routes.filter((r) => r.status === "active").length;
    const followUps = businesses.filter((b) => b.followUp).length;
    const activeProjects = businesses.filter((b) => b.status === "active").length;
    return { revenueMonth, revenueAll, outstanding, activeRoutes, followUps, activeProjects };
  }, [businesses, campaigns]);

  const todayTasks = useMemo(() => {
    return businesses
      .filter((b) => b.followUp || b.status === "active")
      .sort((a, b) => (b.followUp ? 1 : 0) - (a.followUp ? 1 : 0))
      .slice(0, 6);
  }, [businesses]);

  const recent = useMemo(() => {
    return [...businesses]
      .sort((a, b) => (b.visitedAt || b.createdAt) - (a.visitedAt || a.createdAt))
      .slice(0, 5);
  }, [businesses]);

  const goalPct = Math.min(
    100,
    Math.round((stats.revenueAll / Math.max(1, revenueGoal.goal)) * 100),
  );

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        subtitle="Today's field operations — revenue, routes, follow-ups."
        action={
          <div className="flex gap-2">
            <Link
              to={"/map" as any}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-2 text-sm text-foreground hover:bg-panel-elevated"
            >
              <MapIcon className="h-4 w-4" /> Open map
            </Link>
            <button
              onClick={() => setWalking(!walkingMode)}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                walkingMode
                  ? "bg-foreground text-background"
                  : "border border-border bg-panel text-foreground hover:bg-panel-elevated"
              }`}
            >
              <Navigation className="h-4 w-4" /> {walkingMode ? "Walking on" : "Start walking"}
            </button>
          </div>
        }
      />

      {/* --- Daily Target Tracker --- */}
      <Card className="mt-6 relative overflow-visible">
        <CardHeader
          title="Daily Target"
          subtitle={
            todayCount < dailyTarget
              ? `Just ${dailyTarget - todayCount} to go — you’re on track!`
              : "You’ve hit your goal! 💰"
          }
          action={
            <button
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-xs font-bold shadow"
              onClick={() => setDailyTarget((t: number) => t + 1)}
              aria-label="Increase target"
            >
              +
            </button>
          }
        />
        <div className="px-5 py-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-extrabold text-emerald-600 drop-shadow">
              {todayCount}
            </span>
            <span className="text-lg text-muted-foreground">/ {dailyTarget}</span>
            {todayCount >= dailyTarget && (
              <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 font-bold animate-pulse">
                <Sparkles className="h-4 w-4" /> Goal!
              </span>
            )}
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-background border border-emerald-200">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-yellow-300 to-pink-400 transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.round((todayCount / Math.max(1, dailyTarget)) * 100))}%`,
              }}
            />
          </div>
        </div>
        {showCongrats && (
          <div className="absolute left-1/2 -translate-x-1/2 -top-10 z-10 flex flex-col items-center animate-fade-in">
            <div className="text-4xl">💰💎</div>
            <div className="text-xs font-bold text-emerald-600 bg-white/80 rounded px-2 py-1 mt-1 shadow">
              Billion Dollar Day! Target hit!
            </div>
          </div>
        )}
      </Card>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Revenue (month)" value={formatZAR(stats.revenueMonth)} />
        <Kpi label="Outstanding" value={formatZAR(stats.outstanding)} />
        <Kpi label="Active routes" value={String(stats.activeRoutes)} />
        <Kpi label="Follow-ups" value={String(stats.followUps)} />
      </div>

      {/* Goal */}
      <Card className="mt-6">
        <CardHeader
          title="Revenue progress"
          subtitle={`${formatZAR(stats.revenueAll)} of ${formatZAR(revenueGoal.goal)} target`}
          action={<span className="num text-sm text-muted-foreground">{goalPct}%</span>}
        />
        <div className="px-5 py-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full bg-foreground transition-all" style={{ width: `${goalPct}%` }} />
          </div>
        </div>
      </Card>

      {/* Two-col on desktop */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Today's tasks"
            subtitle={`${todayTasks.length} item${todayTasks.length === 1 ? "" : "s"}`}
            action={
              <Link
                to={"/clients" as any}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                All clients <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <div>
            {todayTasks.length === 0 ? (
              <div className="px-5 py-6">
                <Empty
                  title="No tasks yet"
                  hint="Mark a client as follow-up or active to see it here."
                />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {todayTasks.map((b) => (
                  <li key={b.id}>
                    <Link
                      to={"/clients/$id" as any}
                      params={{ id: b.id } as any}
                      className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-panel-elevated transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <StatusDot status={b.status} />
                        <div className="min-w-0">
                          <div className="truncate text-sm text-foreground">{b.name}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {b.area || b.address || "—"}
                          </div>
                        </div>
                      </div>
                      <Money value={balanceDue(b)} className="text-xs text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent activity" />
          <div>
            {recent.length === 0 ? (
              <div className="px-5 py-6">
                <Empty title="No activity yet" hint="Drop your first pin on the map." />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((b) => (
                  <li key={b.id}>
                    <Link
                      to={"/clients/$id" as any}
                      params={{ id: b.id } as any}
                      className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-panel-elevated transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <StatusDot status={b.status} />
                        <div className="min-w-0">
                          <div className="truncate text-sm text-foreground">{b.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(b.visitedAt || b.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Money value={totalQuote(b)} className="text-xs text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      {/* Quick action FAB-ish row */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <QuickLink
          to="/map"
          icon={<Plus className="h-4 w-4" />}
          label="Add new target"
          desc="Drop a pin on the map"
        />
        <QuickLink
          to="/routes"
          icon={<Navigation className="h-4 w-4" />}
          label="Plan a route"
          desc="Suburb walking plans"
        />
        <QuickLink
          to="/finance"
          icon={<ArrowRight className="h-4 w-4" />}
          label="Log a payment"
          desc="Track deposits & settles"
        />
      </div>
    </PageContainer>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-panel px-4 py-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1.5 num text-xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

function QuickLink({
  to,
  icon,
  label,
  desc,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <Link
      to={to as any}
      className="group flex items-center gap-3 rounded-lg border border-border bg-panel px-4 py-3 hover:bg-panel-elevated transition-colors"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
