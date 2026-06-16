import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStrapp } from "@/lib/strapp/store";
import { PageContainer, PageHeader, Card } from "@/components/shared/ui";
import { Copy, Mail } from "lucide-react";

export const Route = createFileRoute("/outreach")({
  component: OutreachPage,
  head: () => ({ meta: [{ title: "Outreach · STRAPP Walk" }] }),
});

function OutreachPage() {
  const { businesses, templates, outreachEmail, setOutreachEmail } = useStrapp();
  const [clientId, setClientId] = useState("");
  const [tplId, setTplId] = useState(templates[0]?.id || "");
  const client = businesses.find((b) => b.id === clientId);
  const tpl = templates.find((t) => t.id === tplId);
  const rendered = tpl
    ? tpl.body
        .replace(/\{\{name\}\}/g, client?.name || "there")
        .replace(/\{\{area\}\}/g, client?.area || "")
    : "";

  return (
    <PageContainer>
      <PageHeader title="Outreach Hub" subtitle="Generate personalised messages for each client." />
      <Card className="p-5 space-y-3">
        <select
          className="strapp-input"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        >
          <option value="">— Select client —</option>
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select className="strapp-input" value={tplId} onChange={(e) => setTplId(e.target.value)}>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <textarea readOnly rows={8} className="strapp-input font-mono text-xs" value={rendered} />
        <div className="flex gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(rendered)}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-2 text-sm text-foreground hover:bg-panel-elevated"
          >
            <Copy className="h-4 w-4" /> Copy
          </button>
          <a
            href={`mailto:${client?.email || outreachEmail}?subject=${encodeURIComponent("Quick chat about your visibility")}&body=${encodeURIComponent(rendered)}`}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background"
          >
            <Mail className="h-4 w-4" /> Email
          </a>
        </div>
        <div className="pt-3 border-t border-border">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Default operator email
          </label>
          <input
            className="strapp-input mt-1.5"
            value={outreachEmail}
            onChange={(e) => setOutreachEmail(e.target.value)}
            placeholder="you@strapp.co.za"
          />
        </div>
      </Card>
      <style>{`.strapp-input{width:100%;background:var(--background);border:1px solid var(--border);color:var(--foreground);padding:.5rem .75rem;font-size:.8125rem;border-radius:6px}.strapp-input:focus{outline:none;border-color:var(--foreground)}`}</style>
    </PageContainer>
  );
}
