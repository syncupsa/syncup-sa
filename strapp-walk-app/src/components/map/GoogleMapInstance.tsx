import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { useStrapp } from "@/lib/strapp/store";

interface MapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
}

/**
 * INSTITUTIONAL GRADE GOOGLE MAPS COMPONENT
 * Unified with dynamic LocalStorage 'strapp-state' key configuration
 * Fixed: Backwards-compatible execution loop for older @googlemaps/js-api-loader versions
 */
export const GoogleMapInstance: React.FC<MapProps> = ({ center, zoom }) => {
  const { update } = useStrapp();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resolvedApiKey, setResolvedApiKey] = useState<string | null>(null);

  // 1. Core State Ingestion Guard: Sync with unified application data store
  useEffect(() => {
    try {
      const rawState = localStorage.getItem("strapp-state");
      if (rawState) {
        const parsed = JSON.parse(rawState);
        const dynamicKey = parsed?.mapsApiKey || parsed?.state?.mapsApiKey;
        if (dynamicKey && dynamicKey.trim() !== "") {
          setResolvedApiKey(dynamicKey);
          return;
        }
      }
    } catch (e) {
      console.error("[Instance Guard] Failed parsing localStorage state: ", e);
    }

    // Fallback lookup step to local environment configuration parameters
    const fallbackEnvKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (fallbackEnvKey) {
      setResolvedApiKey(fallbackEnvKey);
    } else {
      setLoadError(
        "Google Maps API key missing. Key could not be extracted from storage pipeline ('strapp-state').",
      );
    }
  }, []);

  // 2. Map Instance Initialization Pipeline
  useEffect(() => {
    if (!resolvedApiKey || map || !mapRef.current) return;

    // Direct Window Check: Enforce runtime global object initialization safety parameters
    if (typeof window !== "undefined" && window.google?.maps) {
      const instance = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        disableDefaultUI: false,
        clickableIcons: true,
      });
      setMap(instance);
      return;
    }

    // Instantiating the loader instance cleanly
    const loader = new Loader({
      apiKey: resolvedApiKey,
      version: "weekly",
      libraries: ["places", "geometry"],
    });

    // COMPILATION FIX: Cast the loader wrapper explicitly to a safe execution context
    // to utilize standard Promise-based .load() matching older package versions.
    (loader as any)
      .load()
      .then(() => {
        if (mapRef.current) {
          console.log(
            `[Instance Layout Audit] Box Width: ${mapRef.current.clientWidth}px | Height: ${mapRef.current.clientHeight}px`,
          );

          const instance = new google.maps.Map(mapRef.current, {
            center,
            zoom,
            disableDefaultUI: false,
            clickableIcons: true,
          });
          setMap(instance);
        }
      })
      .catch((e: unknown) => {
        console.error("GCP Infrastructure Error inside Loader context:", e);
        setLoadError(e instanceof Error ? e.message : String(e));
      });
  }, [resolvedApiKey, map, center, zoom]);

  // 3. Reactive Coordinates Alignment Synchronizer Loop
  useEffect(() => {
    if (map) {
      map.panTo(center);
    }
  }, [center, map]);

  useEffect(() => {
    if (map) {
      map.setZoom(zoom);
    }
  }, [zoom, map]);

  if (loadError) {
    return <MapFallback center={center} reason={loadError} apiKey={resolvedApiKey} />;
  }

  return (
    <div className="relative w-full h-full min-h-[400px] flex flex-col grow">
      {!map && <MapSkeleton />}
      <div
        ref={mapRef}
        className="w-full h-full absolute inset-0 block"
        style={{ minHeight: "100%", minWidth: "100%", borderRadius: "8px" }}
      />
    </div>
  );
};

/**
 * GRACEFUL FALLBACK (Static Maps API Execution Context)
 */
const MapFallback: React.FC<{
  center: google.maps.LatLngLiteral;
  reason: string;
  apiKey: string | null;
}> = ({ center, reason, apiKey }) => {
  const validKey = apiKey || "MISSING_KEY";
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=14&size=600x400&key=${validKey}`;

  return (
    <div className="map-error-container w-full p-4 text-center rounded-lg border border-red-500/30 bg-red-950/10 backdrop-blur">
      <p className="text-red-500 font-bold tracking-tight text-sm">
        Interactive Map Engine Offline
      </p>
      <p className="text-[11px] font-mono text-gray-400 mt-1 max-w-md mx-auto overflow-hidden text-ellipsis whitespace-nowrap">
        {reason}
      </p>
      {apiKey && (
        <img
          src={staticMapUrl}
          alt="Static Backup Routing Map Viewport"
          className="w-full h-auto mt-3 rounded border border-gray-800 object-cover max-h-[280px]"
        />
      )}
    </div>
  );
};

const MapSkeleton = () => (
  <div className="absolute inset-0 w-full h-full bg-[#0d0f14] flex flex-col items-center justify-center z-10 rounded-lg border border-gray-900">
    <div className="loader-pulse text-xs font-mono tracking-widest uppercase">
      Initializing Durban Geodata Matrix...
    </div>
    <style>{`
      .loader-pulse {
        animation: pulse 1.8s infinite ease-in-out;
        color: #4b5563;
      }
      @keyframes pulse {
        0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; }
      }
    `}</style>
  </div>
);
