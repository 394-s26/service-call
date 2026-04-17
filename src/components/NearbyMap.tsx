import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ServiceProvider } from "../types";

interface NearbyMapProps {
  providers: ServiceProvider[];
  userLat: number;
  userLng: number;
  showUserLocation?: boolean;
  onProviderClick?: (provider: ServiceProvider) => void;
}

// Blue pulsing dot for the user's own location
const userIcon = L.divIcon({
  className: "user-location-marker",
  html: `
    <div style="position:relative;width:20px;height:20px;">
      <div style="position:absolute;inset:0;background:#3b82f6;border-radius:50%;opacity:.35;animation:userPulse 1.8s ease-out infinite;"></div>
      <div style="position:absolute;inset:4px;background:#3b82f6;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 1px rgba(0,0,0,.15);"></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Red dot for available providers
const providerIcon = L.divIcon({
  className: "provider-marker",
  html: `<div style="width:16px;height:16px;background:#ef4444;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.25);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Grey dot for unavailable providers
const unavailableIcon = L.divIcon({
  className: "provider-marker-off",
  html: `<div style="width:14px;height:14px;background:#9ca3af;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.2);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Re-fit the map bounds when data changes
function FitBounds({
  userLat,
  userLng,
  points,
}: {
  userLat: number;
  userLng: number;
  points: [number, number][];
}) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) {
      map.setView([userLat, userLng], 13);
      return;
    }
    const bounds = L.latLngBounds([[userLat, userLng], ...points]);
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 });
  }, [map, userLat, userLng, points]);
  return null;
}

export const NearbyMap = ({
  providers,
  userLat,
  userLng,
  showUserLocation = true,
  onProviderClick,
}: NearbyMapProps) => {
  const points = useMemo(
    () =>
      providers
        .filter((p) => p.latitude != null && p.longitude != null)
        .map((p) => [p.latitude as number, p.longitude as number] as [number, number]),
    [providers]
  );

  return (
    <div className="relative h-56 w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <MapContainer
        center={[userLat, userLng]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showUserLocation && (
          <Marker position={[userLat, userLng]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {providers
          .filter((p) => p.latitude != null && p.longitude != null)
          .map((p) => (
            <Marker
              key={p.id}
              position={[p.latitude as number, p.longitude as number]}
              icon={p.available ? providerIcon : unavailableIcon}
              eventHandlers={
                onProviderClick ? { click: () => onProviderClick(p) } : undefined
              }
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-bold">{p.businessName || p.name}</div>
                  <div className="text-gray-500">{p.category}</div>
                  <div className="mt-1">
                    ⭐ {p.rating} · ${p.inspectionFee} visit
                  </div>
                  {!p.available && (
                    <div className="text-gray-400 text-xs mt-1">Unavailable</div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

        <FitBounds userLat={userLat} userLng={userLng} points={points} />
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-gray-600 flex items-center gap-3 shadow-sm z-[400]">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" /> You
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Available
        </span>
      </div>
    </div>
  );
};
