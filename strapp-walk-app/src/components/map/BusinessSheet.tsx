import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useStrapp } from "@/lib/strapp/store";
import { type Business, type BusinessStatus } from "@/lib/strapp/types";
import { StatusDot } from "@/components/shared/ui";
import { Phone, MessageCircle, ArrowUpRight, CheckCircle2 } from "lucide-react";

export function BusinessSheet({
  open,
  onClose,
  business,
}: {
  open: boolean;
  onClose: () => void;
  business: Business | null;
}) {
  const { update } = useStrapp();
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    name: business?.name || "",
    lat: business?.lat || 0,
    lng: business?.lng || 0,
    phone: business?.phone || "",
    notes: business?.notes || "",
  });
  useEffect(() => {
    if (business)
      setForm({
        name: business.name || "",
        lat: business.lat,
        lng: business.lng,
        phone: business.phone || "",
        notes: business.notes || "",
      });
  }, [business]);
  if (!business) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="border-t border-border bg-panel p-0 max-h-[80dvh]">
        <div className="overflow-y-auto px-5 pt-5 pb-8">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <StatusDot status={business.status} />
                <span className="text-xs text-muted-foreground capitalize">{business.status}</span>
                {business.unlisted && (
                  <span className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    unlisted
                  </span>
                )}
              </div>
              {!edit ? (
                <>
                  <h2 className="mt-1 text-lg font-semibold text-foreground truncate">
                    {business.name}
                  </h2>
                  {/* Details field removed */}
                  <p className="text-xs text-muted-foreground truncate">
                    Lat: {business.lat.toFixed(6)}, Lng: {business.lng.toFixed(6)}
                  </p>
                  {business.phone && (
                    <p className="text-xs text-muted-foreground truncate">
                      Phone: {business.phone}
                    </p>
                  )}
                  {business.notes && (
                    <p className="text-xs text-muted-foreground truncate">
                      Notes: {business.notes}
                    </p>
                  )}
                  <button className="mt-2 text-xs underline" onClick={() => setEdit(true)}>
                    Edit
                  </button>
                </>
              ) : (
                <form
                  className="space-y-2 mt-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    update(business.id, { ...form });
                    setEdit(false);
                  }}
                >
                  <input
                    className="strapp-input"
                    placeholder="Business Name"
                    value={form.name}
                    required
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                  {/* Details field removed */}
                  <div className="flex gap-2">
                    <input
                      className="strapp-input"
                      type="number"
                      step="0.000001"
                      value={form.lat}
                      onChange={(e) => setForm((f) => ({ ...f, lat: Number(e.target.value) }))}
                      required
                      style={{ width: "50%" }}
                      placeholder="Latitude"
                    />
                    <input
                      className="strapp-input"
                      type="number"
                      step="0.000001"
                      value={form.lng}
                      onChange={(e) => setForm((f) => ({ ...f, lng: Number(e.target.value) }))}
                      required
                      style={{ width: "50%" }}
                      placeholder="Longitude"
                    />
                  </div>
                  <input
                    className="strapp-input"
                    placeholder="Phone (optional)"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                  <textarea
                    className="strapp-input"
                    placeholder="Notes (optional)"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="bg-primary text-primary-foreground px-3 py-1.5 rounded text-xs font-bold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="bg-panel px-3 py-1.5 rounded text-xs"
                      onClick={() => setEdit(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Quick status pills */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(["prospect", "active", "completed"] as BusinessStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => update(business.id, { status: s })}
                className={`flex items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-xs capitalize transition-colors ${
                  business.status === s
                    ? "border-foreground bg-panel-elevated text-foreground"
                    : "border-border bg-panel text-muted-foreground hover:text-foreground"
                }`}
              >
                <StatusDot status={s} />
                {s}
              </button>
            ))}
          </div>

          {/* Quick actions */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <ActionBtn
              href={business.phone ? `tel:+${business.phone}` : undefined}
              icon={<Phone className="h-4 w-4" />}
              label="Call"
            />
            <ActionBtn
              href={business.phone ? `https://wa.me/${business.phone}` : undefined}
              icon={<MessageCircle className="h-4 w-4" />}
              label="WhatsApp"
              external
            />
            <button
              onClick={() => update(business.id, { visitedAt: Date.now() })}
              className="flex items-center justify-center gap-2 rounded-md border border-border bg-panel px-3 py-2.5 text-xs text-foreground hover:bg-panel-elevated"
            >
              <CheckCircle2 className="h-4 w-4" />
              Visited
            </button>
          </div>

          {business.notes && (
            <div className="mt-4 rounded-md border border-border bg-background p-3 text-xs leading-relaxed text-muted-foreground">
              {business.notes}
            </div>
          )}

          <Link
            to={"/clients/$id" as any}
            params={{ id: business.id } as any}
            onClick={onClose}
            className="mt-5 flex items-center justify-center gap-2 rounded-md border border-foreground bg-foreground px-4 py-2.5 text-sm font-medium text-background"
          >
            Open full record <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ActionBtn({
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
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={cls}
    >
      {icon}
      {label}
    </a>
  );
}
