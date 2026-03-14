import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { OvationPoint } from '@/services/noaa-api';
import { computeTerminatorPoints } from '@/services/terminator';

interface AuroraMapProps {
  ovationGrid: OvationPoint[];
  userLat?: number | null;
  userLon?: number | null;
  onMapClick?: (lat: number, lon: number) => void;
  showTerminator?: boolean;
}

function getAuroraColor(probability: number): string {
  if (probability > 70) return 'rgba(0, 255, 100, 0.6)';
  if (probability > 40) return 'rgba(0, 230, 180, 0.45)';
  if (probability > 20) return 'rgba(80, 120, 255, 0.35)';
  return 'rgba(140, 80, 220, 0.2)';
}

export default function AuroraMap({ ovationGrid, userLat, userLon, onMapClick, showTerminator = true }: AuroraMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const auroraLayerRef = useRef<L.LayerGroup | null>(null);
  const terminatorLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [65, 0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 8,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const tilePane = map.getPane('tilePane');
    if (tilePane) tilePane.style.filter = 'none';

    auroraLayerRef.current = L.layerGroup().addTo(map);
    terminatorLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update click handler
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.off('click');
    mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    });
  }, [onMapClick]);

  // Render aurora overlay
  useEffect(() => {
    if (!auroraLayerRef.current) return;
    auroraLayerRef.current.clearLayers();

    const step = 2;
    const filtered = ovationGrid.filter((_, i) => i % step === 0);

    for (const pt of filtered) {
      const radius = Math.max(30000, pt.probability * 800);
      L.circle([pt.lat, pt.lon], {
        radius,
        color: 'transparent',
        fillColor: getAuroraColor(pt.probability),
        fillOpacity: Math.min(0.7, pt.probability / 100),
        interactive: false,
      }).addTo(auroraLayerRef.current!);
    }
  }, [ovationGrid]);

  // Day/Night terminator
  useEffect(() => {
    if (!terminatorLayerRef.current) return;
    terminatorLayerRef.current.clearLayers();

    if (!showTerminator) return;

    const points = computeTerminatorPoints();
    if (points.length > 0) {
      // Draw terminator line
      L.polyline(points, {
        color: 'rgba(255, 200, 50, 0.5)',
        weight: 2,
        dashArray: '8, 6',
        interactive: false,
      }).addTo(terminatorLayerRef.current);
    }
  }, [showTerminator, ovationGrid]); // re-render with data updates

  // User marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    if (userLat != null && userLon != null) {
      userMarkerRef.current = L.circleMarker([userLat, userLon], {
        radius: 8,
        color: 'hsl(170, 80%, 45%)',
        fillColor: 'hsl(170, 80%, 45%)',
        fillOpacity: 0.8,
        weight: 2,
      }).addTo(mapRef.current);

      userMarkerRef.current.bindPopup(
        `<div style="font-family: monospace; color: #0ee; background: #111; padding: 4px 8px; border-radius: 4px;">
          📍 ${userLat.toFixed(2)}°, ${userLon.toFixed(2)}°
        </div>`,
        { className: 'aurora-popup' }
      );
    }
  }, [userLat, userLon]);

  return (
    <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" style={{ minHeight: 400 }} />
  );
}
