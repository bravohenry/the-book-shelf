
import React from 'react';
import { playSfx } from '../services/audioService';

interface FMPlayerProps {
  isPlaying: boolean;
  onToggle?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const FMPlayer: React.FC<FMPlayerProps> = ({ isPlaying, onToggle, className = '', style = {} }) => {
  return (
    <div 
      onClick={(e) => {
        playSfx('switch');
        if(onToggle) onToggle();
      }}
      className={`relative w-44 h-28 cursor-pointer group shrink-0 select-none transition-transform hover:scale-[1.02] active:scale-[0.98] ${className}`}
      style={style}
      title={isPlaying ? "Turn Off Radio" : "Turn On Radio"}
    >
      {/* Shadow */}
      <div className="absolute bottom-0 left-2 right-2 h-4 bg-black/20 blur-md rounded-full"></div>

      {/* Wood Case */}
      <div className="relative w-full h-full bg-[#a07e5e] rounded-[16px] p-2 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_5px_rgba(0,0,0,0.2)] flex flex-col z-10 border-b-4 border-[#7c5e40]">
        {/* Wood Texture Gradient */}
        <div className="absolute inset-0 rounded-[16px] bg-gradient-to-br from-white/10 to-black/10 pointer-events-none"></div>

        {/* Inner Grey/Silver Bezel Container */}
        <div className="flex-1 bg-[#cfcfcf] rounded-[10px] p-1 flex flex-col shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)] relative overflow-hidden">
            
            {/* Speaker Grille (Top Section) */}
            <div className="flex-[2] bg-[#2d2d2d] rounded-t-[8px] relative overflow-hidden border-b-2 border-[#b0b0b0]">
                {/* Mesh Pattern */}
                <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)',
                        backgroundSize: '3px 3px'
                    }}
                ></div>
                {/* Shadow Gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/5"></div>
            </div>

            {/* Control Panel (Bottom Section) */}
            <div className="flex-1 bg-[#a3a3a3] rounded-b-[8px] flex items-center justify-between px-3 relative">
                {/* Brushed Metal texture */}
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0wIDBMNCA0Wk00IDBMMCA0WiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')]"></div>

                {/* Left Knob */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-500 shadow-[1px_1px_3px_rgba(0,0,0,0.4)] border border-gray-400 relative flex items-center justify-center group-hover:brightness-110 transition-all">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tl from-gray-300 to-gray-100 border border-gray-300"></div>
                    {/* Indent */}
                    <div className={`absolute top-1 w-1 h-2 bg-gray-400 rounded-full transition-transform duration-500 ${isPlaying ? 'rotate-90' : 'rotate-0'}`} style={{ transformOrigin: 'center 12px' }}></div>
                </div>

                {/* Tuner Display Center */}
                <div className="flex-1 mx-2 h-5 bg-[#222] rounded-[2px] relative overflow-hidden border-b border-white/20 shadow-inner flex items-center px-1">
                    {/* Scale Lines */}
                    <div className="flex justify-between w-full px-1">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-[1px] h-2 bg-white/30"></div>
                        ))}
                    </div>
                    
                    {/* Tuner Needle / Light */}
                    <div 
                        className={`absolute top-0 bottom-0 w-[2px] bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)] transition-all duration-[2s] ease-in-out ${isPlaying ? 'left-[70%] opacity-100' : 'left-[10%] opacity-40'}`}
                    ></div>
                    
                    {/* Backlight glow when playing */}
                    {isPlaying && (
                        <div className="absolute inset-0 bg-yellow-500/10 animate-pulse"></div>
                    )}
                </div>

                {/* Right Knob */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-500 shadow-[1px_1px_3px_rgba(0,0,0,0.4)] border border-gray-400 relative flex items-center justify-center group-hover:brightness-110 transition-all">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tl from-gray-300 to-gray-100 border border-gray-300"></div>
                    {/* Indent */}
                    <div className={`absolute top-1 w-1 h-2 bg-gray-400 rounded-full transition-transform duration-500 ${isPlaying ? '-rotate-45' : 'rotate-0'}`} style={{ transformOrigin: 'center 12px' }}></div>
                </div>
            </div>
        </div>
      </div>

      {/* Music Notes Particles */}
      {isPlaying && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-30">
              <div className="absolute top-0 left-1/4 text-ink/40 animate-bounce-subtle font-bold text-lg">♪</div>
              <div className="absolute -top-4 right-1/4 text-ink/40 animate-bounce-subtle font-bold text-sm" style={{ animationDelay: '0.5s' }}>♫</div>
              <div className="absolute -top-8 left-1/2 text-ink/40 animate-bounce-subtle font-bold text-xs" style={{ animationDelay: '1s' }}>♩</div>
          </div>
      )}

    </div>
  );
};

export default FMPlayer;
