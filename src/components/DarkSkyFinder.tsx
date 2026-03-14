import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Moon, MapPin } from 'lucide-react';
import type { OvationPoint } from '@/services/noaa-api';
import type { WeatherData } from '@/services/weather-api';

interface DarkSkyFinderProps {
  ovationGrid: OvationPoint[];
  userLat: number | null;
  userLon: number | null;
  onSelectLocation: (lat: number, lon: number) => void;
}

// Known dark sky sites (Bortle class < 4)
const DARK_SKY_SITES = [
  { name: 'Jasper Dark Sky Preserve', lat: 52.87, lon: -117.95, bortle: 2 },
  { name: 'Cherry Springs State Park', lat: 41.66, lon: -77.82, bortle: 2 },
  { name: 'Aoraki Mackenzie, NZ', lat: -44.00, lon: 170.47, bortle: 1 },
  { name: 'Northumberland Dark Sky Park', lat: 55.28, lon: -2.23, bortle: 3 },
  { name: 'Galloway Forest Park', lat: 55.10, lon: -4.47, bortle: 2 },
  { name: 'Abisko National Park', lat: 68.35, lon: 18.83, bortle: 2 },
  { name: 'Kiruna, Sweden', lat: 67.86, lon: 20.22, bortle: 3 },
  { name: 'Denali National Park', lat: 63.73, lon: -149.00, bortle: 1 },
  { name: 'Wood Buffalo National Park', lat: 59.36, lon: -112.27, bortle: 1 },
  { name: 'Exmoor Dark Sky Reserve', lat: 51.16, lon: -3.62, bortle: 3 },
];

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNearestAuroraProbability(lat: number, lon: number, grid: OvationPoint[]): number {
  if (grid.length === 0) return 0;
  let closest = grid[0];
  let minDist = Infinity;
  for (const pt of grid) {
    const d = (pt.lat - lat) ** 2 + (pt.lon - lon) ** 2;
    if (d < minDist) { minDist = d; closest = pt; }
  }
  return Math.sqrt(minDist) > 3 ? 0 : closest.probability;
}

export default function DarkSkyFinder({ ovationGrid, userLat, userLon, onSelectLocation }: DarkSkyFinderProps) {
  const suggestions = useMemo(() => {
    return DARK_SKY_SITES
      .map(site => ({
        ...site,
        auroraProbability: getNearestAuroraProbability(site.lat, site.lon, ovationGrid),
        distance: userLat && userLon ? haversineDistance(userLat, userLon, site.lat, site.lon) : null,
      }))
      .filter(s => s.auroraProbability > 5)
      .sort((a, b) => b.auroraProbability - a.auroraProbability)
      .slice(0, 5);
  }, [ovationGrid, userLat, userLon]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Moon className="w-4 h-4 text-primary" />
        <p className="data-label">Dark Sky Suggestions</p>
      </div>

      {suggestions.length === 0 ? (
        <p className="text-xs font-mono text-muted-foreground text-center py-3">
          No high-probability dark sky sites right now. Check back during geomagnetic activity.
        </p>
      ) : (
        <div className="space-y-2">
          {suggestions.map(s => (
            <button
              key={s.name}
              onClick={() => onSelectLocation(s.lat, s.lon)}
              className="w-full text-left p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-3 h-3 text-aurora-green shrink-0" />
                  <span className="text-sm font-mono text-foreground truncate">{s.name}</span>
                </div>
                <span className="text-xs font-mono text-aurora-cyan shrink-0">{s.auroraProbability}%</span>
              </div>
              <div className="flex gap-3 mt-1">
                <span className="text-[10px] font-mono text-muted-foreground">Bortle {s.bortle}</span>
                {s.distance && (
                  <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                    <Navigation className="w-2.5 h-2.5" /> {Math.round(s.distance)} km
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
