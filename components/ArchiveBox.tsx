import React from 'react';
import { Archive } from 'lucide-react';

interface ArchiveBoxProps {
  isVisible: boolean;
  isHovered: boolean;
  onClick: () => void;
  itemCount: number;
}

const ArchiveBox: React.FC<ArchiveBoxProps> = ({ isVisible, isHovered, onClick, itemCount }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        fixed bottom-6 left-6 z-40 cursor-pointer transition-all duration-500 ease-out group
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}
      `}
    >
      {/* Hover/Drop Hint Text */}
      <div className={`
        absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap font-hand text-ink/50 transition-all duration-300
        ${isHovered ? 'opacity-100 -translate-y-2' : 'opacity-0 translate-y-2'}
      `}>
        drop to archive
      </div>

      <div className="relative w-32 h-24 perspective-1000">
        
        {/* Lid (Back part visible when open) */}
        <div className={`
          absolute top-0 left-0 w-full h-full bg-cardboard-dark rounded-sm origin-top transition-transform duration-300
          ${isHovered ? 'rotate-x-[60deg] -translate-y-6' : 'scale-y-0'}
        `}></div>

        {/* Box Body */}
        <div className="absolute bottom-0 left-0 w-full h-20 bg-cardboard rounded-sm shadow-xl flex items-center justify-center border-b-4 border-cardboard-dark/30 transition-transform duration-300 group-hover:scale-105">
          {/* Texture */}
          <div className="absolute inset-0 bg-noise opacity-10 rounded-sm"></div>
          
          {/* Handle Hole */}
          <div className="w-12 h-3 bg-black/20 rounded-full shadow-inner relative z-10"></div>

          {/* Label */}
          <div className="absolute bottom-2 right-3 font-hand text-ink/40 text-xs tracking-widest font-bold opacity-70">
             eco archive
          </div>
          
          {/* Count Badge */}
          {itemCount > 0 && (
             <div className="absolute -top-2 -right-2 w-6 h-6 bg-ink text-paper rounded-full flex items-center justify-center font-bold font-hand text-xs shadow-md transform transition-transform duration-300 group-hover:scale-110">
                {itemCount}
             </div>
          )}
        </div>

        {/* Lid (Front Flap) */}
        <div className={`
            absolute top-0 left-0 w-full h-[44px] bg-[#e6cfb5] rounded-sm shadow-sm origin-top z-20 transition-all duration-300 border-b border-white/20
            ${isHovered ? 'rotate-x-[-110deg] opacity-0' : 'rotate-x-[0deg]'}
        `}>
           <div className="absolute inset-0 bg-noise opacity-10 rounded-sm"></div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveBox;