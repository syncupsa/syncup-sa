import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react"; // Added useRef
import {
  useStrapp,
  type Business,
  type Campaign,
  type Route as RouteInstance,
  type RouteStatus,
} from "@/lib/strapp/store";
import { PageContainer, PageHeader, Card, Money, Empty } from "@/components/shared/ui";
import { routeOpportunity, routeProgress, routeRevenue } from "@/lib/strapp/types";
import { Plus, Trash2, MapPin } from "lucide-react";

export const Route = createFileRoute("/routes")({
  component: RoutesPage,
  head: () => ({
    meta: [
      { title: "Routes · STRAPP Walk" },
      { name: "description", content: "Walking route planning and revisit rounds." },
    ],
  }),
});

export function RoutesPage() {
  const {
    campaigns,
    routes,
    businesses,
    addCampaign,
    removeCampaign,
    updateCampaign,
    addRoute,
    removeRoute,
    updateRoute,
    setRouteStatus,
  } = useStrapp(); // Removed globalFilter as it's not used here
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false); // State for new campaign form
  const [showNewRouteForm, setShowNewRouteForm] = useState(false); // State for new route form
  const [newCampaignInput, setNewCampaignInput] = useState<{
    // State for new campaign input
    name: string;
    area: string;
    target: number;
    bannerLink: string;
    locationType: string;
    researchFile: File | null;
    rationale: string;
  }>({
    name: "",
    area: "",
    target: 0,
    bannerLink: "",
    locationType: "city",
    researchFile: null,
    rationale: "",
  });
  const undoStack = useRef<any[]>([]); // For campaign undo
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <PageContainer>
      <PageHeader
        title="Campaigns & Routes"
        subtitle="Plan walking rounds, neighbourhood surveys, and revisits."
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowNewCampaignForm(true)}
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background"
            >
              <Plus className="h-4 w-4" /> New Campaign
            </button>
            <button
              onClick={() => setShowNewRouteForm(true)}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-2 text-sm text-foreground hover:bg-panel-elevated"
              disabled={campaigns.length === 0}
            >
              <Plus className="h-4 w-4" /> New Route
            </button>
          </div>
        }
      />

      {showNewCampaignForm && (
        <NewCampaignForm
          input={newCampaignInput}
          onChange={(patch) => setNewCampaignInput((prev) => ({ ...prev, ...patch }))}
          onCreate={() => {
            addCampaign({
              name: newCampaignInput.name,
              area: newCampaignInput.area,
              target: newCampaignInput.target,
              bannerLink: newCampaignInput.bannerLink,
              locationType: newCampaignInput.locationType,
              researchFile: newCampaignInput.researchFile,
              rationale: newCampaignInput.rationale,
            });
            setNewCampaignInput({
              name: "",
              area: "",
              target: 0,
              bannerLink: "",
              locationType: "city",
              researchFile: null,
              rationale: "",
            });
            setShowNewCampaignForm(false);
          }}
          onCancel={() => setShowNewCampaignForm(false)}
        />
      )}
      {showNewRouteForm && (
        <NewRouteForm
          allBusinesses={businesses}
          campaigns={campaigns}
          onCreate={(campaignId, input, selectedBusinessIds) => {
            addRoute(campaignId, input, selectedBusinessIds);
            setShowNewRouteForm(false);
          }}
          onCancel={() => setShowNewRouteForm(false)}
        />
      )}

      {campaigns.length === 0 && !showNewCampaignForm ? (
        <Empty
          title="No campaigns yet"
          hint="Create a campaign to organize your field operations."
        />
      ) : (
        <div className="mt-2 grid gap-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold text-foreground">
                      {campaign.name}
                    </h3>
                    {campaign.area && (
                      <p className="mt-0.5 text-xs text-muted-foreground">Area: {campaign.area}</p>
                    )}
                    {campaign.rationale && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{campaign.rationale}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (confirm(`Delete campaign "${campaign.name}"?`))
                          removeCampaign(campaign.id);
                      }}
                      className="rounded-md border border-border bg-panel p-2 text-muted-foreground hover:border-status-prospect hover:text-status-prospect"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="border-t border-border px-5 py-4 space-y-3">
                {routes.filter((r) => r.campaignId === campaign.id).length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No routes in this campaign. Click 'New Route' above to add one.
                  </p>
                ) : (
                  routes
                    .filter((r) => r.campaignId === campaign.id)
                    .map((r) => {
                      const assigned = businesses.filter((b) => b.campaignId === r.id);
                      const visited = assigned.filter((b) => b.visitedAt).length;
                      const remaining = assigned.length - visited;
                      const opp = routeOpportunity(r, businesses);
                      const rev = routeRevenue(r, businesses);
                      const pct = routeProgress(r, businesses);
                      const expanded = expandedId === r.id;
                      return (
                        <div key={r.id} className="border border-border rounded-lg overflow-hidden">
                          <div
                            onClick={() => setExpandedId(expanded ? null : r.id)}
                            className="cursor-pointer px-4 py-3 hover:bg-panel-elevated transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="truncate text-sm font-medium text-foreground">
                                    {r.name}
                                  </h4>
                                  <StatusBadge status={r.status} />
                                </div>
                                {r.boundary && (
                                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" /> {r.boundary}
                                  </p>
                                )}
                              </div>
                              <div className="text-right text-xs">
                                <div className="text-muted-foreground">Opportunity</div>
                                <Money value={opp} className="text-foreground font-medium" />
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-4 gap-3 text-center">
                              <Stat label="Done" value={`${pct}%`} />
                              <Stat label="Visited" value={String(visited)} />
                              <Stat label="Remaining" value={String(remaining)} />
                              <Stat label="Revenue" value={`R${Math.round(rev / 1000)}k`} />
                            </div>

                            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-background">
                              <div
                                className="h-full bg-foreground transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>

                          {expanded && (
                            <div className="border-t border-border px-5 py-4 space-y-4">
                              <div>
                                <Label>Goal & rationale</Label>
                                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                  <input
                                    value={r.boundary}
                                    onChange={(e) =>
                                      updateRoute(r.id, { boundary: e.target.value })
                                    }
                                    className="strapp-input"
                                    placeholder="Suburb / area"
                                  />
                                </div>
                              </div>

                              <div>
                                <Label>Execution phases</Label>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                  {(["intake", "outreach", "deployment"] as const).map((k) => (
                                    <PhaseToggle
                                      key={k}
                                      label={
                                        k === "intake"
                                          ? "Survey"
                                          : k === "outreach"
                                            ? "Outreach"
                                            : "Deployment"
                                      }
                                      checked={r.phases[k]}
                                      onChange={(v) =>
                                        updateRoute(r.id, { phases: { ...r.phases, [k]: v } })
                                      }
                                    />
                                  ))}
                                </div>
                              </div>

                              <div>
                                <Label>Assigned businesses ({assigned.length})</Label>
                                {assigned.length === 0 ? (
                                  <p className="mt-2 text-xs text-muted-foreground">
                                    No businesses assigned. Open a client to assign them.
                                  </p>
                                ) : (
                                  <ul className="mt-2 divide-y divide-border rounded-md border border-border">
                                    {assigned.map((b) => (
                                      <li key={b.id}>
                                        <Link
                                          to={"/clients/$id" as any}
                                          params={{ id: b.id } as any}
                                          className="flex items-center justify-between gap-3 px-3 py-2 text-xs hover:bg-panel-elevated"
                                        >
                                          <span className="truncate text-foreground">{b.name}</span>
                                          <span className="text-muted-foreground">
                                            {b.area || "—"}
                                          </span>
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 pt-2">
                                <select
                                  value={r.status}
                                  onChange={(e) =>
                                    setRouteStatus(r.id, e.target.value as RouteInstance["status"])
                                  }
                                  className="strapp-input flex-1"
                                >
                                  <option value="active">Active</option>
                                  <option value="paused">Paused</option>
                                  <option value="concluded">Concluded</option>
                                </select>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete route "${r.name}"?`)) removeRoute(r.id);
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-2 text-xs text-muted-foreground hover:border-status-prospect hover:text-status-prospect"
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <style>{`
        .strapp-input {
          width: 100%;
          background: var(--background);
          border: 1px solid var(--border);
          color: var(--foreground);
          padding: 0.5rem 0.75rem;
          font-size: 0.8125rem;
          border-radius: 6px;
        }
        .strapp-input:focus { outline: none; border-color: var(--foreground); }
      `}</style>
    </PageContainer>
  );
}

function NewRouteForm({
  allBusinesses,
  campaigns,
  onCreate,
  onCancel,
}: {
  allBusinesses: Business[];
  campaigns: Campaign[];
  onCreate: (
    campaignId: string,
    i: { name: string; boundary?: string; goalAmount: number; rationale?: string },
    selectedBusinessIds: string[],
  ) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [boundary, setBoundary] = useState("");
  const [goalAmount, setGoalAmount] = useState(20000);
  const [rationale, setRationale] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || ""); // State to select parent campaign
  const [selectedBusinessIds, setSelectedBusinessIds] = useState<string[]>(() =>
    allBusinesses.map((b) => b.id),
  );

  const toggleBusinessSelection = (id: string) => {
    setSelectedBusinessIds((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id],
    );
  };

  const memoizedBusinessList = useMemo(() => {
    return allBusinesses.map((b) => (
      <li key={b.id} className="flex items-center gap-2 p-3">
        <input
          type="checkbox"
          checked={selectedBusinessIds.includes(b.id)}
          onChange={() => toggleBusinessSelection(b.id)}
          className="h-4 w-4 rounded border-border bg-panel text-foreground focus:ring-foreground"
        />
        <span className="text-sm text-foreground">
          {b.name} ({b.area || b.address})
        </span>
      </li>
    ));
  }, [allBusinesses, selectedBusinessIds, toggleBusinessSelection]);

  return (
    <Card className="mb-4 p-5">
      <h3 className="text-sm font-medium text-foreground">New walking route</h3>
      <div className="mt-3">
        <Label>Select Parent Campaign</Label>
        <select
          className="strapp-input mt-1"
          value={selectedCampaignId}
          onChange={(e) => setSelectedCampaignId(e.target.value)}
          disabled={campaigns.length === 0}
        >
          {campaigns.length === 0 ? (
            <option value="">No campaigns available</option>
          ) : (
            campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))
          )}
        </select>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <input
          className="strapp-input"
          placeholder="Route name (e.g. Pinetown Round 1)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="strapp-input"
          placeholder="Suburb / area"
          value={boundary}
          onChange={(e) => setBoundary(e.target.value)}
        />
        <input
          className="strapp-input"
          type="number"
          min={0}
          placeholder="Revenue goal (ZAR)"
          value={goalAmount}
          onChange={(e) => setGoalAmount(Number(e.target.value) || 0)}
        />
      </div>
      <textarea
        rows={2}
        className="strapp-input mt-2"
        placeholder="Why this route?"
        value={rationale}
        onChange={(e) => setRationale(e.target.value)}
      />

      <div className="mt-4">
        <Label>Select Clients for this Route (pre-ticked)</Label>
        <div className="mt-2 max-h-60 overflow-y-auto border border-border rounded-md bg-background">
          {allBusinesses.length === 0 ? (
            <p className="p-3 text-xs text-muted-foreground">No clients available to assign.</p>
          ) : (
            <ul className="divide-y divide-border">{memoizedBusinessList}</ul>
          )}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() =>
            onCreate(
              selectedCampaignId,
              { name, boundary, goalAmount, rationale },
              selectedBusinessIds,
            )
          }
          className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background"
          disabled={!selectedCampaignId}
        >
          Create route
        </button>
        <button
          onClick={onCancel}
          className="rounded-md border border-border bg-panel px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </Card>
  );
}

function NewCampaignForm({
  input,
  onChange,
  onCreate,
  onCancel,
}: {
  input: {
    name: string;
    area: string;
    target: number;
    bannerLink: string;
    locationType: string;
    researchFile: File | null;
    rationale: string;
  };
  onChange: (
    patch: Partial<{
      name: string;
      area: string;
      target: number;
      bannerLink: string;
      locationType: string;
      researchFile: File | null;
      rationale: string;
    }>,
  ) => void;
  onCreate: () => void;
  onCancel: () => void;
}) {
  return (
    <Card className="mb-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">New campaign</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Organize routes into campaign folders for better planning.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          className="strapp-input"
          placeholder="Campaign name"
          value={input.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
        <input
          className="strapp-input"
          placeholder="Area / region"
          value={input.area}
          onChange={(e) => onChange({ area: e.target.value })}
        />
        <input
          className="strapp-input"
          type="number"
          min={0}
          placeholder="Target amount (ZAR)"
          value={input.target}
          onChange={(e) => onChange({ target: Number(e.target.value) || 0 })}
        />
        <input
          className="strapp-input"
          placeholder="Banner URL"
          value={input.bannerLink}
          onChange={(e) => onChange({ bannerLink: e.target.value })}
        />
        <select
          className="strapp-input"
          value={input.locationType}
          onChange={(e) => onChange({ locationType: e.target.value })}
        >
          <option value="city">City</option>
          <option value="suburb">Suburb</option>
          <option value="region">Region</option>
        </select>
        <label className="block text-xs text-muted-foreground">
          Research file
          <input
            type="file"
            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
            onChange={(e) => onChange({ researchFile: e.target.files?.[0] ?? null })}
          />
        </label>
      </div>
      <textarea
        rows={3}
        className="strapp-input mt-3"
        placeholder="Campaign rationale"
        value={input.rationale}
        onChange={(e) => onChange({ rationale: e.target.value })}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCreate}
          disabled={!input.name.trim()}
          className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          Create campaign
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border bg-panel px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </Card>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{children}</div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="num text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
function StatusBadge({ status }: { status: RouteInstance["status"] }) {
  // Corrected type
  const color =
    status === "active"
      ? "bg-status-active/15 text-status-active border-status-active/30"
      : status === "paused"
        ? "bg-muted text-muted-foreground border-border"
        : "bg-status-completed/15 text-status-completed border-status-completed/30";
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${color}`}
    >
      {status}
    </span>
  );
}
function PhaseToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`rounded-md border px-3 py-2 text-xs transition-colors ${
        checked
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-panel text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
