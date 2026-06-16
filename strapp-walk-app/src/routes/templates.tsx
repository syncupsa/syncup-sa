import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStrapp } from "@/lib/strapp/store";
import { PageContainer, PageHeader, Card, Empty } from "@/components/shared/ui";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/templates")({
  component: TemplatesPage,
  head: () => ({ meta: [{ title: "Templates · STRAPP Walk" }] }),
});

function TemplatesPage() {
  const { templates, addTemplate, updateTemplate, removeTemplate } = useStrapp();
  const [name, setName] = useState("");
  const [body, setBody] = useState("");

  return (
    <PageContainer>
      <PageHeader
        title="Templates"
        subtitle="Saved message templates. Use {{name}} and {{area}} as placeholders."
      />
      <Card className="p-5 mb-4 space-y-2">
        <input
          className="strapp-input"
          placeholder="Template name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="strapp-input"
          rows={4}
          placeholder="Hi {{name}}, …"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button
          onClick={() => {
            if (name && body) {
              addTemplate({ name, body });
              setName("");
              setBody("");
            }
          }}
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background"
        >
          <Plus className="h-4 w-4" /> Save template
        </button>
      </Card>

      {templates.length === 0 ? (
        <Empty title="No templates yet" />
      ) : (
        <div className="grid gap-3">
          {templates.map((t) => (
            <Card key={t.id} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <input
                  className="strapp-input flex-1"
                  value={t.name}
                  onChange={(e) => updateTemplate(t.id, { name: e.target.value })}
                />
                <button
                  onClick={() => {
                    if (confirm("Delete template?")) removeTemplate(t.id);
                  }}
                  className="rounded-md border border-border bg-panel p-2 text-muted-foreground hover:border-status-prospect hover:text-status-prospect"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                rows={4}
                className="strapp-input mt-2 font-mono text-xs"
                value={t.body}
                onChange={(e) => updateTemplate(t.id, { body: e.target.value })}
              />
            </Card>
          ))}
        </div>
      )}
      <style>{`.strapp-input{width:100%;background:var(--background);border:1px solid var(--border);color:var(--foreground);padding:.5rem .75rem;font-size:.8125rem;border-radius:6px}.strapp-input:focus{outline:none;border-color:var(--foreground)}`}</style>
    </PageContainer>
  );
}
