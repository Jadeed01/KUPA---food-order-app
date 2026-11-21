import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// custom pin (styled in index.css) so we don't depend on Leaflet's default marker images
const pinIcon = L.divIcon({
  className: "kupa-pin",
  html: "<span></span>",
  iconSize: [36, 36],
  iconAnchor: [18, 43],
});

function ClickToMove({ onChange }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 16), { duration: 0.8 });
  }, [target, map]);
  return null;
}

// the page slides in, so recalc the map size once the animation settles
function SizeFix() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 350);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export default function LocationPicker({ position, flyTo, onChange }) {
  return (
    <MapContainer center={[position.lat, position.lng]} zoom={16} zoomControl={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={[position.lat, position.lng]}
        icon={pinIcon}
        draggable
        eventHandlers={{
          dragend(e) {
            const ll = e.target.getLatLng();
            onChange(ll.lat, ll.lng);
          },
        }}
      />
      <ClickToMove onChange={onChange} />
      <FlyTo target={flyTo} />
      <SizeFix />
    </MapContainer>
  );
}