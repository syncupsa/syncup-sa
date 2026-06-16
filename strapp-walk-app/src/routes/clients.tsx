import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ClientModal, type FormState } from "@/components/shared/ClientModal";
import { useStrapp } from "@/lib/strapp/store";
import { PageContainer, PageHeader, Card, Money, StatusDot, Empty } from "@/components/shared/ui";
import { balanceDue, type BusinessStatus } from "@/lib/strapp/types";
import { Search, Plus } from "lucide-react";

export const Route = createFileRoute("/clients")({
  component: ClientsPage,
  head: () => ({
    meta: [
      { title: "Clients · STRAPP Walk" },
      { name: "description", content: "Prospect, active, and completed clients." },
    ],
  }),
});

const TABS: { value: "all" | BusinessStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "prospect", label: "Prospects" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

function ClientsPage() {
  const { businesses, createBusinessAt } = useStrapp();
  const [tab, setTab] = useState<"all" | BusinessStatus>("all");
  const [q, setQ] = useState("");
  const [showClientModal, setShowClientModal] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate(); // Initialize useNavigate hook

  const filtered = useMemo(() => {
    return businesses
      .filter((b) => (tab === "all" ? true : b.status === tab))
      .filter((b) =>
        q
          ? (b.name + " " + b.area + " " + b.address).toLowerCase().includes(q.toLowerCase())
          : true,
      )
      .sort((a, b) => (b.visitedAt || b.createdAt) - (a.visitedAt || a.createdAt));
  }, [businesses, tab, q]);

  const handleClientModalSave = (data: FormState) => {
    // Use Durban center for new clients from this page
    const coords = pendingCoords || { lat: -29.8587, lng: 31.0218 };
    const b = createBusinessAt(coords, {
      name: data.name,
      phone: data.phone,
      notes: data.notes,
      status: data.status,
      gbp_details: data.gbp_details,
      web_dev_details: data.web_dev_details,
      visitedAt: Date.now(),
    });
    setShowClientModal(false);
    setPendingCoords(null);
    navigate({ to: "/clients/$id", params: { id: b.id } }); // Use client-side navigation
  };

  return (
    <PageContainer>
      <PageHeader
        title="Clients"
        subtitle="Prospects, active engagements, completed projects."
        action={
          <button
            onClick={() => {
              setShowClientModal(true);
              setPendingCoords(null);
            }}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background"
          >
            <Plus className="h-4 w-4" /> New client
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search clients, suburbs, addresses…"
            className="w-full rounded-md border border-border bg-panel pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
          />
        </div>
        <div className="flex gap-1 rounded-md border border-border bg-panel p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`rounded px-3 py-1.5 text-xs transition-colors ${
                tab === t.value
                  ? "bg-panel-elevated text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty title="No clients found" hint="Drop a pin on the map or create one above." />
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {filtered.map((b) => (
              <li key={b.id}>
                <Link
                  to="/clients/$id"
                  params={{ id: b.id }}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-panel-elevated transition-colors"
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
                  <div className="text-right text-xs shrink-0">
                    <Money value={balanceDue(b)} className="text-foreground" />
                    <div className="text-muted-foreground">due</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ClientModal for new client */}
      <ClientModal
        open={showClientModal}
        onSave={handleClientModalSave}
        onCancel={() => {
          setShowClientModal(false);
          setPendingCoords(null);
        }}
      />
    </PageContainer>
  );
}
