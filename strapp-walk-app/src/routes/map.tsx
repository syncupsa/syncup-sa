import { createFileRoute } from "@tanstack/react-router";
import { MapView } from "@/components/map/MapView";

export const Route = createFileRoute("/map")({
  component: MapPage,
  head: () => ({
    meta: [
      { title: "Map · STRAPP Walk" },
      {
        name: "description",
        content: "Geographic intelligence layer — pins, walking mode, target drop.",
      },
    ],
  }),
});

function MapPage() {
  return (
    <div className="relative h-screen w-screen">
      <MapView />
    </div>
  );
}
