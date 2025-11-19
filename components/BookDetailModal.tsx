
import React, { useEffect, useState, useRef } from 'react';
import { Book } from '../types';
import { X, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  originRect: DOMRect | null;
}

// Physics constants
const ZOOM_SENSITIVITY = 0.001;
const MIN_SCALE = 0.6;
const MAX_SCALE = 2.5;
const DAMPING = 0.9; // Inertia feel

const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, isOpen, onClose, originRect }) => {
  const [animState, setAnimState] = useState<'idle' | 'opening' | 'open' | 'closing'>('idle');
  
  // Transformation State
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs for interaction calculation
  const dragRef = useRef({ startX: 0, startY: 0, lastX: 0, lastY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && book && originRect) {
      setAnimState('opening');
      // Reset view on open
      setTransform({ x: 0, y: 0, scale: 1 });
      
      // Force layout calculation then start animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            setAnimState('open');
        });
      });
    } else if (!isOpen && animState === 'open') {
      setAnimState('closing');
      // Allow animation to play out before full unmount logic in parent (handled by delay in App or state here)
      const timer = setTimeout(() => {
        setAnimState('idle');
      }, 500); // Match CSS duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, book]);

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAnimState('closing');
    setTimeout(onClose, 400);
  };

  // --- INTERACTION HANDLERS ---

  const handleWheel = (e: React.WheelEvent) => {
    if (animState !== 'open') return;
    e.stopPropagation();
    
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, transform.scale - e.deltaY * ZOOM_SENSITIVITY));
    setTransform(prev => ({ ...prev, scale: newScale }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (animState !== 'open') return;
    e.preventDefault(); // Prevent text selection
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      lastX: transform.x,
      lastY: transform.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || animState !== 'open') return;
    
    const deltaX = (e.clientX - dragRef.current.startX) / transform.scale;
    const deltaY = (e.clientY - dragRef.current.startY) / transform.scale;

    setTransform(prev => ({
      ...prev,
      x: dragRef.current.lastX + deltaX,
      y: dragRef.current.lastY + deltaY
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // --- RENDER LOGIC ---

  if (animState === 'idle' && !isOpen) return null;
  if (!book) return null;

  // Calculate Styles for Transition
  // When 'opening' or 'closing', we want to mimic the BookSpine's position.
  // When 'open', we want center screen.

  const isAnimating = animState === 'opening' || animState === 'closing';
  
  // Target Dimensions (The 'open' book size)
  // Matches the BookDetail layout aspect ratio approx
  const targetWidth = Math.min(window.innerWidth * 0.9, 1000); // Max width of open book
  const targetHeight = targetWidth * 0.625; // Aspect ratio 1.6
  
  const getBookStyle = (): React.CSSProperties => {
    if (!originRect) return {};

    if (animState === 'opening' || animState === 'closing') {
      // Match Spine State
      return {
        position: 'absolute',
        top: originRect.top,
        left: originRect.left,
        width: originRect.width,
        height: originRect.height,
        transform: `rotate(${book.rotation}deg)`,
        opacity: animState === 'closing' ? 0 : 1, // Fade out on close while shrinking
        transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
        zIndex: 50,
        overflow: 'hidden',
        borderRadius: '2px'
      };
    }
    
    // Open State (Engine Active)
    return {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: `${targetWidth}px`,
      height: `${targetHeight}px`,
      // The transform is a composition of centering (-50%) AND the interactive Pan/Zoom
      transform: `translate(-50%, -50%) scale(${transform.scale}) translate(${transform.x}px, ${transform.y}px)`,
      cursor: isDragging ? 'grabbing' : 'grab',
      transition: isDragging ? 'none' : 'transform 0.1s ease-out', // Instant when dragging, smooth when zooming
      zIndex: 50,
    };
  };

  return (
    <div 
        className={`
            fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-md transition-opacity duration-500
            ${animState === 'open' ? 'opacity-100' : 'opacity-0'}
            ${animState === 'idle' ? 'pointer-events-none' : 'pointer-events-auto'}
        `}
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        onWheel={handleWheel}
    >
      {/* Hint UI */}
      <div className={`absolute top-8 left-1/2 -translate-x-1/2 text-white/80 font-hand text-lg transition-opacity duration-500 ${animState === 'open' ? 'opacity-100' : 'opacity-0'} pointer-events-none z-40 flex items-center gap-4 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm`}>
          <div className="flex items-center gap-1"><Move size={14}/> <span>drag to pan</span></div>
          <div className="w-px h-4 bg-white/20"></div>
          <div className="flex items-center gap-1"><ZoomIn size={14}/> <span>scroll to zoom</span></div>
      </div>

      {/* The Morphing Book Container */}
      <div 
        ref={containerRef}
        style={getBookStyle()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
        className="shadow-2xl origin-center"
      >
        {/* 
            CONTENT VISIBILITY: 
            During transition (animating), we might want to show a simple cover or spine color 
            to avoid layout jank, then fade in the complex pages. 
            For now, we render the full book but use overflow-hidden to crop it during flight.
        */}
        <div className="w-full h-full relative bg-[#fdfbf7] rounded-2xl overflow-hidden flex shadow-[0_20px_50px_rgba(0,0,0,0.3)] select-none">
            
            {/* Close Button (Inside the interactive surface) */}
            <button 
                onClick={handleClose}
                className="absolute top-5 right-5 z-50 text-gray-400 hover:text-ink transition-colors bg-white/50 rounded-full p-2 hover:bg-white hover:scale-110 shadow-sm"
            >
                <X size={24} strokeWidth={2} />
            </button>

            {/* --- Left Page --- */}
            <div className="flex-1 p-8 md:p-12 border-r border-[#e0dcd5] flex flex-col justify-center relative bg-noise">
                {/* Spine fold shadow */}
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-r from-transparent to-black/5 pointer-events-none"></div>
                
                <h2 className="text-3xl md:text-5xl font-hand font-bold text-ink mb-2 leading-none lowercase">{book.title}</h2>
                <p className="text-xl text-gray-500 font-hand italic mb-8 lowercase">by {book.author}</p>

                <div className="space-y-8 opacity-90">
                    <div className="flex flex-wrap items-start gap-8">
                        <div>
                            <h3 className="text-gray-400 font-hand text-xs tracking-widest lowercase font-bold mb-2 opacity-70">rating</h3>
                            <div className="flex space-x-1 text-pastel-yellow drop-shadow-sm">
                                {[...Array(5)].map((_, i) => (
                                <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${i < Math.round(book.rating) ? 'fill-current text-yellow-400' : 'text-gray-200'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-gray-400 font-hand text-xs tracking-widest lowercase font-bold mb-2 opacity-70">genre</h3>
                            <span className="inline-block bg-cream px-3 py-1 rounded-lg text-sm font-hand text-ink border border-[#e6dcd3] lowercase">
                                {book.genre}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-gray-400 font-hand text-xs tracking-widest lowercase font-bold mb-2 opacity-70">emotional impact</h3>
                        <div className="flex items-center space-x-3 max-w-[300px]">
                            <span className="text-xs text-gray-400 font-hand lowercase">chill</span>
                            <div className="flex-1 h-2 bg-[#ebe7e0] rounded-full relative">
                            <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-pastel-blue to-pastel-pink rounded-full opacity-80"
                                style={{ width: `${book.emotionalImpact}%` }}
                            ></div>
                            <div 
                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-ink shadow-sm"
                                style={{ left: `${book.emotionalImpact}%` }}
                            ></div>
                            </div>
                            <span className="text-xs text-gray-400 font-hand lowercase">ruined me</span>
                        </div>
                    </div>

                    <div className="bg-cream/30 p-4 -mx-4 rounded-xl transform rotate-1 hover:rotate-0 transition-transform">
                        <h3 className="text-gray-400 font-hand text-xs tracking-widest lowercase font-bold mb-2 opacity-70">me & this book</h3>
                        <p className="text-ink font-hand text-xl leading-tight lowercase">
                            "{book.personalNote || "no notes yet..."}"
                        </p>
                    </div>
                </div>
            </div>

            {/* --- Right Page --- */}
            <div className="flex-1 p-8 md:p-12 flex flex-col relative bg-noise">
                {/* Spine shadow effect */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-l from-transparent to-black/5 pointer-events-none z-10"></div>
                
                <div className="relative z-10 h-full overflow-hidden">
                    <p className="text-lg md:text-xl leading-relaxed font-hand text-ink/90 whitespace-pre-wrap lowercase first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-pastel-pink">
                        {book.summary}
                    </p>
                </div>

                <div className="absolute bottom-6 right-8 font-hand text-gray-300 text-xs lowercase tracking-widest opacity-50">
                    pg. {Math.floor(Math.random() * 300)}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailModal;
