import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useStrapp } from "@/lib/strapp/store";
import { useTheme, THEMES } from "@/lib/theme";
import { PageContainer, PageHeader, Card } from "@/components/shared/ui";
import { Upload, RotateCcw, Check } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings · STRAPP Walk" }] }),
});

function SettingsPage() {
  const {
    revenueGoal,
    setRevenueGoal,
    outreachEmail,
    setOutreachEmail,
    mapsApiKey,
    setMapsApiKey,
    importJson,
    resetAll,
  } = useStrapp();
  const { theme, setTheme } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("");

  return (
    <PageContainer>
      <PageHeader title="Settings" subtitle="Theme, revenue goal, API keys, data." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-foreground">Account</h3>
          <PasswordChange />
          <button
            onClick={() => {
              localStorage.removeItem("strapp_token");
              localStorage.removeItem("strapp_token_expiry");
              window.location.href = "/login";
            }}
            className="mt-3 inline-flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-2 text-sm text-status-prospect hover:bg-panel-elevated"
          >
            Log out
          </button>
        </Card>
        <Card className="p-5 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-foreground">Theme</h3>
          <p className="text-xs text-muted-foreground">
            Hot-swap the visual matrix. Persists across sessions.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {THEMES.map((t) => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex items-start justify-between gap-2 rounded-md border p-3 text-left transition-colors ${
                    active
                      ? "border-primary bg-panel-elevated"
                      : "border-border bg-panel hover:bg-panel-elevated"
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-foreground">{t.label}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{t.hint}</div>
                  </div>
                  {active && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Revenue target</h3>
          <Field label="Monthly goal (R)">
            <input
              type="number"
              min={0}
              className="strapp-input"
              value={revenueGoal.goal}
              onChange={(e) => setRevenueGoal({ goal: Number(e.target.value) || 0 })}
            />
          </Field>
        </Card>

        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Operator</h3>
          <Field label="Email">
            <input
              className="strapp-input"
              value={outreachEmail}
              onChange={(e) => setOutreachEmail(e.target.value)}
              placeholder="you@strapp.co.za"
            />
          </Field>
        </Card>

        <Card className="p-5 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-foreground">Google Maps API key</h3>
          <p className="text-xs text-muted-foreground">
            A working key is pre-configured. Override here if needed.
          </p>
          <input
            className="strapp-input font-mono text-xs"
            value={mapsApiKey}
            onChange={(e) => setMapsApiKey(e.target.value)}
          />
        </Card>

        <Card className="p-5 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-foreground">Data</h3>
          <p className="text-xs text-muted-foreground">
            Backup or restore all clients, routes, payments, and templates.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-2 text-sm text-foreground hover:bg-panel-elevated"
            >
              <Upload className="h-4 w-4" /> Import JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const text = await f.text();
                setStatus(importJson(text) ? "Imported." : "Invalid file.");
              }}
            />
            <button
              onClick={() => {
                if (confirm("Wipe ALL local data? This cannot be undone.")) resetAll();
              }}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-2 text-sm text-status-prospect hover:bg-panel-elevated"
            >
              <RotateCcw className="h-4 w-4" /> Reset everything
            </button>
          </div>
          {status && <p className="text-xs text-muted-foreground">{status}</p>}
        </Card>
      </div>
      <style>{`.strapp-input{width:100%;background:var(--background);border:1px solid var(--border);color:var(--foreground);padding:.5rem .75rem;font-size:.8125rem;border-radius:6px}.strapp-input:focus{outline:none;border-color:var(--foreground)}`}</style>
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

// Move PasswordChange outside SettingsPage
function PasswordChange() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleChange(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");
    if (!oldPass || !newPass || !confirm) {
      setStatus("All fields required.");
      return;
    }
    if (newPass !== confirm) {
      setStatus("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      // Replace with real API call
      const token = localStorage.getItem("strapp_token");
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
      });
      if (!res.ok) throw new Error("Password change failed");
      setStatus("Password changed.");
      setOldPass("");
      setNewPass("");
      setConfirm("");
    } catch (e: any) {
      setStatus(e.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={handleChange} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="password"
          className="strapp-input"
          placeholder="Old password"
          value={oldPass}
          onChange={(e) => setOldPass(e.target.value)}
          required
        />
        <input
          type="password"
          className="strapp-input"
          placeholder="New password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          required
        />
        <input
          type="password"
          className="strapp-input"
          placeholder="Confirm new"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="bg-primary text-primary-foreground px-3 py-1.5 rounded text-xs font-bold"
        disabled={loading}
      >
        {loading ? "Saving..." : "Change password"}
      </button>
      {status && <div className="text-xs text-status-prospect mt-1">{status}</div>}
    </form>
  );
}
