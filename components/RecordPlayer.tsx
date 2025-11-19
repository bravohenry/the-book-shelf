
import React from 'react';

interface RecordPlayerProps {
  isPlaying: boolean;
  onToggle: () => void;
}

const RecordPlayer: React.FC<RecordPlayerProps> = ({ isPlaying, onToggle }) => {
  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="relative w-32 h-20 mx-4 cursor-pointer group shrink-0 select-none"
      title={isPlaying ? "Pause Music" : "Play Lo-Fi"}
    >
      {/* Base */}
      <div className="absolute bottom-0 w-full h-12 bg-[#8c6b4a] rounded-md shadow-lg border-t border-[#a38360] flex items-center justify-center z-10">
         {/* Wood texture overlay */}
         <div className="absolute inset-0 bg-black/10 rounded-md mix-blend-overlay"></div>
         
         {/* Front Controls */}
         <div className="flex gap-3 items-center justify-center mt-1">
            <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${isPlaying ? 'bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.8)]' : 'bg-red-900'}`}></div>
            <div className="w-8 h-1 bg-black/30 rounded-full"></div>
            <div className="w-2 h-2 rounded-full bg-black/40 border border-white/10"></div>
         </div>
      </div>

      {/* Platter (Turntable) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-28 h-28 bg-[#2a2a2a] rounded-full shadow-md border-4 border-[#1a1a1a] transform scale-y-[0.35] origin-bottom z-0"></div>

      {/* Vinyl Record */}
      <div 
        className={`
            absolute bottom-[34px] left-1/2 -translate-x-1/2 w-24 h-24 rounded-full 
            bg-[#111] border-[6px] border-[#1a1a1a] z-0
            shadow-inner flex items-center justify-center
            origin-center transform-gpu scale-y-[0.35]
        `}
        style={{
            // We simulate the 3D tilt with scale-y, but we need the spin to look flat 'on top'
            // CSS 3D transforms would be better but complex to integrate with current flat setup.
            // Instead, we spin a container, but because of the scale-y, a simple spin looks wobbling in 2D.
            // We will cheat: The visual below is just the 'edge'. The top view is hard in 2.5D.
            // Let's simplify: Just animate the label spinning if we can. 
            // Actually, for this perspective (front-on), a spinning disk is hard to see.
            // We will skip the complex spin animation and rely on the Arm movement and Music notes for feedback.
        }}
      >
        {/* Label */}
        <div className={`w-8 h-8 bg-pastel-pink rounded-full border-4 border-white/10 relative ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-black rounded-full"></div>
        </div>
      </div>

      {/* Tonearm */}
      <div 
        className={`
            absolute bottom-10 right-2 w-1 h-20 bg-[#d4d4d4] rounded-full origin-bottom transition-transform duration-1000 ease-in-out border-r border-black/20 z-20
        `}
        style={{
            transform: isPlaying ? 'rotate(-25deg) translateX(-10px)' : 'rotate(15deg)',
            boxShadow: '2px 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        {/* Counterweight */}
        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-3 h-4 bg-[#555] rounded-sm"></div>
        {/* Headshull */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-4 bg-[#333] rounded-sm"></div>
      </div>

      {/* Music Notes Particles (Simple CSS animation) */}
      {isPlaying && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-30">
              <div className="absolute top-0 left-1/4 text-ink/40 animate-bounce-subtle font-bold text-lg">♪</div>
              <div className="absolute -top-4 right-1/4 text-ink/40 animate-bounce-subtle font-bold text-sm" style={{ animationDelay: '0.5s' }}>♫</div>
              <div className="absolute -top-8 left-1/2 text-ink/40 animate-bounce-subtle font-bold text-xs" style={{ animationDelay: '1s' }}>♩</div>
          </div>
      )}

    </div>
  );
};

export default RecordPlayer;
