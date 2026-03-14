import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useAlerts, type AlertSettings } from '@/hooks/useAlerts';
import { Bell, BellOff, Trash2, Check, LogIn } from 'lucide-react';

export default function AlertSettingsPanel() {
  const { user } = useAuth();
  const { settings, alerts, updateSettings, markRead, clearAlerts } = useAlerts();
  const [threshold, setThreshold] = useState(settings.threshold);

  if (!user) {
    return (
      <div className="glass-panel p-4 text-center">
        <LogIn className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
        <p className="text-xs font-mono text-muted-foreground">Sign in to configure alerts</p>
      </div>
    );
  }

  const handleThresholdChange = (val: number) => {
    setThreshold(val);
    updateSettings({ threshold: val });
  };

  const requestPush = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      updateSettings({ push_enabled: perm === 'granted' });
    }
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Settings */}
      <div className="glass-panel p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <p className="data-label">Alert Settings</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-muted-foreground">Visibility Threshold</span>
            <span className="text-sm font-mono font-bold text-foreground">{threshold}</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={threshold}
            onChange={e => handleThresholdChange(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <p className="text-[10px] font-mono text-muted-foreground">Alert when visibility score exceeds this value</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground">Browser Notifications</span>
          <button
            onClick={requestPush}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              settings.push_enabled
                ? 'bg-primary/20 text-primary'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {settings.push_enabled ? 'Enabled' : 'Enable'}
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="glass-panel p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellOff className="w-4 h-4 text-muted-foreground" />
            <p className="data-label">Recent Alerts</p>
            {unreadCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </div>
          {alerts.length > 0 && (
            <button onClick={clearAlerts} className="text-[10px] font-mono text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {alerts.length === 0 ? (
          <p className="text-xs font-mono text-muted-foreground text-center py-3">No alerts yet</p>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {alerts.map(a => (
              <div
                key={a.id}
                className={`p-2 rounded-lg transition-colors ${a.read ? 'bg-transparent' : 'bg-primary/5'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-foreground">
                    Score: <strong>{a.visibility_score}</strong>
                    {a.location_name && ` — ${a.location_name}`}
                  </span>
                  {!a.read && (
                    <button onClick={() => markRead(a.id)} className="p-0.5 hover:bg-primary/20 rounded">
                      <Check className="w-3 h-3 text-primary" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {new Date(a.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
