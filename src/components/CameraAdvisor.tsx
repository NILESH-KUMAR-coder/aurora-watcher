import { motion } from 'framer-motion';
import { Camera, Aperture, Clock, Gauge } from 'lucide-react';

interface CameraAdvisorProps {
  kpValue: number | null;
  auroraProbability: number;
}

function getSettings(kp: number, prob: number) {
  // Brighter aurora = lower ISO / faster shutter
  const brightness = Math.max(kp, prob / 15);

  let iso: string, aperture: string, shutter: string, advice: string;

  if (brightness >= 6) {
    iso = '800-1600';
    aperture = 'f/2.8';
    shutter = '3-6s';
    advice = 'Bright aurora! Keep ISO low to reduce noise. Short exposures to capture movement.';
  } else if (brightness >= 4) {
    iso = '1600-3200';
    aperture = 'f/2.8 - f/2';
    shutter = '6-10s';
    advice = 'Moderate aurora. Balance exposure time with ISO. Use a fast lens.';
  } else if (brightness >= 2) {
    iso = '3200-6400';
    aperture = 'f/1.8 - f/1.4';
    shutter = '10-15s';
    advice = 'Faint aurora. Open aperture wide and increase ISO. Longer exposures needed.';
  } else {
    iso = '6400+';
    aperture = 'f/1.4';
    shutter = '15-25s';
    advice = 'Very faint conditions. Max out aperture. Consider stacking multiple exposures.';
  }

  return { iso, aperture, shutter, advice };
}

export default function CameraAdvisor({ kpValue, auroraProbability }: CameraAdvisorProps) {
  const kp = kpValue ?? 0;
  const { iso, aperture, shutter, advice } = getSettings(kp, auroraProbability);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Camera className="w-4 h-4 text-primary" />
        <p className="data-label">Camera Settings Advisor</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-lg bg-muted/30 text-center">
          <Gauge className="w-4 h-4 text-aurora-cyan mx-auto mb-1" />
          <p className="text-[10px] font-mono text-muted-foreground">ISO</p>
          <p className="text-sm font-mono font-bold text-foreground">{iso}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 text-center">
          <Aperture className="w-4 h-4 text-aurora-green mx-auto mb-1" />
          <p className="text-[10px] font-mono text-muted-foreground">Aperture</p>
          <p className="text-sm font-mono font-bold text-foreground">{aperture}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 text-center">
          <Clock className="w-4 h-4 text-aurora-purple mx-auto mb-1" />
          <p className="text-[10px] font-mono text-muted-foreground">Shutter</p>
          <p className="text-sm font-mono font-bold text-foreground">{shutter}</p>
        </div>
      </div>

      <p className="text-xs font-mono text-muted-foreground leading-relaxed">{advice}</p>
      <p className="text-[10px] font-mono text-muted-foreground/60">Based on Kp {kp.toFixed(1)} • Tip: Use manual focus to infinity, shoot RAW</p>
    </motion.div>
  );
}
