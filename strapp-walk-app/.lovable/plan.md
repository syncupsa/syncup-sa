# STRAPP WALK — Refactor Plan

Evolve the current single-screen "control center" into a clean, mobile-first multi-page operational app while preserving the existing data model (businesses, campaigns, services, ledger, onboarding) and localStorage persistence.

## Architecture

### Routing (TanStack file-based routes)

```
src/routes/
  __root.tsx              shell + StrappProvider + MobileNav + SideSheet
  index.tsx               → /  (Dashboard)
  map.tsx                 → /map
  routes.tsx              → /routes
  clients.tsx             → /clients
  clients.$id.tsx         → /clients/:id  (tabbed detail)
  finance.tsx             → /finance
  outreach.tsx            → /outreach
  templates.tsx           → /templates
  contracts.tsx           → /contracts
  settings.tsx            → /settings
```

Existing `/campaigns` route folded into Routes page (route = walking route, not URL route — they are conceptually similar but kept separate; the old Campaign model becomes the Route model).

### Navigation

- **Bottom tab bar** (mobile-first, fixed): Dashboard · Map · Routes · Clients · Finance. Inline SVG / lucide icons, 56px tall, safe-area-inset-bottom, subtle active state (foreground icon + 2px top accent line, no glow).
- **Top app bar**: page title left, hamburger right. Hamburger opens shadcn `Sheet` from right with: Outreach Hub, Templates, Contracts, Export Data, API Keys, Settings.
- Desktop ≥ md: same bottom bar hidden, top bar gets inline nav links.

## Visual System

Update `src/styles.css`:

- Confirm tokens: bg `#05070B`, panel `#0E131F`, border `#1E293B`, text `#F1F5F9`, muted `#64748B`, status cold/active/deployed unchanged.
- Add generous spacing rhythm utilities; remove the global `border-radius: 0 !important` override — keep crisp but allow 4–6px on cards/buttons for a calm modern feel (Linear/Stripe vibe, not brutalist terminal).
- Typography: Inter 400/500/600, JetBrains Mono reserved for `.font-mono` use on money/coords/IDs only.
- Remove any glow/gradient/heavy-shadow utilities left over.

## Pages

### Dashboard (`/`)

- KPI row (4 cards): Revenue this month, Active routes, Outstanding follow-ups, Active projects.
- Today's tasks list (derived: businesses with `followUp=true` or visited >14 days ago).
- Revenue progress bar against `revenueGoal`.
- Recent activity (last 5 visited/paid businesses).
- Quick actions: New target, Open map, Start walking mode.

### Map (`/map`)

- Full-bleed Google Maps using `AIzaSyBlFLYc1snoPI7FX2Q1aJK1Kx8GwsvkxpI` (replace placeholder key, drop the "set API key" prompt).
- Floating top: filter chips (Prospect/Active/Completed/Survey).
- Floating bottom-right above tab bar: Walking Mode toggle + Quick Drop pin button.
- Tap map → reverse-geocode → create business → open bottom sheet (shadcn `Sheet` from bottom) with quick form.
- Pin colours by status; current operator pulse dot when walking.

### Routes (`/routes`)

- Re-frame `Campaign` model as `Route` (rename label only, keep `campaignId` field for back-compat).
- Route cards: suburb, % complete (visited/total assigned), opportunity value (sum totalQuote), businesses remaining, revisit count.
- "New Route" sheet: name, suburb, goal amount.
- Tap card → expanded view with assigned businesses list and phase checklist (intake/outreach/deployment renamed Survey/Outreach/Deployment).

### Clients (`/clients`)

- Segmented tabs: Prospects · Active · Completed.
- Search + sort.
- Card per business with name, area, status dot, balance due (mono).
- Tap → `/clients/$id` with tabs: Overview · Services · Payments · Website Project · Notes · Files.
  - Files tab: simple localStorage-backed list of filenames + notes (no real upload backend; placeholder explained in copy as "link a file reference").

### Finance (`/finance`)

- Top: total revenue, outstanding balance, deposits collected, this-week revenue.
- Revenue split: Google listings vs Websites vs WhatsApp vs SEO (computed from services).
- Payment log: list of all `amountPaid > 0` businesses with date.
- Log Payment action: pick client → enter amount → updates `amountPaid`.
- Invoice generator: client + selected services → printable HTML view (window.print).

### Outreach / Templates / Contracts / Settings

- Outreach: existing message generator moved here.
- Templates: editable saved message templates in localStorage.
- Contracts: simple template-fill form generating a printable contract.
- Settings: revenue goal, operator email, export/import JSON (full localStorage dump).

## State / Persistence

- Keep `StrappProvider`, `strapp.intel.v4` storage key, all existing types.
- Add `templates: Template[]` and `payments: PaymentLog[]` to state with migration from existing data.
- Hardcode the new Google Maps API key as default; remove the key-entry UI but keep override in Settings.

## Files to create

- `src/components/nav/BottomTabBar.tsx`
- `src/components/nav/TopBar.tsx`
- `src/components/nav/SideSheet.tsx`
- `src/components/dashboard/KpiCard.tsx`, `TasksList.tsx`, `RecentActivity.tsx`
- `src/components/map/MapView.tsx` (refactor of TacticalMap), `MapFilters.tsx`, `BusinessSheet.tsx`
- `src/components/routes/RouteCard.tsx`, `RouteDetail.tsx`, `NewRouteSheet.tsx`
- `src/components/clients/ClientList.tsx`, `ClientCard.tsx`, `ClientDetail.tsx` + tab subcomponents
- `src/components/finance/FinanceOverview.tsx`, `PaymentLogger.tsx`, `InvoiceGenerator.tsx`
- `src/components/outreach/*`, `src/components/settings/*`
- New route files listed above.

## Files to modify

- `src/styles.css` — relax radius override, refine tokens.
- `src/lib/strapp/store.tsx` — new default API key, templates, payments, exports.
- `src/lib/strapp/types.ts` — `Template`, `PaymentLog` additions.
- `src/routes/__root.tsx` — new shell with TopBar + Outlet + BottomTabBar + SideSheet.

## Files to remove

- `src/components/strapp/ControlBar.tsx`, `UtilityDock.tsx`, `TacticalMap.tsx`, `TargetList.tsx`, `InspectionDrawer.tsx`, `CampaignCenter.tsx` (logic absorbed into new componentized pages).
- `src/routes/campaigns.tsx` (replaced by `/routes`).

## Out of scope for this pass

- Real file upload backend (Files tab is metadata only).
- Supabase migration (kept localStorage; structure is ready for swap).
- Real contract PDF generation (uses print-to-PDF via browser).
