"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LoginActivity } from "@/lib/api";
import { formatDate } from "@/lib/format";

// Leaflet's default marker icon references image paths that don't resolve
// once bundled by Next.js/webpack — the standard fix is pointing them at a
// CDN instead of trying to get local asset paths to line up. Blue marks an
// IP-resolved (approximate) location, green marks a precise GPS fix.
const SHADOW_URL = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
const ICON_SIZE: [number, number] = [25, 41];
const ICON_ANCHOR: [number, number] = [12, 41];
const POPUP_ANCHOR: [number, number] = [1, -34];
const SHADOW_SIZE: [number, number] = [41, 41];

const IP_ICON = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: SHADOW_URL,
  iconSize: ICON_SIZE,
  iconAnchor: ICON_ANCHOR,
  popupAnchor: POPUP_ANCHOR,
  shadowSize: SHADOW_SIZE,
});

const GPS_ICON = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: SHADOW_URL,
  iconSize: ICON_SIZE,
  iconAnchor: ICON_ANCHOR,
  popupAnchor: POPUP_ANCHOR,
  shadowSize: SHADOW_SIZE,
});

export function LoginActivityMap({ activities }: { activities: LoginActivity[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      scrollWheelZoom: false,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers: L.Marker[] = [];
    const withCoords = activities.filter(
      (a): a is LoginActivity & { latitude: number; longitude: number } =>
        a.latitude != null && a.longitude != null
    );

    for (const activity of withCoords) {
      const marker = L.marker([activity.latitude, activity.longitude], {
        icon: activity.locationSource === "gps" ? GPS_ICON : IP_ICON,
      }).addTo(map);

      const place = [activity.city, activity.region, activity.country].filter(Boolean).join(", ");
      marker.bindPopup(
        `<strong>${activity.actorName ?? "Unknown"}</strong><br/>` +
          `${activity.actorEmail ?? ""}<br/>` +
          `${place || "Unknown location"}${activity.locationSource === "gps" ? " (GPS)" : " (IP)"}<br/>` +
          `${activity.method} &middot; ${formatDate(activity.createdAt)}`
      );
      markers.push(marker);
    }

    if (withCoords.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.3), { maxZoom: 8 });
    }

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [activities]);

  return (
    <div
      ref={containerRef}
      className="h-[420px] w-full overflow-hidden rounded-2xl border border-line"
    />
  );
}
