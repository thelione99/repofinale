import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  borderRed?: boolean;
}

const GlassPanel: React.FC<GlassPanelProps> = ({ 
  children, 
  className = '', 
  intensity = 'medium',
  borderRed = false
}) => {
  const bgOpacity = {
    low: 'bg-neutral-900/40',
    medium: 'bg-neutral-900/60',
    high: 'bg-neutral-950/80',
  };

  const backdrop = {
    low: 'backdrop-blur-sm',
    medium: 'backdrop-blur-md',
    high: 'backdrop-blur-xl',
  };

  const borderColor = borderRed 
    ? 'border-red-500/30' 
    : 'border-white/10';

  return (
    <div className={`
      relative overflow-hidden rounded-2xl border shadow-2xl
      ${bgOpacity[intensity]} 
      ${backdrop[intensity]} 
      ${borderColor}
      ${className}
    `}>
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

export default GlassPanel;