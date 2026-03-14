import { useMemo, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSpaceWeather } from '@/hooks/useSpaceWeather';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useWeather } from '@/hooks/useWeather';
import { useAuth } from '@/hooks/useAuth';
import { useAlerts } from '@/hooks/useAlerts';
import { computeVisibilityScore } from '@/services/visibility-engine';
import AuroraMap from '@/components/AuroraMap';
import SpaceWeatherPanel from '@/components/SpaceWeatherPanel';
import VisibilityScoreCard from '@/components/VisibilityScoreCard';
import LocationBar from '@/components/LocationBar';
import WeatherPanel from '@/components/WeatherPanel';
import AlertsPanel from '@/components/AlertsPanel';
import SavedLocationsPanel from '@/components/SavedLocationsPanel';
import AlertSettingsPanel from '@/components/AlertSettingsPanel';
import CameraAdvisor from '@/components/CameraAdvisor';
import DarkSkyFinder from '@/components/DarkSkyFinder';
import { Radio, Settings, Map, BarChart3, Compass, LogIn, LogOut, Bell } from 'lucide-react';

type Tab = 'overview' | 'alerts' | 'explore';

export default function Dashboard() {
  const sw = useSpaceWeather();
  const geo = useGeolocation();
  const { weather, loading: weatherLoading } = useWeather(geo.lat, geo.lon);
  const { user, signOut } = useAuth();
  const { settings: alertSettings, createAlert } = useAlerts();
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLon, setMapLon] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showTerminator, setShowTerminator] = useState(true);
  const navigate = useNavigate();

  const activeLat = geo.lat ?? mapLat;
  const activeLon = geo.lon ?? mapLon;

  const visibility = useMemo(() => {
    if (activeLat == null || activeLon == null) return null;
    return computeVisibilityScore(activeLat, activeLon, sw.ovationGrid, weather);
  }, [activeLat, activeLon, sw.ovationGrid, weather]);

  // Alert trigger: check visibility score against threshold
  useEffect(() => {
    if (!user || !visibility || !activeLat || !activeLon) return;
    if (visibility.score >= alertSettings.threshold) {
      createAlert(null, activeLat, activeLon, visibility.score);

      // Browser push notification
      if (alertSettings.push_enabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('🌌 Aurora Alert!', {
          body: `Visibility score ${visibility.score} at your location. ${visibility.recommendation}`,
          icon: '/favicon.ico',
        });
      }
    }
  }, [visibility?.score]); // Only trigger on score changes

  const handleMapClick = useCallback((lat: number, lon: number) => {
    setMapLat(lat);
    setMapLon(lon);
    geo.setManualLocation(lat, lon);
  }, [geo]);

  const tabs: { id: Tab; label: string; icon: typeof Map }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'explore', label: 'Explore', icon: Compass },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center animate-pulse-glow">
              <Radio className="w-4 h-4 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-display font-bold text-foreground tracking-tight">AuroraScope</h1>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Real-Time Aurora Intelligence
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                  activeTab === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {sw.loading ? (
              <span className="text-xs font-mono text-muted-foreground">Connecting...</span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-mono text-primary">
                <span className="status-dot bg-primary" />
                LIVE
              </span>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground hidden sm:block">{user.email?.split('@')[0]}</span>
                <button onClick={signOut} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Sign out">
                  <LogOut className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-mono transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
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

        {/* Map controls */}
        <div className="flex items-center gap-3 px-1">
          <label className="flex items-center gap-2 text-xs font-mono text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={showTerminator}
              onChange={e => setShowTerminator(e.target.checked)}
              className="accent-primary"
            />
            Day/Night Line
          </label>
        </div>

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
              showTerminator={showTerminator}
            />
          </motion.div>

          {/* Sidebar - Tab Content */}
          <div className="space-y-4">
            {activeTab === 'overview' && (
              <>
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
                <CameraAdvisor
                  kpValue={sw.kpIndex?.kpValue ?? null}
                  auroraProbability={visibility?.auroraProbability ?? 0}
                />
                <AlertsPanel alerts={sw.alerts} />
              </>
            )}

            {activeTab === 'alerts' && (
              <>
                <AlertSettingsPanel />
                <SavedLocationsPanel
                  onSelectLocation={handleMapClick}
                  currentLat={activeLat}
                  currentLon={activeLon}
                />
              </>
            )}

            {activeTab === 'explore' && (
              <>
                <DarkSkyFinder
                  ovationGrid={sw.ovationGrid}
                  userLat={activeLat}
                  userLon={activeLon}
                  onSelectLocation={handleMapClick}
                />
                <SavedLocationsPanel
                  onSelectLocation={handleMapClick}
                  currentLat={activeLat}
                  currentLon={activeLon}
                />
                <CameraAdvisor
                  kpValue={sw.kpIndex?.kpValue ?? null}
                  auroraProbability={visibility?.auroraProbability ?? 0}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
