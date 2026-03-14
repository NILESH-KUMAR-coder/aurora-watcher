import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSavedLocations } from '@/hooks/useSavedLocations';
import { MapPin, Star, Trash2, Plus, LogIn } from 'lucide-react';

interface SavedLocationsPanelProps {
  onSelectLocation: (lat: number, lon: number) => void;
  currentLat?: number | null;
  currentLon?: number | null;
}

export default function SavedLocationsPanel({ onSelectLocation, currentLat, currentLon }: SavedLocationsPanelProps) {
  const { user } = useAuth();
  const { locations, saveLocation, deleteLocation } = useSavedLocations();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');

  if (!user) {
    return (
      <div className="glass-panel p-4 text-center">
        <LogIn className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
        <p className="text-xs font-mono text-muted-foreground">Sign in to save locations</p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!name.trim() || !currentLat || !currentLon) return;
    await saveLocation(name.trim(), currentLat, currentLon);
    setName('');
    setShowAdd(false);
  };

  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" />
          <p className="data-label">Saved Locations</p>
        </div>
        {currentLat && currentLon && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="text-xs font-mono text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Save Current
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex gap-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Location name"
                className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              <button onClick={handleSave} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono">
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {locations.length === 0 ? (
        <p className="text-xs font-mono text-muted-foreground text-center py-2">No saved locations yet</p>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {locations.map(loc => (
            <div
              key={loc.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => onSelectLocation(loc.latitude, loc.longitude)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-3 h-3 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-mono text-foreground truncate">{loc.location_name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                  </p>
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); deleteLocation(loc.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
