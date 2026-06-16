import React, { useState, useEffect } from "react";
import { useStrapp } from "@/lib/strapp/store";
import { type BusinessStatus } from "@/lib/strapp/types";

// 1. Fix Type Definitions (The Schema Contract):
export interface FormState {
  name: string;
  phone: string;
  notes: string;
  status: BusinessStatus;
  web: boolean;
  google: boolean;
  images: File[];
  campaignType: "day" | "campaign";
  campaignId: string;
  gbp_details: {
    businessName: string;
    address: string;
    hours: string;
    assets_pending: boolean;
  };
  web_dev_details: {
    domain: string;
    hosting: string;
    requirements: string;
    assets_pending: boolean;
  };
}

export interface ClientModalProps {
  open: boolean;
  initial?: Partial<FormState>;
  onSave: (data: FormState) => void;
  onCancel: () => void;
  onDelete?: () => void;
  editing?: boolean;
}

export function ClientModal(props: ClientModalProps) {
  const { open, initial, onSave, onCancel, editing } = props;
  const { campaigns } = useStrapp();

  // 3. Deterministic State Initialization:
  const [form, setForm] = useState<FormState>(() => ({
    name: "",
    phone: "",
    notes: "",
    status: "prospect",
    web: false,
    google: false,
    images: [] as File[],
    campaignType: "day",
    campaignId: "",
    gbp_details: {
      businessName: "",
      address: "",
      hours: "",
      assets_pending: false,
    },
    web_dev_details: {
      domain: "",
      hosting: "",
      requirements: "",
      assets_pending: false,
    },
  }));

  const updateGbp = (updates: Partial<FormState["gbp_details"]>) =>
    setForm((prev) => ({ ...prev, gbp_details: { ...prev.gbp_details, ...updates } }));

  const updateWeb = (updates: Partial<FormState["web_dev_details"]>) =>
    setForm((prev) => ({ ...prev, web_dev_details: { ...prev.web_dev_details, ...updates } }));

  // 4. Refactor the Logic Engine (QueueManager):
  const getSteps = (currentForm: FormState): string[] => {
    const baseSteps = ["basic", "assign", "services"];
    const dynamicSteps: string[] = [];

    if (currentForm.status === "active") {
      if (currentForm.google || currentForm.web) {
        dynamicSteps.push("shared_details");
      }
      if (currentForm.google) {
        dynamicSteps.push("google_assets");
      }
      if (currentForm.web) {
        dynamicSteps.push("web_assets");
      }
    }
    return [...baseSteps, ...dynamicSteps];
  };

  const steps = getSteps(form);
  const [step, setStep] = useState(0);

  // Sync incoming props gracefully only when the modal opens
  const isOpen = !!open;
  useEffect(() => {
    if (isOpen) {
      const gbp = initial?.gbp_details;
      const web = initial?.web_dev_details;

      console.log("[ClientModal] Hydrating form with initial data:", initial);

      setForm({
        name: initial?.name || "",
        phone: initial?.phone || "",
        notes: initial?.notes || "",
        status: initial?.status || "prospect",
        web: initial?.web || false,
        google: initial?.google || false,
        images: initial?.images || [],
        campaignType: initial?.campaignType || "day",
        campaignId: initial?.campaignId || "",
        gbp_details: {
          businessName: gbp?.businessName || initial?.name || "",
          address: gbp?.address || "",
          hours: gbp?.hours || "",
          assets_pending: gbp?.assets_pending ?? false,
        },
        web_dev_details: {
          domain: web?.domain || "",
          hosting: web?.hosting || "",
          requirements: web?.requirements || "",
          assets_pending: web?.assets_pending ?? false,
        },
      });
      setStep(0);
    }
  }, [isOpen]);

  if (!open) return null;

  const currentStepKey = steps[step];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center bg-black/40"
      role="dialog"
      aria-modal="true"
    >
      <form
        className="bg-background rounded-t-2xl md:rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-5 border-4 border-foreground"
        style={{ minWidth: 320, maxHeight: "90dvh", overflowY: "auto" }}
        onSubmit={(e) => {
          e.preventDefault();
          if (step < steps.length - 1) {
            setStep((s) => s + 1);
          } else {
            onSave(form);
          }
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-black uppercase italic text-foreground">
            {editing ? "Edit Client" : "Add Client"}
          </h2>
          <span className="text-[10px] font-bold bg-foreground text-background px-2 py-0.5">
            STEP {step + 1}/{steps.length}
          </span>
        </div>

        {/* STEP 1: BASIC DETAILS */}
        {currentStepKey === "basic" && (
          <div className="flex flex-col gap-3">
            <input
              className="strapp-input text-lg px-4 py-3 rounded-xl border-2 border-border focus:border-primary"
              placeholder="Business Name"
              value={form.name}
              required
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              className="strapp-input px-4 py-3 rounded-xl border-2 border-border focus:border-primary"
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <textarea
              className="strapp-input px-4 py-3 rounded-xl border-2 border-border focus:border-primary"
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
        )}

        {/* STEP 2: ASSIGNMENT */}
        {currentStepKey === "assign" && (
          <div className="flex flex-col gap-2 mb-2">
            <label className="font-semibold text-sm">Assign to</label>
            <div className="flex gap-2">
              <label
                className={`flex-1 px-3 py-2 rounded-xl border-2 cursor-pointer ${form.campaignType === "day" ? "bg-primary text-background border-primary" : "bg-panel border-border text-foreground hover:border-foreground"}`}
              >
                <input
                  type="radio"
                  checked={form.campaignType === "day"}
                  onChange={() => setForm((f) => ({ ...f, campaignType: "day", campaignId: "" }))}
                  className="mr-2"
                />{" "}
                Day-to-day
              </label>
              <label
                className={`flex-1 px-3 py-2 rounded-xl border-2 cursor-pointer ${form.campaignType === "campaign" ? "bg-primary text-background border-primary" : "bg-panel border-border text-foreground hover:border-foreground"}`}
              >
                <input
                  type="radio"
                  checked={form.campaignType === "campaign"}
                  onChange={() => setForm((f) => ({ ...f, campaignType: "campaign" }))}
                  className="mr-2"
                />{" "}
                Campaign
              </label>
            </div>
            {form.campaignType === "campaign" && (
              <select
                className="strapp-input px-4 py-3 rounded-xl border-2 border-border focus:border-primary mt-2"
                value={form.campaignId}
                onChange={(e) => setForm((f) => ({ ...f, campaignId: e.target.value }))}
              >
                <option value="">Select campaign…</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* STEP 3: SERVICES */}
        {currentStepKey === "services" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm">Status</label>
              <select
                className="strapp-input px-4 py-3 rounded-xl border-2 border-border focus:border-primary"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as BusinessStatus }))
                }
              >
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            {form.status === "active" && (
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Services</label>
                <div className="flex gap-2">
                  <label
                    className={`flex-1 px-3 py-2 rounded-xl border-2 cursor-pointer ${form.web ? "bg-primary text-background border-primary" : "bg-panel border-border text-foreground"}`}
                  >
                    <input
                      type="checkbox"
                      checked={form.web}
                      onChange={(e) => setForm((f) => ({ ...f, web: e.target.checked }))}
                      className="mr-2"
                    />{" "}
                    Web Dev
                  </label>
                  <label
                    className={`flex-1 px-3 py-2 rounded-xl border-2 cursor-pointer ${form.google ? "bg-primary text-background border-primary" : "bg-panel border-border text-foreground"}`}
                  >
                    <input
                      type="checkbox"
                      checked={form.google}
                      onChange={(e) => setForm((f) => ({ ...f, google: e.target.checked }))}
                      className="mr-2"
                    />{" "}
                    Google Listing
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DYNAMIC STEP: SHARED CORE DETAILS */}
        {currentStepKey === "shared_details" && (
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-sm text-foreground">Core Service Information</h3>
            <input
              className="strapp-input px-4 py-3 rounded-xl border-2 border-border focus:border-primary"
              placeholder="Business Name for Google Listing"
              value={form.gbp_details.businessName}
              onChange={(e) => updateGbp({ businessName: e.target.value })}
            />
            <input
              className="strapp-input px-4 py-3 rounded-xl border-2 border-border focus:border-primary"
              placeholder="Physical Address"
              value={form.gbp_details.address}
              onChange={(e) => updateGbp({ address: e.target.value })}
            />
            <input
              className="strapp-input px-4 py-3 rounded-xl border-2 border-border focus:border-primary"
              placeholder="Business Hours (e.g. Mon-Fri 9am-5pm)"
              value={form.gbp_details.hours}
              onChange={(e) => updateGbp({ hours: e.target.value })}
            />
          </div>
        )}

        {/* DYNAMIC STEP: GOOGLE MAPS LISTING ASSETS */}
        {currentStepKey === "google_assets" && (
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-sm text-foreground">Google Business Profile Media</h3>
            <label className="text-xs font-semibold text-muted-foreground">
              Upload Business Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              className="strapp-input px-4 py-3 rounded-xl border-2 border-border focus:border-primary file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-background"
              onChange={(e) => {
                const files = Array.from(e.target.files || []) as File[];
                setForm((f) => ({ ...f, images: files }));
              }}
            />
            <label className="flex items-center gap-2 text-sm mt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={form.gbp_details.assets_pending}
                onChange={(e) => updateGbp({ assets_pending: e.target.checked })}
              />
              Mark GBP Verification Media Pending
            </label>
          </div>
        )}

        {/* DYNAMIC STEP: WEB DEVELOPMENT PROTOCOLS */}
        {currentStepKey === "web_assets" && (
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-sm text-foreground">Web Engineering Specifications</h3>
            <input
              className="strapp-input px-4 py-3 rounded-xl border-2 border-border focus:border-primary"
              placeholder="Target Domain Name"
              value={form.web_dev_details.domain}
              onChange={(e) => updateWeb({ domain: e.target.value })}
            />
            <input
              className="strapp-input px-4 py-3 rounded-xl border-2 border-border focus:border-primary"
              placeholder="Hosting Target (Vercel, AWS, Strapp Cloud)"
              value={form.web_dev_details.hosting}
              onChange={(e) => updateWeb({ hosting: e.target.value })}
            />
            <textarea
              className="strapp-input px-4 py-3 rounded-xl border-2 border-border focus:border-primary"
              placeholder="Project Requirements & Copywriting Directives"
              value={form.web_dev_details.requirements}
              onChange={(e) => updateWeb({ requirements: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm mt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={form.web_dev_details.assets_pending}
                onChange={(e) => updateWeb({ assets_pending: e.target.checked })}
              />
              Mark Site Assets (Logo/Copy/Media) Pending
            </label>
          </div>
        )}

        {/* REFACTORED MUTATION BAR */}
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            className="bg-panel border border-border px-4 py-2 rounded-xl font-bold flex-1 text-foreground"
            onClick={step === 0 ? onCancel : () => setStep((s) => s - 1)}
          >
            {step === 0 ? "Cancel" : "Back"}
          </button>
          <button
            type="submit"
            className="bg-primary text-background px-4 py-2 rounded-xl font-bold flex-1"
          >
            {step === steps.length - 1 ? (editing ? "Save" : "Add Client") : "Next"}
          </button>
        </div>

        {step > 0 && (
          <button
            type="button"
            className="w-full mt-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-status-prospect underline text-center"
            onClick={onCancel}
          >
            Cancel Operation
          </button>
        )}
      </form>
    </div>
  );
}
