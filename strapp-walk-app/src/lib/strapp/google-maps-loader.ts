declare global {
  interface Window {
    google?: any;
    __strappGmapsPromise?: Promise<any>;
    __strappGmapsKey?: string;
  }
}

export function loadGoogleMaps(apiKey: string): Promise<any> {
  console.log("[STRAPP][loadGoogleMaps] Called with apiKey:", apiKey);

  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve(null);
  }

  if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
    console.error("🔥 Strapp Maps Error: Google Maps API key is missing or blank.");
    return Promise.reject(new Error("Missing API Key"));
  }

  if (window.google?.maps) return Promise.resolve(window.google);

  // STABILIZED SINGLETON: Never remove the script once it is in flight.
  // If the key truly changes, the promise will still resolve or fail,
  // but we prevent the mid-lifecycle DOM removal that causes the silent crash.
  if (window.__strappGmapsPromise && window.__strappGmapsKey === apiKey) {
    return window.__strappGmapsPromise;
  }

  window.__strappGmapsKey = apiKey;
  window.__strappGmapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-strapp-gmaps="1"]');
    if (existing && window.google?.maps) {
      resolve(window.google);
      return;
    }

    const cbName = `__strappGmapsCb_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    (window as any)[cbName] = () => {
      resolve(window.google);
      delete (window as any)[cbName];
    };

    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&callback=${cbName}&loading=async`;
    s.async = true;
    s.defer = true;
    s.dataset.strappGmaps = "1";

    s.onerror = () => {
      delete window.__strappGmapsPromise;
      reject(new Error("Failed to load Google Maps script"));
    };

    // Synchronous allocation guarantees layout engine prevents multi-load collisions
    document.head.appendChild(s);
  });

  return window.__strappGmapsPromise;
}

// Fixed Theme: Swapped pure dark definitions for a high-contrast charcoal layout schema
export const STRAPP_MAP_STYLE: any[] = [
  { elementType: "geometry", stylers: [{ color: "#1F2937" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9CA3AF" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#111827" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "on" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#374151" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#D1D5DB" }],
  },
  { featureType: "poi", stylers: [{ visibility: "on" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#111827" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#374151" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#374151" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#4B5563" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#6B7280" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9CA3AF" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#1D4ED8" }] }, // High-visibility Blue Water
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9CA3AF" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#111827" }] },
];

export async function reverseGeocode(
  google: any,
  coords: { lat: number; lng: number },
): Promise<{ name?: string; address?: string; area?: string }> {
  return new Promise((resolve) => {
    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: coords }, (results: any[], status: string) => {
        if (status !== "OK" || !results || results.length === 0) {
          resolve({});
          return;
        }
        const r = results[0];
        const comps = r.address_components || [];
        const area =
          comps.find((c: any) => c.types.includes("sublocality"))?.long_name ||
          comps.find((c: any) => c.types.includes("locality"))?.long_name ||
          "";
        const premise = comps.find((c: any) => c.types.includes("premise"))?.long_name;
        resolve({ name: premise, address: r.formatted_address, area });
      });
    } catch {
      resolve({});
    }
  });
}
