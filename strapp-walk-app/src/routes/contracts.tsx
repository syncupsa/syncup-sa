import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStrapp } from "@/lib/strapp/store";
import { PageContainer, PageHeader, Card } from "@/components/shared/ui";
import { formatZAR, totalQuote } from "@/lib/strapp/types";
import { Printer } from "lucide-react";

export const Route = createFileRoute("/contracts")({
  component: ContractsPage,
  head: () => ({ meta: [{ title: "Contracts · STRAPP Walk" }] }),
});

function ContractsPage() {
  const { businesses } = useStrapp();
  const [clientId, setClientId] = useState("");
  const b = businesses.find((x) => x.id === clientId);

  const print = () => {
    if (!b) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document
      .write(`<!doctype html><html><head><title>Service Agreement — ${escape(b.name)}</title>
      <style>body{font-family:-apple-system,system-ui,sans-serif;padding:48px;max-width:720px;margin:0 auto;color:#111;line-height:1.6}h1{font-size:24px}p{font-size:14px}.sig{margin-top:64px;display:flex;gap:48px}.sig div{flex:1;border-top:1px solid #111;padding-top:8px;font-size:12px;color:#666}</style>
      </head><body>
      <h1>Service Agreement</h1>
      <p><strong>Between:</strong> Strapp (Pty) Ltd, Durban, South Africa<br/><strong>And:</strong> ${escape(b.name)} (${escape(b.address || b.area || "")})</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p>Strapp agrees to deliver the digital services selected for the client, totaling <strong>${formatZAR(totalQuote(b))}</strong>, payable on terms agreed verbally and confirmed in writing via WhatsApp or email.</p>
      <p>Deliverables include Google Business Profile setup, website build, WhatsApp integration, and/or SEO optimisation as marked in the client record.</p>
      <p>Payment terms: 50% deposit on commencement; balance on delivery. Domains and third-party assets are billed at cost where applicable.</p>
      <div class="sig"><div>Client signature</div><div>Strapp representative</div></div>
      <script>window.onload=()=>window.print()</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <PageContainer>
      <PageHeader title="Contracts" subtitle="Generate a printable service agreement." />
      <Card className="p-5 space-y-3">
        <select
          className="strapp-input"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        >
          <option value="">— Select client —</option>
          {businesses.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
        <button
          onClick={print}
          disabled={!b}
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-40"
        >
          <Printer className="h-4 w-4" /> Generate & print
        </button>
      </Card>
      <style>{`.strapp-input{width:100%;background:var(--background);border:1px solid var(--border);color:var(--foreground);padding:.5rem .75rem;font-size:.8125rem;border-radius:6px}.strapp-input:focus{outline:none;border-color:var(--foreground)}`}</style>
    </PageContainer>
  );
}
function escape(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => (({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }) as any)[c],
  );
}
