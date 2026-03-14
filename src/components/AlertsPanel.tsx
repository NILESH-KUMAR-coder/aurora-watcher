import { motion } from 'framer-motion';
import type { SpaceWeatherAlert } from '@/services/noaa-api';
import { AlertTriangle } from 'lucide-react';

interface AlertsPanelProps {
  alerts: SpaceWeatherAlert[];
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4 space-y-2"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-aurora-purple" />
        <p className="data-label">NOAA Alerts</p>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {alerts.slice(0, 3).map((a, i) => (
          <div key={i} className="p-2 rounded-lg bg-muted/30 text-xs font-mono text-muted-foreground leading-relaxed">
            <span className="text-[10px] text-aurora-cyan">{a.issue_datetime}</span>
            <p className="mt-1 line-clamp-3">{a.message.slice(0, 200)}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
