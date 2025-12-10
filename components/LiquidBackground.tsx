import React from 'react';

export const LiquidBackground: React.FC = () => {
  // Classi base ottimizzate per le performance
  // will-change-transform: avvisa il browser che l'elemento si muoverà
  // translate-z-0: forza l'accelerazione hardware
  const blobBase = "absolute rounded-full mix-blend-screen filter opacity-20 will-change-transform translate-z-0";

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-black">
      
      {/* OTTIMIZZAZIONE:
        1. Ridotto il blur su mobile (blur-[60px]) -> aumenta su desktop (md:blur-[150px])
        2. Aggiunto transform-gpu per forzare l'uso della scheda video
      */}

      {/* Top Left Blob */}
      <div className={`
        ${blobBase}
        top-[-10%] left-[-10%] 
        w-[300px] h-[300px] md:w-[600px] md:h-[600px] 
        bg-red-900/40 
        blur-[60px] md:blur-[150px] 
        animate-pulse-slow
      `}></div>

      {/* Bottom Right Blob */}
      <div className={`
        ${blobBase}
        bottom-[-10%] right-[-10%] 
        w-[350px] h-[350px] md:w-[700px] md:h-[700px] 
        bg-red-950/40 
        blur-[60px] md:blur-[150px] 
        animate-pulse-slow delay-1000
      `}></div>

      {/* Center Dynamic Blob */}
      <div className={`
        ${blobBase}
        top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
        w-64 h-64 md:w-96 md:h-96 
        bg-red-800/20 
        blur-[50px] md:blur-[100px] 
        opacity-10 
        animate-float
      `}></div>
      
      {/* Noise overlay - Ottimizzato */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 md:opacity-10 brightness-100 contrast-150 mix-blend-overlay"></div>
    </div>
  );
};