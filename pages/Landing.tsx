import React from 'react';
import { LiquidBackground } from '../components/LiquidBackground';
import { GlassCard } from '../components/GlassCard';

const Landing: React.FC = () => {
  return (
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-black selection:bg-red-500 selection:text-white">
      <LiquidBackground />
      
      <div className="relative z-10 w-full max-w-md flex items-center justify-center px-4">
        <GlassCard />
      </div>

      <div className="absolute bottom-4 text-neutral-600 text-xs font-mono tracking-widest z-10 pointer-events-none">
        DESIGN @gregoriogondola_ // 2025
      </div>
    </div>
  );
};

export default Landing;