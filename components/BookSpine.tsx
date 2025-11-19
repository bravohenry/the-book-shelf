
import React, { useRef } from 'react';
import { Book } from '../types';

interface BookSpineProps {
  book: Book;
  onClick: (book: Book, rect: DOMRect) => void;
  lightSource: 'left' | 'right';
  isGhost?: boolean;
}

const BookSpine: React.FC<BookSpineProps> = ({ book, onClick, lightSource, isGhost }) => {
  const spineRef = useRef<HTMLDivElement>(null);
  const isDark = ['#4a4a4a', '#2c2c2c'].includes(book.color);
  const textColor = isDark ? 'text-white/90' : 'text-ink/70';

  const handleClick = (e: React.MouseEvent) => {
    // Click is now handled by the parent via pointerup logic to differentiate drag vs click
    // But we expose the rect for reference
    if (spineRef.current) {
      const rect = spineRef.current.getBoundingClientRect();
      onClick(book, rect);
    }
  };

  const getSpinePattern = () => {
      if (book.spineStyle === 'pattern-dots') {
          return {
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1.5px, transparent 1.5px)',
              backgroundSize: '8px 8px'
          };
      }
      if (book.spineStyle === 'pattern-lines') {
          return {
            backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 2px, transparent 2px, transparent 8px)'
          };
      }
      return {};
  };

  // Dynamic shadow based on light source
  const shadowOffset = lightSource === 'left' ? '2px' : '-2px';
  
  return (
    <div
      ref={spineRef}
      onClick={handleClick}
      className={`
        relative group transition-transform duration-300 z-10
        rounded-sm rounded-l-[3px]
        flex items-center justify-center
        ${!isGhost && 'cursor-grab active:cursor-grabbing hover:-translate-y-4 hover:z-20'}
        ${book.spineStyle === 'classic' ? 'rounded-r-md' : 'rounded-r-sm'}
      `}
      style={{
        backgroundColor: book.color,
        height: isGhost ? '100%' : `${book.height}%`, // Force full height if ghost to avoid parent-percentage issues
        width: '52px', 
        marginRight: '2px',
        marginLeft: '2px',
        transform: isGhost ? 'rotate(0deg)' : `rotate(${book.rotation}deg)`,
        boxShadow: `inset ${lightSource === 'left' ? '-2px' : '2px'} 0 4px rgba(0,0,0,0.05), ${shadowOffset} 1px 3px rgba(0,0,0,0.15)`,
        ...getSpinePattern()
      }}
    >
      {/* Spine Text */}
      <span 
        className={`
          ${textColor} font-hand font-bold text-[14px] tracking-wider
          truncate max-h-[85%] px-1 text-center w-full block select-none lowercase
        `}
        style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            textShadow: isDark ? 'none' : '0px 1px 0px rgba(255,255,255,0.4)'
        }}
      >
        {book.title}
      </span>

      {/* Decorative elements */}
      {book.spineStyle === 'classic' && (
        <>
          <div className="absolute top-3 left-0 w-full h-[2px] bg-black/5 mix-blend-multiply"></div>
          <div className="absolute top-5 left-0 w-full h-[2px] bg-black/5 mix-blend-multiply"></div>
          <div className="absolute bottom-3 left-0 w-full h-[2px] bg-black/5 mix-blend-multiply"></div>
          <div className="absolute bottom-5 left-0 w-full h-[2px] bg-black/5 mix-blend-multiply"></div>
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-8 h-10 border border-black/5 rounded-sm opacity-60"></div>
        </>
      )}

      {/* Sticker/Label for Modern style */}
      {book.spineStyle === 'modern' && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-6 h-4 bg-white/30 rounded-sm backdrop-blur-sm"></div>
       )}

      {/* Inner spine shadow (curvature) */}
      <div className={`absolute inset-0 rounded-sm pointer-events-none bg-gradient-to-${lightSource === 'left' ? 'r' : 'l'} from-transparent via-white/10 to-black/10 opacity-50`}></div>
      <div className={`absolute ${lightSource === 'left' ? 'left-0' : 'right-0'} top-0 bottom-0 w-[3px] bg-white/20 opacity-60`}></div>
    </div>
  );
};

export default BookSpine;
