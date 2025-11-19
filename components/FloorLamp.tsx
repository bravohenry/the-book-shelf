import React, { useEffect, useRef, useState } from 'react';

interface FloorLampProps {
  x: number; // 0-100 percentage
  height: number; // 0-100
  angle: number; // Arm Angle
  onChange: (updates: { x?: number; height?: number; angle?: number }) => void;
  themeBg: string;
  lightColor: string;
  isLightOn: boolean;
}

const FloorLamp: React.FC<FloorLampProps> = ({ 
  x, height, angle, onChange, 
  themeBg, lightColor, isLightOn 
}) => {
  // --- GEOMETRY ---
  // 1. Vertical Pole (Telescopic)
  const MIN_POLE_H = 200;
  const MAX_POLE_H = 600;
  const currentPoleHeight = MIN_POLE_H + (height / 100) * (MAX_POLE_H - MIN_POLE_H);

  // 2. Upper Arm (Fixed Length)
  const UPPER_ARM_LEN = 240;
  
  // Base Rotation for Arm (0 passed in = 135deg visual)
  const BASE_ARM_ROTATION = 135; 
  const currentArmRotation = BASE_ARM_ROTATION + angle;

  // --- REFS ---
  const kneeRef = useRef<HTMLDivElement>(null);

  // --- INTERACTION STATE ---
  const dragState = useRef<{
    type: 'base' | 'pole' | 'arm' | null;
    startX: number;
    startY: number;
    initVal: number;
  }>({ type: null, startX: 0, startY: 0, initVal: 0 });


  // --- MOUSE HANDLERS ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.current.type) return;
      
      const { startX, startY, initVal, type } = dragState.current;
      
      if (type === 'base') {
        // Sliding X
        const deltaX = e.clientX - startX;
        const pxToPercent = 100 / window.innerWidth;
        const nextX = Math.min(95, Math.max(5, initVal + (deltaX * pxToPercent)));
        onChange({ x: nextX });
      } 
      else if (type === 'pole') {
        // Elevator Y
        const deltaY = e.clientY - startY;
        const range = MAX_POLE_H - MIN_POLE_H;
        const percentChange = (deltaY / range) * 100;
        // Drag DOWN (+Y) -> Decrease Height
        const nextH = Math.min(100, Math.max(0, initVal - percentChange));
        onChange({ height: nextH });
      }
      else if (type === 'arm') {
        // --- IK: ARM LOOK-AT ---
        // Rotate arm to point at mouse
        if (kneeRef.current) {
            const rect = kneeRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;

            // Calculate angle from Knee to Mouse
            const rads = Math.atan2(dy, dx);
            const degs = rads * (180 / Math.PI);
            
            // Convert to CSS frame (Up = 0 deg visually? No, CSS rotate starts at 3 o'clock usually? No, CSS default 0 is 12 o'clock if defined that way)
            // Here we just want relative changes.
            // We map the mouse angle directly to the arm rotation relative to the base rotation.
            
            // Calculate the absolute angle we want (offset by 90 because typical CSS 0 is up, atan2 0 is right)
            const absAngle = degs + 90;
            
            // We want 'angle' prop such that BASE_ARM_ROTATION + angle = absAngle
            const newAngleProp = absAngle - BASE_ARM_ROTATION;
            
            onChange({ angle: newAngleProp });
        }
      }
    };

    const handleMouseUp = () => {
      if (dragState.current.type) {
        dragState.current.type = null;
        document.body.style.cursor = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onChange, angle]); 

  const startDrag = (e: React.MouseEvent, type: 'base' | 'pole' | 'arm', val: number, cursor: string) => {
    e.preventDefault();
    e.stopPropagation();
    dragState.current = { type, startX: e.clientX, startY: e.clientY, initVal: val };
    document.body.style.cursor = cursor;
  };

  // Color Handling
  // Darker version of the background for the lamp body (Pop Art style contrast)
  const lampColorStyle = {
     backgroundColor: themeBg,
     // Reduced brightness significantly to create a deep, rich tone of the background color
     filter: 'brightness(0.3) saturate(1.2) sepia(0.2) contrast(1.2)',
  };

  return (
    <div 
      className="absolute bottom-0 z-30 flex flex-col items-center transition-transform duration-75 ease-out will-change-transform"
      style={{ 
        left: `${x}%`,
        transform: 'translateX(-50%)', 
      }}
    >
      <div className="relative w-0 h-0">
        
        {/* --- VERTICAL POLE (Bottom) --- */}
        <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[6px] rounded-t-full origin-bottom shadow-md group cursor-ns-resize"
            style={{ height: `${currentPoleHeight}px`, ...lampColorStyle }}
            onMouseDown={(e) => startDrag(e, 'pole', height, 'ns-resize')}
        >
            {/* Highlight */}
            <div className="absolute left-1/2 -translate-x-1/2 w-[2px] bg-white/20 h-full rounded-full"></div>
            
            {/* Drag Handle Highlight on Hover */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-12 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* --- JOINT (Knee) --- */}
        <div
            ref={kneeRef}
            onMouseDown={(e) => startDrag(e, 'pole', height, 'ns-resize')}
            className="absolute w-5 h-5 rounded-full z-20 cursor-ns-resize border border-white/5"
            style={{
                bottom: `${currentPoleHeight - 7}px`,
                left: '0px',
                transform: 'translateX(-50%)',
                ...lampColorStyle,
            }}
        ></div>

        {/* --- UPPER ARM --- */}
        <div
            className="absolute origin-bottom z-10 pointer-events-none"
            style={{
                bottom: `${currentPoleHeight - 3}px`,
                left: '0px',
                height: `${UPPER_ARM_LEN}px`,
                width: '0px',
                transform: `rotate(${currentArmRotation}deg)` 
            }}
        >
             {/* The Arm Itself */}
             <div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[5px] rounded-full cursor-crosshair group pointer-events-auto"
                style={{ height: '100%', ...lampColorStyle }} 
                onMouseDown={(e) => startDrag(e, 'arm', angle, 'crosshair')}
             >
                <div className="absolute left-1/2 -translate-x-1/2 w-[1.5px] bg-white/20 h-full pointer-events-none"></div>
                
                {/* Invisible Hit Area */}
                <div className="absolute inset-y-0 -left-4 -right-4 bg-transparent"></div>
             </div>

             {/* --- HEAD (Attached to end of Arm) --- */}
             <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-crosshair pointer-events-auto origin-center"
                style={{ transform: 'rotate(-90deg)' }} 
                onMouseDown={(e) => startDrag(e, 'arm', angle, 'crosshair')}
             >
                 {/* 
                    Cup Shade 
                    We want the rod to connect to the BACK of the shade visually.
                    Rod ends at the pivot (0,0) of this container.
                    The shade is rotated -90deg relative to arm.
                    So 'Bottom' of shade is right, 'Top' of shade is left.
                    
                    If we translate Y (local) -> it moves along the Arm's perpendicular axis.
                    We want the rounded back of the shade to 'kiss' the pivot point.
                 */}
                 <div 
                    className="relative w-24 h-20 rounded-t-[45px] rounded-b-[12px] shadow-xl flex justify-center items-end overflow-hidden transition-colors group-hover:brightness-110"
                    style={{ 
                        // Move the shade 'out' from the pivot so the pivot sits on the rounded back surface
                        // 45px is the radius of the top. We want the pivot at the apex of that curve?
                        // No, usually the rod connects to a hinge on the back.
                        // Let's position the pivot (0,0) right at the edge of the 'top' (back) curve.
                        // Since height is 20px? No, w-24 (width) h-20 (height).
                        // In this rotated view: Height is length of shade, Width is diameter.
                        // Actually w-24 is width (96px), h-20 is height (80px).
                        // rounded-t is the back.
                        transform: 'translateY(40px)', 
                        ...lampColorStyle 
                    }} 
                 >
                      <div className="absolute top-4 left-6 w-4 h-2 bg-white/10 rounded-full blur-[1px]"></div>
                 </div>

                 {/* Bulb */}
                 <div 
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 w-12 h-8 rounded-full transition-all duration-300 z-[-1] ${isLightOn ? 'bg-[#fff8e1]' : 'bg-[#3a3a3a]'}`}
                    style={{ 
                        transform: 'translateY(42px) translateX(-50%)', // Moves with shade
                        boxShadow: isLightOn ? `0 0 55px ${lightColor}` : 'none',
                        backgroundColor: isLightOn ? '#fff8e1' : 'rgba(0,0,0,0.2)'
                    }}
                 ></div>

                 {/* Pivot/Hinge Joint - Visual Cap at end of arm, ON TOP of shade back */}
                 <div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full z-20 pointer-events-none border border-white/10"
                    style={{ ...lampColorStyle }}
                 ></div>
             </div>
        </div>

        {/* --- BASE --- */}
        <div 
            onMouseDown={(e) => startDrag(e, 'base', x, 'move')}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-12 rounded-t-full shadow-2xl cursor-move group z-10 flex justify-center items-start pt-3 border-b-4 border-black/20"
            style={{ ...lampColorStyle }}
        >
             {/* Base highlight */}
             <div className="absolute top-1 left-1/2 -translate-x-1/2 w-20 h-3 bg-white/5 rounded-full filter blur-sm"></div>
        </div>

        {/* Ground Shadow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-black/30 blur-lg rounded-[100%] z-0 scale-x-110"></div>

      </div>
    </div>
  );
};

export default FloorLamp;