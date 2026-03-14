import { motion } from 'framer-motion';
import type { WeatherData } from '@/services/weather-api';
import { Cloud, Droplets, Eye, Thermometer } from 'lucide-react';

interface WeatherPanelProps {
  weather: WeatherData | null;
  loading: boolean;
}

export default function WeatherPanel({ weather, loading }: WeatherPanelProps) {
  if (loading || !weather) {
    return (
      <div className="glass-panel p-4 text-center">
        <p className="text-muted-foreground font-mono text-xs">
          {loading ? 'Loading weather...' : 'Select location for weather'}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-panel p-4 space-y-3"
    >
      <p className="data-label">Local Conditions</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-[10px] font-mono text-muted-foreground">Cloud Cover</p>
            <p className="text-sm font-mono font-semibold text-foreground">{weather.cloudCover}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-[10px] font-mono text-muted-foreground">Temperature</p>
            <p className="text-sm font-mono font-semibold text-foreground">{weather.temperature}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-[10px] font-mono text-muted-foreground">Visibility</p>
            <p className="text-sm font-mono font-semibold text-foreground">{(weather.visibility / 1000).toFixed(0)}km</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-[10px] font-mono text-muted-foreground">Humidity</p>
            <p className="text-sm font-mono font-semibold text-foreground">{weather.humidity}%</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
