import { useMemo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useSpaceWeather } from '@/hooks/useSpaceWeather';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useWeather } from '@/hooks/useWeather';
import { computeVisibilityScore } from '@/services/visibility-engine';
import AuroraMap from '@/components/AuroraMap';
import SpaceWeatherPanel from '@/components/SpaceWeatherPanel';
import VisibilityScoreCard from '@/components/VisibilityScoreCard';
import LocationBar from '@/components/LocationBar';
import WeatherPanel from '@/components/WeatherPanel';
import AlertsPanel from '@/components/AlertsPanel';
import { Radio } from 'lucide-react';

export default function Dashboard() {
  const sw = useSpaceWeather();
  const geo = useGeolocation();
  const { weather, loading: weatherLoading } = useWeather(geo.lat, geo.lon);
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLon, setMapLon] = useState<number | null>(null);

  const activeLat = geo.lat ?? mapLat;
  const activeLon = geo.lon ?? mapLon;

  const visibility = useMemo(() => {
    if (activeLat == null || activeLon == null) return null;
    return computeVisibilityScore(activeLat, activeLon, sw.ovationGrid, weather);
  }, [activeLat, activeLon, sw.ovationGrid, weather]);

  const handleMapClick = useCallback((lat: number, lon: number) => {
    setMapLat(lat);
    setMapLon(lon);
    geo.setManualLocation(lat, lon);
  }, [geo]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center animate-pulse-glow">
              <Radio className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-foreground tracking-tight">AuroraScope</h1>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Real-Time Aurora Intelligence
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {sw.loading ? (
              <span className="text-xs font-mono text-muted-foreground">Connecting to NOAA...</span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-mono text-primary">
                <span className="status-dot bg-primary" />
                LIVE
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 space-y-4">
        {/* Location Bar */}
        <LocationBar
          lat={activeLat}
          lon={activeLon}
          onRequestGPS={geo.requestLocation}
          onSetLocation={handleMapClick}
          gpsLoading={geo.loading}
        />

        {/* Main Grid: Map + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="glass-panel overflow-hidden"
            style={{ minHeight: 500 }}
          >
            <AuroraMap
              ovationGrid={sw.ovationGrid}
              userLat={activeLat}
              userLon={activeLon}
              onMapClick={handleMapClick}
            />
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-4">
            <VisibilityScoreCard
              result={visibility}
              lat={activeLat}
              lon={activeLon}
              loading={weatherLoading && !!activeLat}
            />
            <WeatherPanel weather={weather} loading={weatherLoading} />
            <SpaceWeatherPanel
              mag={sw.mag}
              plasma={sw.plasma}
              kpIndex={sw.kpIndex}
              auroraTriggered={sw.auroraTriggered}
              substormWarning={sw.substormWarning}
              lastUpdated={sw.lastUpdated}
            />
            <AlertsPanel alerts={sw.alerts} />
          </div>
        </div>
      </main>
    </div>
  );
}
