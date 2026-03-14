import { motion } from 'framer-motion';
import type { MagData, PlasmaData, KpIndexEntry } from '@/services/noaa-api';

interface SpaceWeatherPanelProps {
  mag: MagData | null;
  plasma: PlasmaData | null;
  kpIndex: KpIndexEntry | null;
  auroraTriggered: boolean;
  substormWarning: boolean;
  lastUpdated: Date | null;
}

function DataCard({ label, value, unit, color = 'text-foreground' }: {
  label: string; value: string | number; unit?: string; color?: string;
}) {
  return (
    <div className="glass-panel p-4 space-y-1">
      <p className="data-label">{label}</p>
      <p className={`data-value ${color}`}>
        {value}
        {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
      </p>
    </div>
  );
}

function KpGauge({ value }: { value: number }) {
  const getColor = (kp: number) => {
    if (kp >= 7) return 'bg-destructive';
    if (kp >= 5) return 'bg-aurora-purple';
    if (kp >= 4) return 'bg-aurora-cyan';
    if (kp >= 2) return 'bg-aurora-green';
    return 'bg-muted-foreground';
  };

  const getLabel = (kp: number) => {
    if (kp >= 8) return 'Extreme Storm';
    if (kp >= 7) return 'Severe Storm';
    if (kp >= 5) return 'Geomagnetic Storm';
    if (kp >= 4) return 'Active';
    if (kp >= 2) return 'Unsettled';
    return 'Quiet';
  };

  return (
    <div className="glass-panel p-4">
      <p className="data-label">Kp Index</p>
      <div className="flex items-end gap-3 mt-2">
        <span className="data-value">{value.toFixed(1)}</span>
        <span className={`text-xs font-mono px-2 py-0.5 rounded ${getColor(value)} text-primary-foreground`}>
          {getLabel(value)}
        </span>
      </div>
      <div className="score-bar mt-3">
        <motion.div
          className={`score-fill ${getColor(value)}`}
          initial={{ width: 0 }}
          animate={{ width: `${(value / 9) * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] font-mono text-muted-foreground">0</span>
        <span className="text-[10px] font-mono text-muted-foreground">9</span>
      </div>
    </div>
  );
}

export default function SpaceWeatherPanel({
  mag, plasma, kpIndex, auroraTriggered, substormWarning, lastUpdated
}: SpaceWeatherPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-3"
    >
      {/* Status indicators */}
      <div className="flex items-center gap-4 px-1">
        <div className="flex items-center gap-2">
          <div className={`status-dot ${auroraTriggered ? 'bg-aurora-green' : 'bg-muted-foreground'}`} />
          <span className="text-xs font-mono text-muted-foreground">
            {auroraTriggered ? 'AURORA ACTIVE' : 'MONITORING'}
          </span>
        </div>
        {substormWarning && (
          <div className="flex items-center gap-2">
            <div className="status-dot bg-aurora-purple" />
            <span className="text-xs font-mono text-aurora-purple">SUBSTORM WARNING</span>
          </div>
        )}
        {lastUpdated && (
          <span className="text-[10px] font-mono text-muted-foreground ml-auto">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* IMF Data */}
      <div className="grid grid-cols-3 gap-2">
        <DataCard
          label="Bz (IMF)"
          value={mag?.bz.toFixed(1) ?? '—'}
          unit="nT"
          color={mag && mag.bz < -7 ? 'text-aurora-green' : 'text-foreground'}
        />
        <DataCard label="Bx" value={mag?.bx.toFixed(1) ?? '—'} unit="nT" />
        <DataCard label="By" value={mag?.by.toFixed(1) ?? '—'} unit="nT" />
      </div>

      {/* Solar Wind */}
      <div className="grid grid-cols-3 gap-2">
        <DataCard
          label="Solar Wind"
          value={plasma?.speed.toFixed(0) ?? '—'}
          unit="km/s"
          color={plasma && plasma.speed > 500 ? 'text-aurora-cyan' : 'text-foreground'}
        />
        <DataCard label="Density" value={plasma?.density.toFixed(1) ?? '—'} unit="p/cm³" />
        <DataCard label="Temp" value={plasma ? (plasma.temperature / 1000).toFixed(0) : '—'} unit="kK" />
      </div>

      {/* KP Index */}
      {kpIndex && <KpGauge value={kpIndex.kpValue} />}
    </motion.div>
  );
}
