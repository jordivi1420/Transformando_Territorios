import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import { useMemo } from "react";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapView({ points = [], height = 480, center }) {
  const defaultCenter = useMemo(() => {
    if (center) return center;
    if (points.length) {
      const lat = points.reduce((s, p) => s + p.lat, 0) / points.length;
      const lng = points.reduce((s, p) => s + p.lng, 0) / points.length;
      return [lat, lng];
    }
    return [4.6, -74.08]; // Colombia default
  }, [points, center]);

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }} data-testid="map-view">
      <MapContainer center={defaultCenter} zoom={points.length > 1 ? 5 : 6} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{p.label}</div>
                {p.description && <div className="text-slate-600 mt-1">{p.description}</div>}
                {p.status && (
                  <div className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-mono uppercase ${
                    p.status === "activo" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>{p.status}</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        {points.map((p) => (
          <CircleMarker
            key={`c-${p.id}`}
            center={[p.lat, p.lng]}
            radius={16}
            pathOptions={{ color: p.status === "activo" ? "#047857" : "#D97706", fillOpacity: 0.15, weight: 1 }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
