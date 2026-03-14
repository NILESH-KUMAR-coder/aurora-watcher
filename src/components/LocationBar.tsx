import { useState } from 'react';
import { MapPin, Locate, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface LocationBarProps {
  lat: number | null;
  lon: number | null;
  onRequestGPS: () => void;
  onSetLocation: (lat: number, lon: number) => void;
  gpsLoading: boolean;
}

const PRESETS = [
  { name: 'Tromsø, Norway', lat: 69.65, lon: 18.96 },
  { name: 'Fairbanks, Alaska', lat: 64.84, lon: -147.72 },
  { name: 'Reykjavik, Iceland', lat: 64.13, lon: -21.90 },
  { name: 'Yellowknife, Canada', lat: 62.45, lon: -114.37 },
  { name: 'Rovaniemi, Finland', lat: 66.50, lon: 25.73 },
  { name: 'Abisko, Sweden', lat: 68.35, lon: 18.83 },
];

export default function LocationBar({ lat, lon, onRequestGPS, onSetLocation, gpsLoading }: LocationBarProps) {
  const [showPresets, setShowPresets] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-3"
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onRequestGPS}
          disabled={gpsLoading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-sm font-mono"
        >
          <Locate className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
          {gpsLoading ? 'Locating...' : 'GPS'}
        </button>

        <button
          onClick={() => setShowPresets(!showPresets)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors text-sm font-mono"
        >
          <Search className="w-4 h-4" />
          Aurora Hotspots
        </button>

        {lat != null && lon != null && (
          <div className="flex items-center gap-1 ml-auto text-xs font-mono text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {lat.toFixed(2)}°, {lon.toFixed(2)}°
          </div>
        )}
      </div>

      {showPresets && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3"
        >
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => { onSetLocation(p.lat, p.lon); setShowPresets(false); }}
              className="text-left px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm font-mono transition-colors"
            >
              <span className="text-foreground">{p.name.split(',')[0]}</span>
              <span className="text-muted-foreground text-[10px] block">{p.lat.toFixed(1)}°N</span>
            </button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
