import { motion } from 'framer-motion';
import type { VisibilityResult } from '@/services/visibility-engine';

interface VisibilityScoreCardProps {
  result: VisibilityResult | null;
  lat: number | null;
  lon: number | null;
  loading?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-aurora-green';
  if (score >= 40) return 'text-aurora-cyan';
  if (score >= 20) return 'text-aurora-purple';
  return 'text-muted-foreground';
}

function getBarColor(score: number): string {
  if (score >= 70) return 'bg-aurora-green';
  if (score >= 40) return 'bg-aurora-cyan';
  if (score >= 20) return 'bg-aurora-purple';
  return 'bg-muted-foreground';
}

function MiniBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-[11px] font-mono text-muted-foreground">{label}</span>
        <span className="text-[11px] font-mono text-foreground">{value}%</span>
      </div>
      <div className="score-bar h-1.5">
        <motion.div
          className={`score-fill ${getBarColor(value)}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default function VisibilityScoreCard({ result, lat, lon, loading }: VisibilityScoreCardProps) {
  if (!lat || !lon) {
    return (
      <div className="glass-panel p-6 text-center">
        <p className="text-muted-foreground font-mono text-sm">
          Select a location on the map or enable GPS to see your visibility score
        </p>
      </div>
    );
  }

  if (loading || !result) {
    return (
      <div className="glass-panel p-6 text-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground font-mono text-sm mt-2">Computing visibility...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-panel p-5 space-y-4"
    >
      {/* Main Score */}
      <div className="text-center">
        <p className="data-label">Visibility Score</p>
        <motion.p
          className={`text-6xl font-mono font-bold mt-1 ${getScoreColor(result.score)}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={result.score}
        >
          {result.score}
        </motion.p>
        <p className="text-sm text-muted-foreground mt-2 font-mono">{result.recommendation}</p>
      </div>

      {/* Breakdown */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <MiniBar label="Aurora Probability" value={result.auroraProbability} />
        <MiniBar label="Clear Skies" value={result.cloudScore} />
        <MiniBar label="Darkness" value={result.darknessScore} />
      </div>

      {/* Location */}
      <p className="text-[10px] font-mono text-muted-foreground text-center pt-1">
        📍 {lat.toFixed(3)}° {lat >= 0 ? 'N' : 'S'}, {lon.toFixed(3)}° {lon >= 0 ? 'E' : 'W'}
      </p>
    </motion.div>
  );
}
