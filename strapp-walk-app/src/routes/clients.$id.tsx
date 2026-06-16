import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStrapp } from "@/lib/strapp/store";
import { PageContainer, Card, Money, StatusDot } from "@/components/shared/ui";
import {
  balanceDue,
  totalQuote,
  servicesValue,
  PRICE_GOOGLE,
  PRICE_WEBSITE,
  PRICE_WHATSAPP,
  PRICE_SEO,
  type BusinessCategory,
  type BusinessStatus,
} from "@/lib/strapp/types"; // Import BusinessStatus
import { ArrowLeft, Phone, MessageCircle, Map as MapIcon, Trash2 } from "lucide-react";
import { ClientModal, type FormState } from "@/components/shared/ClientModal";

export const Route = createFileRoute("/clients/$id")({
  component: ClientDetail,
  head: () => ({ meta: [{ title: "Client · STRAPP Walk" }] }),
});

const CATEGORIES: BusinessCategory[] = [
  "Retail",
  "Industrial",
  "Professional Services",
  "Food & Beverage",
  "Automotive",
  "Other",
];

const TABS = ["Overview", "Services", "Payments", "Website", "Notes", "Files"] as const;
type Tab = (typeof TABS)[number];

function ClientDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const {
    businesses,
    campaigns,
    routes,
    update,
    remove,
    markVisited,
    assignBusinessToRoute,
    logPayment,
    payments,
  } = useStrapp();
  const b = businesses.find((x) => x.id === id); // Find the business
  const [tab, setTab] = useState<Tab>("Overview");
  const [showClientModal, setShowClientModal] = useState(false);

  // Debugging log to check if business data is found
  useEffect(() => {
    console.log("ClientDetail: Route ID from useParams:", id);
    console.log("ClientDetail: Business found in store (b):", b);
    if (!b) {
      console.warn(`ClientDetail: Business with ID '${id}' not found in store.`);
    }
  }, [id, b]);

  // Type-safe handleSave for ClientModal
  function handleSave(data: FormState) {
    if (!b) return; // Should not happen if b is found
    update(b.id, {
      name: data.name,
      phone: data.phone,
      notes: data.notes,
      status: data.status,
      services: { ...b.services, website: data.web, googleMaps: data.google },
      gbp_details: data.gbp_details,
      web_dev_details: data.web_dev_details,
    });
    setShowClientModal(false);
  }

  function handleDelete() {
    if (!b) return;
    remove(b.id);
    setShowClientModal(false);
    navigate({ to: "/clients" as any });
  }

  if (!b) {
    return (
      <PageContainer>
        <Link
          to={"/clients" as any}
          className="text-sm text-muted-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" /> Back to clients
        </Link>
        <div className="mt-6 text-foreground">Client not found.</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Link
        to={"/clients" as any}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to clients
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <StatusDot status={b.status} />
            <span className="text-xs text-muted-foreground capitalize">{b.status}</span>
          </div>
          <input value={b.name} onChange={(e) => update(b.id, { name: e.target.value })} />
          <div className="text-lg font-bold mb-2">{b.name}</div>
          <div className="mb-2">Phone: {b.phone || "—"}</div>
          <div className="mb-2">Notes: {b.notes || "—"}</div>
          <div className="flex gap-2 mt-2">
            <button
              className="bg-emerald-600 text-white px-4 py-2 rounded"
              onClick={() => setShowClientModal(true)}
            >
              Edit
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => {
                if (confirm(`Delete ${b.name}?`)) {
                  remove(b.id);
                  navigate({ to: "/clients" as any });
                }
              }}
            >
              Delete
            </button>
          </div>
          <button
            onClick={() => markVisited(b.id)}
            className="rounded-md border border-border bg-panel px-3 py-2 text-xs text-foreground hover:bg-panel-elevated"
          >
            Mark visited
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete ${b.name}?`)) {
                remove(b.id);
                navigate({ to: "/clients" as any });
              }
            }}
            className="rounded-md border border-border bg-panel p-2 text-muted-foreground hover:border-status-prospect hover:text-status-prospect"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick contact */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <QuickAct
          href={b.phone ? `tel:+${b.phone}` : undefined}
          icon={<Phone className="h-4 w-4" />}
          label="Call"
        />
        <QuickAct
          href={b.phone ? `https://wa.me/${b.phone}` : undefined}
          external
          icon={<MessageCircle className="h-4 w-4" />}
          label="WhatsApp"
        />
        <QuickAct
          href={`https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`}
          external
          icon={<MapIcon className="h-4 w-4" />}
          label="Maps"
        />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm transition-colors ${
              tab === t
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "Overview" && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5 space-y-3">
              <Field label="Category">
                <select
                  value={b.category}
                  onChange={(e) => update(b.id, { category: e.target.value as BusinessCategory })}
                  className="strapp-input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Address">
                <input
                  className="strapp-input"
                  value={b.address}
                  onChange={(e) => update(b.id, { address: e.target.value })}
                />
              </Field>
              <Field label="Suburb / area">
                <input
                  className="strapp-input"
                  value={b.area}
                  onChange={(e) => update(b.id, { area: e.target.value })}
                  placeholder="Pinetown, Glenwood…"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone (no +)">
                  <input
                    className="strapp-input"
                    value={b.phone}
                    onChange={(e) => update(b.id, { phone: e.target.value.replace(/\D/g, "") })}
                    placeholder="2783…"
                  />
                </Field>
                <Field label="Email">
                  <input
                    className="strapp-input"
                    value={b.email}
                    onChange={(e) => update(b.id, { email: e.target.value })}
                    placeholder="owner@biz.co.za"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Toggle
                  label="Follow-up"
                  checked={b.followUp}
                  onChange={(v) => update(b.id, { followUp: v })}
                />
                <Toggle
                  label="Unlisted on Google"
                  checked={b.unlisted}
                  onChange={(v) => update(b.id, { unlisted: v })}
                />
              </div>
              <div className="num pt-2 text-[11px] text-muted-foreground">
                {b.lat.toFixed(5)}, {b.lng.toFixed(5)}
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <div>
                <Field label="Status">
                  <div className="grid grid-cols-3 gap-2">
                    {(["prospect", "active", "completed"] as BusinessStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => update(b.id, { status: s })}
                        className={`flex items-center justify-center gap-2 rounded-md border px-2 py-2 text-xs capitalize ${
                          b.status === s
                            ? "border-foreground bg-panel-elevated text-foreground"
                            : "border-border bg-panel text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <StatusDot status={s} /> {s}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
              <Field label="Assigned route">
                <select
                  className="strapp-input"
                  value={b.campaignId || ""}
                  onChange={(e) => assignBusinessToRoute(b.id, e.target.value || null)}
                >
                  <option value="">— Unassigned —</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}{" "}
                      {campaigns.find((c) => c.id === r.campaignId)
                        ? `— ${campaigns.find((c) => c.id === r.campaignId)?.name}`
                        : ""}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="rounded-md border border-border bg-background p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Ledger
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                  <LedgerStat label="Quote" value={totalQuote(b)} />
                  <LedgerStat label="Paid" value={b.amountPaid} />
                  <LedgerStat label="Balance" value={balanceDue(b)} bold />
                </div>
              </div>
            </Card>
          </div>
        )}

        {tab === "Services" && (
          <Card className="p-5 space-y-2">
            <SvcRow
              label="Google Visibility Setup"
              price={PRICE_GOOGLE}
              checked={b.services.googleMaps}
              onChange={(v) => update(b.id, { services: { ...b.services, googleMaps: v } })}
            />
            <SvcRow
              label="Website Build"
              price={PRICE_WEBSITE}
              checked={b.services.website}
              onChange={(v) => update(b.id, { services: { ...b.services, website: v } })}
            />
            <SvcRow
              label="WhatsApp Integration"
              price={PRICE_WHATSAPP}
              checked={b.services.whatsapp}
              onChange={(v) => update(b.id, { services: { ...b.services, whatsapp: v } })}
            />
            <SvcRow
              label="SEO Optimization"
              price={PRICE_SEO}
              checked={b.services.seo}
              onChange={(v) => update(b.id, { services: { ...b.services, seo: v } })}
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Manual quote override (R)">
                <input
                  type="number"
                  min={0}
                  className="strapp-input"
                  value={b.manualQuote}
                  onChange={(e) =>
                    update(b.id, { manualQuote: Math.max(0, Number(e.target.value) || 0) })
                  }
                />
              </Field>
              <div className="text-xs text-muted-foreground self-end pb-2">
                Auto from services: <Money value={servicesValue(b)} className="text-foreground" />
              </div>
            </div>
          </Card>
        )}

        {tab === "Payments" && (
          <PaymentsTab
            b={b}
            payments={payments.filter((p) => p.businessId === b.id)}
            log={(amt: number, note: string) => logPayment({ businessId: b.id, amount: amt, note })}
            update={update}
          />
        )}

        {tab === "Website" && (
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-medium text-foreground mb-2">Website Project Details</h3>
            <Field label="Website URL">
              <input
                className="strapp-input"
                value={b.websiteUrl || ""}
                onChange={(e) => update(b.id, { websiteUrl: e.target.value })}
                placeholder="https://yourclient.com"
              />
            </Field>
            <Field label="Domain Registrar">
              <input
                className="strapp-input"
                value={b.domainRegistrar || ""}
                onChange={(e) => update(b.id, { domainRegistrar: e.target.value })}
                placeholder="GoDaddy, Namecheap, etc."
              />
            </Field>
            <Field label="Logo">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  /* handle upload */
                }}
              />
            </Field>
            <Field label="Photos">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  /* handle upload */
                }}
              />
            </Field>
            <Field label="WhatsApp Number">
              <input
                className="strapp-input"
                value={b.whatsapp || ""}
                onChange={(e) => update(b.id, { whatsapp: e.target.value })}
                placeholder="2783..."
              />
            </Field>
            <Field label="Google Verification Code">
              <input
                className="strapp-input"
                value={b.googleVerification || ""}
                onChange={(e) => update(b.id, { googleVerification: e.target.value })}
                placeholder="Verification code..."
              />
            </Field>
            <div className="mt-4">
              <h4 className="text-xs font-bold mb-2">Onboarding Checklist</h4>
              {[
                { k: "logoReceived" as const, label: "Logo received" },
                { k: "photosReceived" as const, label: "Photos received" },
                { k: "domainPurchased" as const, label: "Domain purchased" },
                { k: "whatsappConnected" as const, label: "WhatsApp connected" },
                { k: "googleVerified" as const, label: "Google verified" },
              ].map((it) => (
                <Toggle
                  key={it.k}
                  label={it.label}
                  checked={b.onboarding[it.k]}
                  onChange={(v) => update(b.id, { onboarding: { ...b.onboarding, [it.k]: v } })}
                />
              ))}
            </div>
          </Card>
        )}

        {tab === "Notes" && (
          <Card className="p-5">
            <Field label="Field notes">
              <textarea
                rows={10}
                className="strapp-input"
                value={b.notes}
                onChange={(e) => update(b.id, { notes: e.target.value })}
                placeholder="Owner name, opening hours, next steps, objections, observations…"
              />
            </Field>
            <button
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => update(b.id, { notes: "" })}
            >
              Clear Notes
            </button>
          </Card>
        )}

        {tab === "Files" && (
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-medium text-foreground mb-2">Assets & Files</h3>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={(e) => {
                /* handle upload */
              }}
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Upload logos, images, documents, etc. (cloud sync coming soon)
            </div>
            {/* Display uploaded files here with delete/cancel options */}
          </Card>
        )}
      </div>

      {/* Edit modal with cancel/undo */}
      {showClientModal && (
        <ClientModal
          open={showClientModal}
          editing={true} // Indicate that we are editing an existing client
          initial={{
            name: b.name,
            phone: b.phone || "",
            notes: b.notes || "",
            status: b.status,
            gbp_details: b.gbp_details,
            web_dev_details: b.web_dev_details,
          }}
          onSave={handleSave}
          onCancel={() => setShowClientModal(false)}
          onDelete={handleDelete}
        />
      )}
      <style>{`
        .strapp-input { width: 100%; background: var(--background); border: 1px solid var(--border); color: var(--foreground); padding: 0.5rem 0.75rem; font-size: 0.8125rem; border-radius: 6px; }
        .strapp-input:focus { outline: none; border-color: var(--foreground); }
      `}</style>
    </PageContainer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </div>
      {children}
    </label>
  );
}

function Toggle({
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
      className={`flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-sm transition-colors ${
        checked
          ? "border-foreground bg-panel-elevated text-foreground"
          : "border-border bg-panel text-muted-foreground hover:text-foreground"
      }`}
    >
      <span>{label}</span>
      <span
        className={`h-4 w-4 rounded border ${checked ? "border-foreground bg-foreground" : "border-border"}`}
      />
    </button>
  );
}

function SvcRow({
  label,
  price,
  checked,
  onChange,
}: {
  label: string;
  price: number;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between rounded-md border px-3 py-3 transition-colors ${
        checked
          ? "border-foreground bg-panel-elevated"
          : "border-border bg-panel hover:border-foreground"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-4 w-4 items-center justify-center rounded border ${checked ? "border-foreground bg-foreground" : "border-border"}`}
        >
          {checked && <span className="h-2 w-2 bg-background rounded-sm" />}
        </span>
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <Money value={price} className="text-sm text-foreground" />
    </button>
  );
}

function LedgerStat({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <Money
        value={value}
        className={bold ? "text-base font-semibold text-foreground" : "text-sm text-foreground"}
      />
    </div>
  );
}

function QuickAct({
  href,
  icon,
  label,
  external,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
  external?: boolean;
}) {
  const cls =
    "flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2.5 text-xs " +
    (href
      ? "bg-panel text-foreground hover:bg-panel-elevated"
      : "bg-panel/50 text-muted-foreground/50 pointer-events-none");
  if (!href)
    return (
      <div className={cls}>
        {icon}
        {label}
      </div>
    );
  return (
    <a
      className={cls}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
    >
      {icon}
      {label}
    </a>
  );
}

function PaymentsTab({ b, payments, log, update }: any) {
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_320px]">
      <Card className="p-5">
        <h3 className="text-sm font-medium text-foreground">Payment history</h3>
        {payments.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">No payments logged yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border rounded-md border border-border">
            {payments.map((p: any) => (
              <li key={p.id} className="flex items-center justify-between px-3 py-2.5 text-xs">
                <div>
                  <div className="text-foreground">{new Date(p.at).toLocaleDateString()}</div>
                  {p.note && <div className="text-muted-foreground">{p.note}</div>}
                </div>
                <Money value={p.amount} className="text-foreground" />
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 rounded-md border border-border bg-background p-3 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Quote</span>
            <Money value={totalQuote(b)} className="text-foreground" />
          </div>
          <div className="flex items-center justify-between text-muted-foreground mt-1">
            <span>Paid</span>
            <Money value={b.amountPaid} className="text-foreground" />
          </div>
          <div className="flex items-center justify-between text-foreground mt-1 font-medium border-t border-border pt-2">
            <span>Balance</span>
            <Money value={balanceDue(b)} />
          </div>
        </div>
      </Card>
      <Card className="p-5 space-y-3 h-fit">
        <h3 className="text-sm font-medium text-foreground">Log a payment</h3>
        <Field label="Amount (R)">
          <input
            type="number"
            min={0}
            className="strapp-input"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Note (optional)">
          <input
            className="strapp-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Deposit, settlement…"
          />
        </Field>
        <button
          onClick={() => {
            if (amount > 0) {
              log(amount, note);
              setAmount(0);
              setNote("");
            }
          }}
          disabled={amount <= 0}
          className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-40"
        >
          Log payment
        </button>
        <div className="pt-3 border-t border-border">
          <Field label="Or adjust paid total manually">
            <input
              type="number"
              min={0}
              className="strapp-input"
              value={b.amountPaid}
              onChange={(e) =>
                update(b.id, { amountPaid: Math.max(0, Number(e.target.value) || 0) })
              }
            />
          </Field>
        </div>
      </Card>
    </div>
  );
}
