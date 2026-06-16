# Map Feature Deep-Dive Analysis

## 1. CODE ARCHITECTURE

### File Involvement & Execution Flow

#### a. src/lib/strapp/store.tsx

- **Purpose:** Central state management (businesses, API key, etc.)
- **Key Exports:** `useStrapp` (context hook), state shape, and update methods.
- **Execution:**
  - On app mount, loads state from localStorage (`strapp-state`).
  - Exposes `mapsApiKey` via context to consumers (e.g., MapView).

#### b. src/components/map/MapView.tsx

- **Purpose:** Main map display and logic.
- **Execution Flow:**
  1. On mount, parses `strapp-state` from localStorage to extract `mapsApiKey`.
  2. If `apiKey` is valid, triggers Google Maps script injection (via loader or custom logic).
  3. Waits for `window.google.maps` to be available before initializing the map instance.
  4. Renders map inside a flex layout wrapper to guarantee non-zero height.
  5. Handles map events, overlays, and error UI.

#### c. src/components/map/GoogleMapInstance.tsx (if used)

- **Purpose:** Lower-level Google Maps API integration.
- **Execution:**
  - Receives props (center, zoom, etc.)
  - Loads Google Maps API using loader and initializes map in a ref container.

#### d. src/lib/strapp/google-maps-loader.ts

- **Purpose:** Handles script injection and Google Maps API loading.
- **Execution:**
  - Exports a function to inject the script if not present.
  - Resolves when `window.google.maps` is available.

#### e. src/components/shared/ClientModal.tsx, BusinessSheet.tsx, etc.

- **Purpose:** UI overlays and modals triggered by map events.
- **Execution:**
  - Rendered conditionally based on map state (e.g., pin click).

### Data Flow & State Transitions

- **localStorage → store.tsx:** On app load, state is parsed from `strapp-state`.
- **store.tsx → MapView.tsx:** Context provides `mapsApiKey` and business data.
- **MapView.tsx → GoogleMapInstance.tsx:** Passes API key, center, zoom, and event handlers.
- **MapView.tsx → DOM:** Renders map container and overlays.

## 2. UI & LAYOUT MECHANICS

### Map Container

- **Flex Layout:**
  - `.relative.h-screen.w-screen.flex.flex-col` ensures the map always fills the viewport.
  - `.grow.w-full.h-full.min-h-[400px]` on the map wrapper guarantees non-zero height.
- **Map Mount Node:**
  - The map is mounted inside the grow div, which is always visible.

### Adjacent Components

- **Overlays:**
  - Modals, filter chips, and floating buttons are absolutely positioned within the relative parent.
- **Tailwind Classes:**
  - `.absolute`, `.z-20`, `.left-3`, `.top-3`, etc., control overlay positioning.
  - `.pointer-events-none` disables interaction for hints.

### Rendering Cycles

- **Initial Render:**
  - Map container is always present and sized, preventing layout collapse.
- **State Changes:**
  - Map only initializes after API key and script are ready, avoiding race conditions.

---

# UI & LAYOUT MECHANICS

- **Map container:** Always has a non-zero height due to flex and min-h-[400px].
- **Overlays:** Use absolute positioning and z-index for stacking.
- **Buttons:** Floating controls are in a flex column, bottom-right.
- **Modals:** Rendered above the map, controlled by state.

---

# 3. INSTITUTIONAL-GRADE TEST PLAN

## 1. LocalStorage State Parsing Delay / Race Conditions

- Clear localStorage and reload the app.
- Log: `console.log('localStorage strapp-state:', localStorage.getItem('strapp-state'))` before map init.
- Set `strapp-state` with and without `mapsApiKey`.
- Reload and confirm map only initializes when key is present.
- Log: `console.log('API key used:', apiKey)`.
- Test: Remove key at runtime, reload, confirm map does not initialize.

## 2. Parent Container Layout Boundaries

- Inspect DOM: Confirm `.grow.w-full.h-full.min-h-[400px]` is present.
- Log: `console.log('Map container clientHeight:', mapContainerRef.current?.clientHeight)` after mount.
- Test: Remove `.grow` or `min-h-[400px]`, reload, confirm map collapses to 0px.
- Restore, confirm map is visible.

## 3. Network Layer & Script Loading

- Simulate offline: Disable network, reload, confirm error UI appears.
- Log: `console.log('Script load error:', error)` on script failure.
- Use invalid API key: Confirm Google Maps error overlays appear.
- Use restricted key: Confirm referrer/billing errors in browser console.
- Log: `console.log('window.google.maps:', !!window.google?.maps)` before map init.

---

# END OF ANALYSIS
