import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Radio, MapPin, Zap, Eye } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Aurora background effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full opacity-20 blur-[120px] animate-aurora-shimmer"
          style={{ background: 'radial-gradient(ellipse, hsl(120 70% 50% / 0.4), transparent)' }}
        />
        <div
          className="absolute top-20 right-1/4 w-[500px] h-[350px] rounded-full opacity-15 blur-[100px] animate-aurora-shimmer"
          style={{ background: 'radial-gradient(ellipse, hsl(280 60% 55% / 0.4), transparent)', animationDelay: '1.5s' }}
        />
        <div
          className="absolute bottom-0 left-1/2 w-[700px] h-[300px] rounded-full opacity-10 blur-[130px]"
          style={{ background: 'radial-gradient(ellipse, hsl(170 80% 45% / 0.3), transparent)' }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center max-w-2xl"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
            className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-8 animate-pulse-glow"
          >
            <Radio className="w-8 h-8 text-primary" />
          </motion.div>

          <h1 className="text-5xl sm:text-7xl font-display font-bold text-foreground tracking-tight leading-tight">
            Aurora
            <span className="text-primary">Scope</span>
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-muted-foreground font-mono max-w-lg mx-auto">
            Real-time aurora forecasting for astrophotographers. Know exactly when and where to shoot.
          </p>

          {/* CTA */}
          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-10 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-lg tracking-wide hover:brightness-110 transition-all aurora-glow"
          >
            Open Dashboard →
          </motion.button>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16"
          >
            {[
              { icon: Zap, title: 'Live Space Weather', desc: 'NOAA DSCOVR satellite data updated every 60 seconds' },
              { icon: Eye, title: 'Visibility Score', desc: 'Aurora + clouds + darkness combined into one smart score' },
              { icon: MapPin, title: 'Interactive Map', desc: 'OVATION aurora probability heatmap across the globe' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-panel p-5 text-left">
                <Icon className="w-5 h-5 text-primary mb-3" />
                <h3 className="font-display font-semibold text-foreground text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground font-mono mt-1">{desc}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <p className="absolute bottom-6 text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
          Data from NOAA Space Weather Prediction Center
        </p>
      </div>
    </div>
  );
}
