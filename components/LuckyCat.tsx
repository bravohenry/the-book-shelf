
import React from 'react';

interface LuckyCatProps {
    className?: string;
    style?: React.CSSProperties;
}

const LuckyCat: React.FC<LuckyCatProps> = ({ className = '', style = {} }) => {
  return (
    <div 
        className={`relative w-32 h-32 cursor-grab active:cursor-grabbing group shrink-0 select-none transition-transform hover:scale-[1.02] ${className}`}
        style={style}
        title="Lucky Cat"
    >
        {/* Shadow Base */}
        <div className="absolute bottom-1 left-6 right-6 h-3 bg-black/10 blur-md rounded-full"></div>

        {/* Main Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
            
            {/* --- WAVING ARM (Left) --- */}
            <div className="absolute top-8 left-2 z-10 origin-bottom-right animate-[wave_3s_ease-in-out_infinite]">
                 <div className="w-9 h-14 bg-[#fdfdfd] rounded-full border border-gray-200 border-b-4 border-b-gray-300 shadow-sm flex justify-center pt-3">
                     <div className="w-5 h-4 bg-pink-50 rounded-full opacity-60"></div>
                 </div>
            </div>

            {/* --- HEAD --- */}
            <div className="relative z-30 w-20 h-16 bg-[#fdfdfd] rounded-[24px] border border-gray-200 border-b-4 border-b-gray-300 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02)] flex items-center justify-center">
                {/* Ears */}
                <div className="absolute -top-2 left-2 w-6 h-6 bg-[#fdfdfd] rounded-xl border border-gray-200 border-b-2 border-b-gray-300 -rotate-12 z-[-1] overflow-hidden">
                    <div className="absolute top-1 left-1 right-1 bottom-1 bg-[#e74c3c] opacity-80 rounded-md"></div>
                </div>
                <div className="absolute -top-2 right-2 w-6 h-6 bg-[#fdfdfd] rounded-xl border border-gray-200 border-b-2 border-b-gray-300 rotate-12 z-[-1] overflow-hidden">
                    <div className="absolute top-1 left-1 right-1 bottom-1 bg-[#e74c3c] opacity-80 rounded-md"></div>
                </div>

                {/* Face Features (Minimalist) */}
                <div className="flex flex-col items-center justify-center mt-2">
                    <div className="flex gap-4 mb-1">
                        <div className="w-2.5 h-2.5 bg-[#2d2d2d] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#2d2d2d] rounded-full"></div>
                    </div>
                    {/* Nose */}
                    <div className="w-3 h-2 bg-pink-300 rounded-full"></div>
                    {/* No Mouth */}
                </div>
                
                {/* Whiskers (Subtle Indents) */}
                <div className="absolute top-8 -left-1 w-2 h-0.5 bg-gray-200 rounded-full"></div>
                <div className="absolute top-10 -left-1 w-2 h-0.5 bg-gray-200 rounded-full"></div>
                <div className="absolute top-8 -right-1 w-2 h-0.5 bg-gray-200 rounded-full"></div>
                <div className="absolute top-10 -right-1 w-2 h-0.5 bg-gray-200 rounded-full"></div>
            </div>

            {/* --- BODY --- */}
            <div className="relative z-20 w-24 h-16 -mt-3 bg-[#fdfdfd] rounded-[28px] border border-gray-200 border-b-4 border-b-gray-300 shadow-sm flex flex-col items-center">
                 
                 {/* Collar */}
                 <div className="absolute -top-1.5 w-16 h-3.5 bg-[#e74c3c] rounded-full shadow-sm z-20 border-b-2 border-[#c0392b]">
                      {/* Bell */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#f1c40f] rounded-full border border-[#f39c12] shadow-sm"></div>
                 </div>

                 {/* Bib / Belly Panel */}
                 <div className="mt-5 w-12 h-8 bg-[#2ecc71]/10 rounded-xl border border-[#2ecc71]/20 relative overflow-hidden">
                     <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2ecc71] to-transparent"></div>
                 </div>
            </div>

            {/* --- COIN (Right) --- */}
            <div className="absolute bottom-2 right-2 z-40 rotate-[8deg]">
                <div className="w-10 h-14 bg-gradient-to-br from-[#f1c40f] to-[#f39c12] rounded-[12px] border border-[#f39c12] border-b-4 border-b-[#d35400] shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
                     <div className="w-6 h-10 border-2 border-[#d35400]/10 rounded-[6px]"></div>
                </div>
            </div>
        </div>

        <style>{`
            @keyframes wave {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(-25deg); }
            }
        `}</style>
    </div>
  );
};

export default LuckyCat;
