export type BusinessStatus = "prospect" | "active" | "completed";
export type BusinessCategory =
  | "Retail"
  | "Industrial"
  | "Professional Services"
  | "Food & Beverage"
  | "Automotive"
  | "Other";

export interface OnboardingChecklist {
  logoReceived: boolean;
  photosReceived: boolean;
  domainPurchased: boolean;
  whatsappConnected: boolean;
  googleVerified: boolean;
}

export interface BusinessServices {
  googleMaps: boolean; // R500
  website: boolean; // R4000
  whatsapp: boolean; // R500
  seo: boolean; // R500
}

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  address: string;
  area: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  status: BusinessStatus;
  unlisted: boolean;
  followUp: boolean;
  visitedAt: number | null;
  services: BusinessServices;
  manualQuote: number;
  amountPaid: number;
  notes: string;
  onboarding: OnboardingChecklist;
  gbp_details?: {
    businessName: string;
    address: string;
    hours: string;
    assets_pending: boolean;
  };
  web_dev_details?: {
    domain: string;
    hosting: string;
    requirements: string;
    assets_pending: boolean;
  };
  createdAt: number;
  campaignId?: string | null; // → walking route id
  // Optional fields for website and onboarding
  websiteUrl?: string;
  domainRegistrar?: string;
  whatsapp?: string;
  googleVerification?: string;
}

export type RouteStatus = "active" | "paused" | "concluded";

export interface RoutePhases {
  // This is still relevant for Route
  intake: boolean; // Survey
  outreach: boolean; // Outreach
  deployment: boolean; // Deployment
}

export interface Campaign {
  // The "folder"
  id: string;
  name: string;
  rationale: string;
  createdAt: number;
  area?: string; // Campaign-level area
  target?: number; // Campaign-level target
  bannerLink?: string;
  locationType?: string;
  researchFile?: File | null;
}

export interface Route {
  // The "time-bound instance"
  id: string;
  campaignId: string; // Foreign key to Campaign
  name: string;
  boundary?: string; // Specific boundary for this route instance
  goalAmount: number; // Goal for this specific route
  status: RouteStatus;
  startDate?: string;
  endDate?: string;
  tiers: string[]; // Tiers specific to this route instance
  phases: RoutePhases; // Phases specific to this route instance
  createdAt: number;
  rationale?: string;
  // Optional fields for compatibility with CampaignsPage
}

export type CampaignStatus = RouteStatus;
export type CampaignPhases = RoutePhases;

export interface Template {
  id: string;
  name: string;
  body: string;
}

export interface PaymentLog {
  id: string;
  businessId: string;
  amount: number;
  note: string;
  at: number;
}

export function emptyPhases(): RoutePhases {
  // Still used by Route
  return { intake: false, outreach: false, deployment: false };
}

export function routeRevenue(r: Route, businesses: Business[]): number {
  // Update type to Route
  return businesses
    .filter((b) => b.campaignId === r.id)
    .reduce((a, b) => a + (b.amountPaid || 0), 0);
}

export const campaignRevenue = routeRevenue;

export function routeOpportunity(r: Route, businesses: Business[]): number {
  // Update type to Route
  return businesses.filter((b) => b.campaignId === r.id).reduce((a, b) => a + totalQuote(b), 0);
}

export function routeProgress(r: Route, businesses: Business[]): number {
  // Update type to Route
  const list = businesses.filter((b) => b.campaignId === r.id);
  if (list.length === 0) return 0;
  const done = list.filter((b) => b.status === "completed").length;
  return Math.round((done / list.length) * 100);
}

export const PRICE_GOOGLE = 500;
export const PRICE_WEBSITE = 4000;
export const PRICE_WHATSAPP = 500;
export const PRICE_SEO = 500;

export const DURBAN_CENTER = { lat: -29.8587, lng: 31.0218 };

export function servicesValue(b: Business): number {
  return (
    (b.services.googleMaps ? PRICE_GOOGLE : 0) +
    (b.services.website ? PRICE_WEBSITE : 0) +
    (b.services.whatsapp ? PRICE_WHATSAPP : 0) +
    (b.services.seo ? PRICE_SEO : 0)
  );
}

export function totalQuote(b: Business): number {
  return b.manualQuote && b.manualQuote > 0 ? b.manualQuote : servicesValue(b);
}

export function balanceDue(b: Business): number {
  return Math.max(0, totalQuote(b) - (b.amountPaid || 0));
}

export function emptyOnboarding(): OnboardingChecklist {
  return {
    logoReceived: false,
    photosReceived: false,
    domainPurchased: false,
    whatsappConnected: false,
    googleVerified: false,
  };
}

export function emptyServices(): BusinessServices {
  return { googleMaps: false, website: false, whatsapp: false, seo: false };
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatZAR(n: number): string {
  return "R " + Math.round(n).toLocaleString("en-ZA");
}
