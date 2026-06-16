import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  emptyOnboarding,
  emptyPhases,
  emptyServices,
  type Business,
  type BusinessCategory,
  type Campaign,
  type Route,
  type RouteStatus,
  type Template,
  type PaymentLog,
} from "./types";

export type { Business, BusinessCategory, Campaign, Route, RouteStatus, Template, PaymentLog };

// Alias for institutional-grade compatibility
export const useBusinessStore = useStrapp;

// Storage keys for localStorage

const STORAGE_KEY = "strapp-state";
const LEGACY_KEYS = ["strapp", "strapp-data"];

interface State {
  businesses: Business[];
  campaigns: Campaign[]; // Campaign folders (higher level grouping)
  routes: Route[]; // Time-bound route instances
  templates: Template[];
  payments: PaymentLog[];
  activeId: string | null;
  walkingMode: boolean;
  proximitySort: boolean;
  filter: string;
  search: string;
  mapsApiKey: string;
  operatorPos: { lat: number; lng: number } | null;
  revenueGoal: { goal: number; googleAllocation: number; websiteAllocation: number };
  outreachEmail: string;
}

const initial: State = {
  businesses: [],
  routes: [],
  campaigns: [],
  templates: [
    {
      id: "tpl-default",
      name: "Cold Walk-In Intro",
      body:
        "Hi {{name}}, I'm with Strapp — we help Durban businesses get on Google Maps and online. " +
        "Quick free check: I noticed your listing could be optimized. Free 5-min walkthrough?",
    },
  ],
  payments: [],
  activeId: null,
  walkingMode: false,
  proximitySort: false,
  filter: "all",
  search: "",
  mapsApiKey: "",
  operatorPos: null,
  revenueGoal: { goal: 100000, googleAllocation: 30, websiteAllocation: 70 },
  outreachEmail: "",
};

interface Ctx extends State {
  upsert: (b: Business) => void;
  remove: (id: string) => void;
  update: (id: string, patch: Partial<Business>) => void;
  setActive: (id: string | null) => void;
  setWalking: (v: boolean) => void;
  setProximitySort: (v: boolean) => void;
  setFilter: (f: string) => void;
  setSearch: (s: string) => void;
  setMapsApiKey: (k: string) => void;
  setRevenueGoal: (
    g: Partial<{ goal: number; googleAllocation: number; websiteAllocation: number }>,
  ) => void;
  setOutreachEmail: (e: string) => void;
  createBusinessAt: (
    coords: { lat: number; lng: number },
    overrides?: Partial<Business>,
  ) => Business;
  markVisited: (id: string) => void;

  // Routes
  addRoute: (
    campaignId: string,
    input: {
      name: string;
      boundary?: string;
      goalAmount: number;
      rationale?: string;
      tiers?: string[];
      area?: string;
      target?: number;
      bannerLink?: string;
      locationType?: string;
      researchFile?: File | null;
      startDate?: string;
      endDate?: string;
    },
    businessIdsToAssign?: string[],
  ) => Route;
  updateRoute: (id: string, patch: Partial<Route>) => void;
  removeRoute: (id: string) => void;
  setRouteStatus: (id: string, status: RouteStatus) => void;
  assignBusinessToRoute: (businessId: string, routeId: string | null) => void;

  // Campaigns compatibility
  addCampaign: (input: Partial<Campaign>) => Campaign; // New Campaign type
  removeCampaign: (id: string) => void; // New Campaign type
  updateCampaign: (id: string, patch: Partial<Campaign>) => void; // New Campaign type

  // Templates
  addTemplate: (t: Omit<Template, "id">) => Template;
  updateTemplate: (id: string, patch: Partial<Template>) => void;
  removeTemplate: (id: string) => void;

  // Payments
  logPayment: (input: Omit<PaymentLog, "id" | "at"> & { at?: number }) => void;

  // Data
  exportJson: () => string;
  importJson: (raw: string) => boolean;
  resetAll: () => void;
}

const StrappContext = createContext<Ctx | null>(null);

function load(): State {
  if (typeof window === "undefined") return initial;
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const k of LEGACY_KEYS) {
        const v = localStorage.getItem(k);
        if (v) {
          raw = v;
          break;
        }
      }
    }
    if (!raw) return initial;
    const parsed = JSON.parse(raw);
    return {
      ...initial,
      ...parsed,
      campaigns: parsed.campaigns || [],
      routes: parsed.routes || [], // Load new routes array
      templates: parsed.templates && parsed.templates.length ? parsed.templates : initial.templates,
      payments: parsed.payments || [],
      mapsApiKey: parsed.mapsApiKey || "",
      revenueGoal: { ...initial.revenueGoal, ...(parsed.revenueGoal || {}) },
    };
  } catch {
    return initial;
  }
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function newBusiness(
  coords: { lat: number; lng: number },
  overrides: Partial<Business> = {},
): Business {
  return {
    id: uid(),
    name: overrides.name || "New Business",
    category: (overrides.category as BusinessCategory) || "Retail",
    address: overrides.address || "",
    area: overrides.area || "",
    lat: coords.lat,
    lng: coords.lng,
    phone: overrides.phone || "",
    email: overrides.email || "",
    status: overrides.status || "prospect",
    unlisted: overrides.unlisted ?? false,
    followUp: overrides.followUp ?? false,
    visitedAt: overrides.visitedAt ?? null,
    services: overrides.services || emptyServices(),
    manualQuote: overrides.manualQuote ?? 0,
    amountPaid: overrides.amountPaid ?? 0,
    notes: overrides.notes || "",
    gbp_details: overrides.gbp_details || {
      businessName: overrides.name || "New Business",
      address: "",
      hours: "",
      assets_pending: false,
    },
    web_dev_details: overrides.web_dev_details || {
      domain: "",
      hosting: "",
      requirements: "",
      assets_pending: false,
    },
    onboarding: overrides.onboarding || emptyOnboarding(),
    createdAt: Date.now(),
    campaignId: overrides.campaignId ?? null,
  };
}

export function StrappProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [hydrated, setHydrated] = useState(false);
  const watchRef = useRef<number | null>(null);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated || typeof navigator === "undefined" || !navigator.geolocation) return;
    if (state.walkingMode) {
      watchRef.current = navigator.geolocation.watchPosition(
        (pos) =>
          setState((s) => ({
            ...s,
            operatorPos: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          })),
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
      );
      return () => {
        if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      };
    }
  }, [state.walkingMode, hydrated]);

  const upsert = useCallback(
    (b: Business) =>
      setState((s) => {
        const exists = s.businesses.some((x) => x.id === b.id);
        return {
          ...s,
          businesses: exists
            ? s.businesses.map((x) => (x.id === b.id ? b : x))
            : [b, ...s.businesses],
        };
      }),
    [],
  );

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      upsert,
      remove: (id) =>
        setState((s) => ({
          ...s,
          businesses: s.businesses.filter((x) => x.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        })),
      update: (id, patch) =>
        setState((s) => ({
          ...s,
          businesses: s.businesses.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      setActive: (id) => setState((s) => ({ ...s, activeId: id })),
      setWalking: (v) => setState((s) => ({ ...s, walkingMode: v })),
      setProximitySort: (v) => setState((s) => ({ ...s, proximitySort: v })),
      setFilter: (f) => setState((s) => ({ ...s, filter: f })),
      setSearch: (q) => setState((s) => ({ ...s, search: q })),
      setMapsApiKey: (k) => setState((s) => ({ ...s, mapsApiKey: (k || "").trim() })),
      setRevenueGoal: (g) => setState((s) => ({ ...s, revenueGoal: { ...s.revenueGoal, ...g } })),
      setOutreachEmail: (e) => setState((s) => ({ ...s, outreachEmail: e })),
      createBusinessAt: (coords, overrides) => {
        const b = newBusiness(coords, overrides);
        setState((s) => ({
          ...s,
          businesses: [b, ...s.businesses],
          activeId: b.id,
        }));
        return b;
      },
      markVisited: (id) =>
        setState((s) => ({
          ...s,
          businesses: s.businesses.map((x) => (x.id === id ? { ...x, visitedAt: Date.now() } : x)),
        })),

      addRoute: (campaignId, input, businessIdsToAssign) => {
        // Updated signature
        const r: Route = {
          // Changed to Route type
          id: "rt-" + uid(),
          campaignId: campaignId, // Assign campaignId
          name: input.name?.trim() || "Untitled Route",
          boundary: input.boundary?.trim() || input.area?.trim() || "",
          goalAmount: Math.max(0, input.goalAmount ?? input.target ?? 0),
          rationale: input.rationale?.trim() || "",
          tiers: input.tiers && input.tiers.length ? input.tiers : [],
          phases: emptyPhases(),
          status: "active",
          createdAt: Date.now(),
          startDate: input.startDate,
          endDate: input.endDate,
        };
        setState((s) => ({ ...s, routes: [r, ...s.routes] })); // Add to routes array

        // Assign businesses to the new route if provided
        if (businessIdsToAssign && businessIdsToAssign.length > 0) {
          setState((s) => ({
            // Update businesses to reference the new route's ID
            ...s,
            businesses: s.businesses.map((b) =>
              businessIdsToAssign.includes(b.id) ? { ...b, campaignId: r.id } : b,
            ),
          }));
        }
        return r;
      },

      // Campaigns compatibility
      addCampaign: (input) => {
        // Accepts a partial Campaign
        let campaign: Campaign;
        setState((s) => {
          const idx = s.campaigns.findIndex((c) => c.id === input.id); // Find in campaigns array
          if (idx !== -1 && input.id) {
            // Update existing
            campaign = { ...s.campaigns[idx], ...input };
            const campaigns = [...s.campaigns];
            campaigns[idx] = campaign;
            return { ...s, campaigns };
          } else {
            // Add new
            campaign = {
              // Create new Campaign object
              id: input.id || "rt-" + uid(),
              name: input.name?.trim() || "Untitled Route",
              rationale: input.rationale?.trim() || "",
              createdAt: Date.now(),
              area: input.area,
              target: input.target,
              bannerLink: input.bannerLink,
              locationType: input.locationType,
              researchFile: input.researchFile,
            };
            return { ...s, campaigns: [campaign, ...s.campaigns] }; // Add to campaigns array
          }
        });
        return campaign!;
      },
      removeCampaign: (id) => {
        setState((s) => ({
          ...s,
          campaigns: s.campaigns.filter((c) => c.id !== id),
          // When a campaign is removed, its associated routes should also be removed
          routes: s.routes.filter((r) => r.campaignId !== id),
          // Businesses assigned to routes within this campaign should be unassigned
          businesses: s.businesses.map((b) => {
            const associatedRoute = s.routes.find(
              (r) => r.id === b.campaignId && r.campaignId === id,
            );
            return associatedRoute ? { ...b, campaignId: null } : b;
          }),
        }));
      },
      updateCampaign: (id, patch) => {
        setState((s) => ({
          ...s,
          campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }));
      },
      updateRoute: (id, patch) =>
        setState((s) => ({
          ...s,
          routes: s.routes.map((r) => (r.id === id ? { ...r, ...patch } : r)), // Update routes array
        })),
      removeRoute: (id) =>
        setState((s) => ({
          ...s,
          routes: s.routes.filter((r) => r.id !== id), // Remove from routes array
          businesses: s.businesses.map(
            (b) => (b.campaignId === id ? { ...b, campaignId: null } : b), // Unassign businesses from this specific route
          ),
        })),
      setRouteStatus: (id, status) =>
        setState((s) => ({
          ...s,
          routes: s.routes.map((r) => (r.id === id ? { ...r, status } : r)), // Update status in routes array
        })),
      assignBusinessToRoute: (businessId, routeId) =>
        setState((s) => ({
          ...s,
          businesses: s.businesses.map((b) =>
            b.id === businessId ? { ...b, campaignId: routeId } : b,
          ),
        })),

      addTemplate: (t) => {
        const tpl: Template = { id: "tpl-" + uid(), ...t };
        setState((s) => ({ ...s, templates: [tpl, ...s.templates] }));
        return tpl;
      },
      updateTemplate: (id, patch) =>
        setState((s) => ({
          ...s,
          templates: s.templates.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removeTemplate: (id) =>
        setState((s) => ({
          ...s,
          templates: s.templates.filter((t) => t.id !== id),
        })),

      logPayment: ({ businessId, amount, note, at }) =>
        setState((s) => {
          const p: PaymentLog = {
            id: "pay-" + uid(),
            businessId,
            amount: Math.max(0, amount),
            note: note || "",
            at: at ?? Date.now(),
          };
          return {
            ...s,
            payments: [p, ...s.payments],
            businesses: s.businesses.map((b) =>
              b.id === businessId ? { ...b, amountPaid: (b.amountPaid || 0) + p.amount } : b,
            ),
          };
        }),

      exportJson: () => JSON.stringify(state, null, 2),
      importJson: (raw: string) => {
        try {
          const parsed = JSON.parse(raw);
          setState({ ...initial, ...parsed });
          return true;
        } catch {
          return false;
        }
      },
      resetAll: () => setState(initial),
    }),
    [state, upsert],
  );

  return <StrappContext.Provider value={value}>{children}</StrappContext.Provider>;
}

export function useStrapp() {
  const ctx = useContext(StrappContext);
  if (!ctx) throw new Error("useStrapp must be inside StrappProvider");
  return ctx;
}

// Back-compat alias used by older components — points to assignBusinessToRoute
export function assignBusinessToCampaign() {
  throw new Error("Use useStrapp().assignBusinessToRoute instead.");
}
