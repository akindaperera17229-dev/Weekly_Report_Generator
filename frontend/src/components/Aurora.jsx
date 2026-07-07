import React from 'react';
import './Aurora.css';

export default function Aurora({ colorStops = ["#5227FF","#7cff67","#5227FF"], amplitude = 1, blend = 0.5 }) {
  const stops = colorStops && colorStops.length >= 3 ? colorStops : ["#5227FF","#7cff67","#5227FF"];
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-slate-950/20 dark:bg-slate-950/40 rounded-3xl">
      {/* Aurora blur layer */}
      <div 
        className="absolute inset-0 blur-[80px] md:blur-[100px] opacity-35 mix-blend-screen dark:mix-blend-lighten transition-opacity duration-1000"
        style={{ opacity: blend }}
      >
        {/* Blob 1 */}
        <div 
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full animate-aurora-blob-1"
          style={{ 
            backgroundColor: stops[0],
            transform: `scale(${amplitude})`,
          }}
        ></div>
        
        {/* Blob 2 */}
        <div 
          className="absolute -top-[5%] -right-[15%] w-[55%] h-[55%] rounded-full animate-aurora-blob-2"
          style={{ 
            backgroundColor: stops[1],
            transform: `scale(${amplitude * 0.9})`,
          }}
        ></div>
        
        {/* Blob 3 */}
        <div 
          className="absolute top-[15%] left-[15%] w-[45%] h-[45%] rounded-full animate-aurora-blob-3"
          style={{ 
            backgroundColor: stops[2],
            transform: `scale(${amplitude * 1.1})`,
          }}
        ></div>
      </div>
      {/* Darkening overlay mask */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950/35 pointer-events-none rounded-3xl"></div>
    </div>
  );
}
