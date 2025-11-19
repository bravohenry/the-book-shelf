import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Book } from '../types';
import BookSpine from './BookSpine';
import FMPlayer from './FMPlayer';

interface BookshelfProps {
  books: Book[];
  onBookClick: (book: Book, rect: DOMRect) => void;
  onReorder: (books: Book[]) => void;
  lightSource: 'left' | 'right';
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
}

// --- TYPES ---

interface ShelfItem {
  id: string;
  type: 'book' | 'widget';
  data?: Book;
  shelfId: number;
  x: number;
  width: number;
}

// --- VISUAL CONSTANTS ---

const SHELF_HEIGHT = 200; // Increased height for better clearance
const SHELF_FLOOR_Y = 175; // Adjusted floor position lower
const BOOK_WIDTH = 56; 
const WIDGET_WIDTH = 180;
const TOP_MARGIN = 0; 
const MIN_SHELVES = 2;

// Physics
const CLUSTER_THRESHOLD = 30; 
const SNAP_DISTANCE = 120; 

const Bookshelf: React.FC<BookshelfProps> = ({ 
  books, onBookClick, onReorder, lightSource, 
  isMusicPlaying, onToggleMusic 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // --- STATE ---
  
  const [items, setItems] = useState<ShelfItem[]>([]);
  const [shelfCount, setShelfCount] = useState(MIN_SHELVES);
  const [ghostShelfActive, setGhostShelfActive] = useState(false);
  const [widgetPos, setWidgetPos] = useState({ shelfId: 1, x: 100 });
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{
    currentX: number;
    currentY: number;
    startX: number; 
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // --- SYNC PROPS TO STATE ---
  
  useEffect(() => {
    if (dragId) return; 

    const mappedBooks: ShelfItem[] = books.map((b, i) => ({
      id: b.id,
      type: 'book',
      data: b,
      shelfId: b.position?.shelfId ?? 0,
      x: b.position?.xOffset ?? (i * BOOK_WIDTH + 50),
      width: BOOK_WIDTH
    }));

    const widgetItem: ShelfItem = {
      id: 'fm-player',
      type: 'widget',
      shelfId: widgetPos.shelfId,
      x: widgetPos.x,
      width: WIDGET_WIDTH
    };

    const allItems = [...mappedBooks, widgetItem];
    setItems(allItems);
    
    const maxShelf = allItems.reduce((max, i) => Math.max(max, i.shelfId), 0);
    setShelfCount(Math.max(MIN_SHELVES, maxShelf + 1));

  }, [books, widgetPos, dragId]);


  // --- PHYSICS ENGINE HELPERS ---

  const getShelfItems = (allItems: ShelfItem[], sId: number) => {
    return allItems.filter(i => i.shelfId === sId).sort((a, b) => a.x - b.x);
  };

  // --- INTERACTION HANDLERS ---

  const handlePointerDown = (e: React.PointerEvent, item: ShelfItem) => {
    e.preventDefault();
    e.stopPropagation();
    
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const clientX = e.clientX;
    const clientY = e.clientY;
    
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    
    const itemTop = (item.shelfId * SHELF_HEIGHT) + TOP_MARGIN;
    const offsetX = relX - item.x;
    const offsetY = relY - itemTop;

    setDragId(item.id);
    setDragState({
      currentX: relX,
      currentY: relY,
      startX: clientX,
      startY: clientY,
      offsetX,
      offsetY
    });
  };

  const liveLayout = useMemo(() => {
    if (!dragId || !dragState) return items;

    const draggedItem = items.find(i => i.id === dragId)!;
    const otherItems = items.filter(i => i.id !== dragId);
    
    const dragCenterY = dragState.currentY; 
    let targetShelfId = Math.floor((dragCenterY - TOP_MARGIN) / SHELF_HEIGHT);
    
    // Visual tolerance for creating a new shelf
    // We want to trigger the ghost shelf when dragging slightly below the last real shelf
    const lastRealShelfBottom = (shelfCount * SHELF_HEIGHT) + TOP_MARGIN;
    
    let isGhost = false;
    if (targetShelfId >= shelfCount) {
      targetShelfId = shelfCount;
      isGhost = true;
    } else {
      targetShelfId = Math.max(0, targetShelfId);
    }
    setGhostShelfActive(isGhost);

    const rawX = dragState.currentX - dragState.offsetX;
    const draggedCenter = rawX + draggedItem.width / 2;

    const shelfItems = getShelfItems(otherItems, targetShelfId);
    
    let insertIndex = 0;
    let isMagnetic = false;

    if (shelfItems.length > 0) {
      const distToStart = Math.abs(draggedCenter - shelfItems[0].x);
      if (distToStart < SNAP_DISTANCE) isMagnetic = true;

      const lastItem = shelfItems[shelfItems.length - 1];
      const distToEnd = Math.abs(draggedCenter - (lastItem.x + lastItem.width));
      if (distToEnd < SNAP_DISTANCE) isMagnetic = true;

      for (let i = 0; i < shelfItems.length; i++) {
        const itemCenter = shelfItems[i].x + shelfItems[i].width / 2;
        if (draggedCenter > itemCenter) {
          insertIndex = i + 1;
        }
        
        const dist = Math.abs(draggedCenter - itemCenter);
        if (dist < SNAP_DISTANCE) isMagnetic = true;
      }
    }

    const resultFrame: ShelfItem[] = [];

    let finalDragX = rawX;
    
    if (isMagnetic && shelfItems.length > 0) {
       if (insertIndex === 0) {
           finalDragX = shelfItems[0].x - draggedItem.width;
       } else {
           const prev = shelfItems[insertIndex - 1];
           finalDragX = prev.x + prev.width;
       }
    }
    
    resultFrame.push({
        ...draggedItem,
        shelfId: targetShelfId,
        x: finalDragX
    });

    otherItems.forEach(item => {
        if (item.shelfId === targetShelfId && isMagnetic) {
            const myIndex = shelfItems.findIndex(si => si.id === item.id);
            if (myIndex >= insertIndex) {
                resultFrame.push({ ...item, x: item.x + draggedItem.width });
            } else {
                resultFrame.push(item);
            }
        } else {
            resultFrame.push(item);
        }
    });

    return resultFrame;

  }, [dragId, dragState, items, shelfCount]);


  useEffect(() => {
    if (!dragId) return;

    const handlePointerMove = (e: PointerEvent) => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        
        setDragState(prev => prev ? ({
            ...prev,
            currentX: e.clientX - rect.left,
            currentY: e.clientY - rect.top
        }) : null);
    };

    const handlePointerUp = (e: PointerEvent) => {
        if (!dragState) return;

        const dist = Math.hypot(e.clientX - dragState.startX, e.clientY - dragState.startY);
        if (dist < 5) {
            const item = items.find(i => i.id === dragId);
            if (item) {
                if (item.type === 'widget') {
                    onToggleMusic();
                } else if (item.type === 'book' && item.data) {
                    const el = document.querySelector(`[data-book-id="${item.id}"]`);
                    if (el) {
                        onBookClick(item.data, el.getBoundingClientRect());
                    }
                }
            }
            setDragId(null);
            setDragState(null);
            setGhostShelfActive(false);
            return;
        }

        const newItems = liveLayout;
        setItems(newItems);

        const maxOccupiedShelf = newItems.reduce((max, item) => Math.max(max, item.shelfId), 0);
        const newShelfCount = Math.max(MIN_SHELVES, maxOccupiedShelf + 1);
        setShelfCount(newShelfCount);

        const updatedBooks = newItems
            .filter(i => i.type === 'book')
            .map(i => ({
                ...i.data!,
                position: { shelfId: i.shelfId, xOffset: i.x }
            }));
        onReorder(updatedBooks);

        const widget = newItems.find(i => i.type === 'widget');
        if (widget) {
            setWidgetPos({ shelfId: widget.shelfId, x: widget.x });
        }

        setDragId(null);
        setDragState(null);
        setGhostShelfActive(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragId, dragState, liveLayout, shelfCount, items, onReorder, onBookClick, onToggleMusic]);


  const finalRenderItems = dragId ? liveLayout : items;

  // VINTAGE WOOD COLORS - STEADY TONE
  const colorWoodMain = '#cdbba7'; 
  const colorWoodSide = '#c4b19c';
  const colorShadow = '#b5a493';
  const colorBack = '#e6e0d9';

  return (
    <div 
        ref={containerRef} 
        className="w-full max-w-4xl mx-auto mt-4 relative select-none px-6 md:px-0"
        style={{ 
            height: `${(shelfCount * SHELF_HEIGHT) + 150}px`,
            touchAction: 'none' 
        }}
    >
      {/* --- FURNITURE FRAME --- */}
      
      {/* Left Panel */}
      <div 
        className="absolute top-0 bottom-0 left-0 md:-left-4 w-4 md:w-6 rounded-l-md z-30 border-r"
        style={{ 
            backgroundColor: colorWoodSide, 
            borderColor: colorShadow,
            boxShadow: 'inset 2px 0 5px rgba(255,255,255,0.1), inset -2px 0 5px rgba(0,0,0,0.15)' 
        }}
      ></div>
      
      {/* Right Panel */}
      <div 
        className="absolute top-0 bottom-0 right-0 md:-right-4 w-4 md:w-6 rounded-r-md z-30 border-l"
        style={{ 
            backgroundColor: colorWoodSide, 
            borderColor: colorShadow,
            boxShadow: 'inset -2px 0 5px rgba(255,255,255,0.1), inset 2px 0 5px rgba(0,0,0,0.15)' 
        }}
      ></div>

      {/* Top Cap */}
      <div 
        className="absolute -top-6 left-0 right-0 md:-left-6 md:-right-6 h-12 rounded-sm z-40 shadow-lg flex items-center justify-center border-b-4"
        style={{ 
            backgroundColor: colorWoodMain,
            borderColor: colorShadow,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.2)'
        }}
      >
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-multiply rounded-sm"></div>
      </div>


      {/* --- LAYER 1: SHELF BACKBOARDS --- */}
      <div className="absolute top-0 bottom-0 left-4 right-4 md:left-0 md:right-0 z-0 opacity-100" style={{ backgroundColor: colorBack }}>
           <div className="absolute inset-0 pointer-events-none shadow-[inset_10px_0_20px_rgba(0,0,0,0.05),inset_-10px_0_20px_rgba(0,0,0,0.05)]"></div>
      </div>

      {[...Array(shelfCount + (ghostShelfActive ? 1 : 0))].map((_, i) => {
          const isGhost = i === shelfCount;
          const top = (i * SHELF_HEIGHT) + TOP_MARGIN;
          
          const isVisible = i < shelfCount || isGhost;
          if (!isVisible) return null;

          return (
            <div 
                key={`shelf-back-${i}`}
                className={`absolute left-2 right-2 md:left-0 md:right-0 transition-all duration-300`}
                style={{ top: `${top}px`, height: `${SHELF_HEIGHT}px` }}
            >
                 {!isGhost && (
                     <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/5 to-transparent"></div>
                 )}

                 {/* Ghost Indicator - Semi-transparent shelf logic */}
                 {isGhost && (
                     <div className="absolute inset-0 z-0 flex flex-col justify-end opacity-60 animate-pulse duration-1000">
                        {/* Ghost Floor */}
                        <div 
                            className="absolute left-0 right-0 h-[26px] rounded-sm bg-shelf-wood/50 backdrop-blur-sm shadow-inner"
                            style={{ top: `${SHELF_FLOOR_Y - 10}px` }}
                        ></div>
                        
                        {/* Ghost Label */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-50">
                             <span className="font-hand text-2xl text-ink/30 lowercase font-bold px-4 py-1 rounded-full">
                                new shelf...
                             </span>
                        </div>
                     </div>
                 )}
            </div>
          );
      })}

      {/* --- LAYER 2: ITEMS --- */}
      {finalRenderItems.map((item) => {
        const isDragging = item.id === dragId;
        const top = (item.shelfId * SHELF_HEIGHT) + TOP_MARGIN;
        const zIndex = isDragging ? 50 : 10;

        return (
            <div
                key={item.id}
                data-book-id={item.id}
                onPointerDown={(e) => handlePointerDown(e, item)}
                className={`
                    absolute flex items-end justify-center
                    will-change-transform
                    ${isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:brightness-105'}
                `}
                style={{
                    left: 0,
                    top: 0,
                    width: item.width,
                    height: '140px',
                    transform: `translate3d(${item.x}px, ${top + SHELF_FLOOR_Y - 140}px, 0) ${isDragging ? 'rotate(-2deg)' : 'rotate(0deg)'}`,
                    zIndex: zIndex,
                    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
            >
                {item.type === 'book' ? (
                    <BookSpine 
                        book={item.data!} 
                        onClick={() => {}} 
                        lightSource={lightSource}
                    />
                ) : (
                    <FMPlayer isPlaying={isMusicPlaying} />
                )}
            </div>
        );
      })}

      {/* --- LAYER 3: SHELF FLOORS --- */}
      {[...Array(shelfCount)].map((_, i) => {
         const top = (i * SHELF_HEIGHT) + TOP_MARGIN;
         return (
            <div 
                key={`shelf-front-${i}`}
                className="absolute left-2 right-2 md:left-0 md:right-0 pointer-events-none z-20"
                style={{ 
                    top: `${top + SHELF_FLOOR_Y - 10}px`, 
                    height: '30px' 
                }}
            >
                {/* Main Shelf Lip */}
                <div 
                    className="h-7 w-full rounded-sm relative shadow-md flex items-center justify-center border-t border-b"
                    style={{ 
                        backgroundColor: colorWoodMain,
                        borderColor: colorShadow,
                        borderTopColor: '#e6e0d9', // Slightly lighter than shelf back
                        borderBottomColor: colorShadow
                    }}
                >
                     <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-multiply rounded-sm"></div>
                     <div className="w-[98%] h-[1px] bg-white/20 absolute top-[1px] rounded-full"></div>
                     
                     {/* Brackets */}
                     <div className="absolute bottom-[-4px] left-8 w-12 h-2 rounded-b-md shadow-sm opacity-80" style={{ backgroundColor: colorShadow }}></div>
                     <div className="absolute bottom-[-4px] right-8 w-12 h-2 rounded-b-md shadow-sm opacity-80" style={{ backgroundColor: colorShadow }}></div>
                </div>
                
                <div className="absolute top-6 left-2 right-2 h-12 bg-black/10 blur-xl rounded-full mix-blend-multiply"></div>
            </div>
         );
      })}
      
      {items.length === 0 && !dragId && (
        <div className="absolute top-40 left-1/2 -translate-x-1/2 text-shelf-shadow/40 font-hand text-2xl animate-pulse select-none lowercase">
            library empty... add a book
        </div>
      )}
    </div>
  );
};

export default Bookshelf;