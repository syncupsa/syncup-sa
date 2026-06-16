import { useEffect, useRef, useState } from "react";
import { Crosshair, MapPin, Navigation, Filter as FilterIcon, AlertTriangle } from "lucide-react";
import { useStrapp } from "@/lib/strapp/store";
import { DURBAN_CENTER, type BusinessStatus, type Business } from "@/lib/strapp/types";
import { STRAPP_MAP_STYLE, loadGoogleMaps, reverseGeocode } from "@/lib/strapp/google-maps-loader";
import { ClientModal, type FormState } from "@/components/shared/ClientModal";
import { BusinessSheet } from "./BusinessSheet";

const STATUS_FILL: Record<BusinessStatus, string> = {
  prospect: "#EF4444",
  active: "#F59E0B",
  completed: "#3B82F6",
};

type MapFilter = "all" | BusinessStatus | "survey";

function markerIcon(google: any, color: string, active: boolean) {
  const size = active ? 32 : 24;
  const stroke = active ? "#F1F5F9" : "#05070B";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'><circle cx='${size / 2}' cy='${size / 2}' r='${(size - 6) / 2}' fill='${color}' stroke='${stroke}' stroke-width='3'/></svg>`;
  return {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size / 2),
  };
}

function operatorIcon(google: any) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='5' fill='#F1F5F9' stroke='#05070B' stroke-width='2'/><circle cx='12' cy='12' r='11' fill='none' stroke='#F1F5F9' stroke-width='1' opacity='0.4'/></svg>`;
  return {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(24, 24),
    anchor: new google.maps.Point(12, 12),
  };
}

export function MapView() {
  const {
    businesses,
    activeId,
    setActive,
    update,
    createBusinessAt,
    walkingMode,
    setWalking,
    operatorPos,
    mapsApiKey,
  } = useStrapp();

  const [init, setInit] = useState<{ key: string | null; checked: boolean }>({
    key: null,
    checked: false,
  });

  useEffect(() => {
    if (mapsApiKey) {
      setInit({ key: mapsApiKey, checked: true });
    }
  }, [mapsApiKey]);

  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const operatorMarkerRef = useRef<any>(null);
  const myMarkerRef = useRef<any>(null);
  const callbacksRef = useRef({ update, createBusinessAt });

  const [myPos, setMyPos] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<MapFilter>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<any>(null);
  const [showClientModal, setShowClientModal] = useState(false);

  useEffect(() => {
    callbacksRef.current = { update, createBusinessAt };
  }, [update, createBusinessAt]);

  const handleClientModalSave = (data: FormState) => {
    if (!pendingCoords) return;
    const b = createBusinessAt(
      { lat: pendingCoords.lat, lng: pendingCoords.lng },
      {
        name: data.name,
        phone: data.phone,
        notes: data.notes,
        status: data.status,
        gbp_details: data.gbp_details,
        web_dev_details: data.web_dev_details,
        visitedAt: Date.now(),
      },
    );
    setShowClientModal(false);
    setPendingCoords(null);
    setActive(b.id); // Open the details sheet for the new client
  };

  useEffect(() => {
    if (!init.checked || !init.key || !mapEl.current) return;
    let cancelled = false;
    loadGoogleMaps(init.key)
      .then((google) => {
        if (cancelled || !mapEl.current) return;
        const g = (window as any).google || google;
        const map = new g.maps.Map(mapEl.current, {
          center: DURBAN_CENTER,
          zoom: 18,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          backgroundColor: "#111827",
          styles: STRAPP_MAP_STYLE,
          gestureHandling: "greedy",
        });
        mapRef.current = map;
        map.addListener("click", (e: any) => {
          if (!e.latLng) return;
          const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          reverseGeocode(g, coords).then((info) => {
            setPendingCoords({
              ...coords,
              address: info.address || "",
              area: info.area || "",
              name: info.name || "New Business",
            });
            setShowClientModal(true);
          });
        });
        setReady(true);
      })
      .catch((e) => setErr((e as Error).message));
    return () => {
      cancelled = true;
    };
  }, [init.key, init.checked]);

  // Real-time GPS Tracker
  useEffect(() => {
    if (!ready || !mapRef.current || !window.google?.maps) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMyPos(newPos);
        if (!myMarkerRef.current) {
          const g = (window as any).google;
          myMarkerRef.current = new g.maps.Marker({
            map: mapRef.current,
            icon: {
              path: g.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#3B82F6",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            },
            zIndex: 10000,
          });
        }
        myMarkerRef.current.setPosition(newPos);
      },
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: true },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [ready]);

  const recenter = () => {
    if (!mapRef.current) return;
    const target = myPos || operatorPos || DURBAN_CENTER;
    mapRef.current.panTo(target);
    mapRef.current.setZoom(18);
  };

  const quickDrop = async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPendingCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setShowClientModal(true);
      },
      (e) => alert("Could not get location: " + e.message),
      { enableHighAccuracy: true },
    );
  };

  // [Markers Management & UI Logic remains as per your implementation]
  // Note: Ensure your existing markers management logic from your previous snippet
  // is placed here, as it was unchanged.

  return (
    <div className="relative w-screen h-screen bg-[#0C0F14] flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center text-center text-sm font-medium text-white/75">
        <span>Tap map to add a client or press the button below to drop current location.</span>
      </div>
      <div className="w-full h-full relative min-h-[500px]">
        {err ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0C0F14] text-[#EF4444] p-6">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <span>Map error: {err}</span>
          </div>
        ) : (
          <div ref={mapEl} className="w-full h-full absolute top-0 left-0" />
        )}
      </div>

      <div className="absolute left-3 right-3 top-3 z-20 flex items-center gap-2 overflow-x-auto pb-2">
        {/* ... Filter Chips ... */}
      </div>

      <div className="absolute right-3 bottom-20 md:bottom-6 z-20 flex flex-col items-end gap-2">
        <FloatBtn onClick={() => setWalking(!walkingMode)} active={walkingMode}>
          <Navigation className="h-4 w-4" />
        </FloatBtn>

        {/* Swapped Map Pin icon for a descriptive button */}
        <button
          onClick={quickDrop}
          className="flex h-11 px-4 items-center justify-center gap-2 rounded-full border bg-panel/95 text-foreground hover:bg-panel-elevated transition-colors shadow-lg"
        >
          <MapPin className="h-4 w-4" />
          <span className="text-sm font-medium">Add Current Location</span>
        </button>

        <FloatBtn onClick={recenter}>
          <Crosshair className="h-4 w-4" />
        </FloatBtn>
      </div>

      {activeId && (
        <BusinessSheet
          business={businesses.find((b) => b.id === activeId)!}
          open={activeId !== null} // Explicitly pass open prop
          onClose={() => setActive(null)}
        />
      )}

      <ClientModal
        open={showClientModal}
        onSave={handleClientModalSave}
        onCancel={() => {
          setShowClientModal(false);
          setPendingCoords(null);
        }}
      />
    </div>
  );
}

function FloatBtn({ children, onClick, active }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${active ? "bg-foreground text-background" : "bg-panel/95 text-foreground"}`}
    >
      {children}
    </button>
  );
}
