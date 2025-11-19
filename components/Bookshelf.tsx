
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

const SHELF_HEIGHT = 300; // Vertical space per shelf
const SHELF_FLOOR_Y = 235; // Where the bottom of the book sits relative to the shelf top
const BOOK_WIDTH = 56; 
const WIDGET_WIDTH = 180;
const TOP_MARGIN = 80; // Increased to account for Top Cap
const MIN_SHELVES = 2;

// Physics
const CLUSTER_THRESHOLD = 30; // Gap size to consider items "grouped"
const SNAP_DISTANCE = 120; // Distance from a cluster to trigger magnetic behavior

const Bookshelf: React.FC<BookshelfProps> = ({ 
  books, onBookClick, onReorder, lightSource, 
  isMusicPlaying, onToggleMusic 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // --- STATE ---
  
  // Master List of Items
  const [items, setItems] = useState<ShelfItem[]>([]);
  
  // Shelf Management
  const [shelfCount, setShelfCount] = useState(MIN_SHELVES);
  const [ghostShelfActive, setGhostShelfActive] = useState(false);

  // Widget Persistence
  const [widgetPos, setWidgetPos] = useState({ shelfId: 1, x: 100 });

  // Dragging State
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{
    currentX: number;
    currentY: number;
    startX: number; // For click detection
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // --- SYNC PROPS TO STATE ---
  
  // We only sync when NOT dragging to avoid fighting the physics engine
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

    // Ensure Widget is preserved
    const widgetItem: ShelfItem = {
      id: 'fm-player',
      type: 'widget',
      shelfId: widgetPos.shelfId,
      x: widgetPos.x,
      width: WIDGET_WIDTH
    };

    const allItems = [...mappedBooks, widgetItem];
    setItems(allItems);
    
    // Initial Shelf Calculation
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
    
    // Calculate offset so we drag from the point clicked
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    
    // Item's absolute visual position
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

  // The Master Physics Frame Calculation
  const liveLayout = useMemo(() => {
    if (!dragId || !dragState) return items;

    const draggedItem = items.find(i => i.id === dragId)!;
    const otherItems = items.filter(i => i.id !== dragId);
    
    // 1. Calculate Target Shelf based on Y
    // We use the center of the dragged item for better feel
    const dragCenterY = dragState.currentY; 
    let targetShelfId = Math.floor((dragCenterY - TOP_MARGIN) / SHELF_HEIGHT);
    
    // Dynamic Shelf Logic
    let isGhost = false;
    // Allow dragging to the "next" shelf slot only
    if (targetShelfId >= shelfCount) {
      targetShelfId = shelfCount; // Snap to the new ghost shelf
      isGhost = true;
    } else {
      targetShelfId = Math.max(0, targetShelfId);
    }
    setGhostShelfActive(isGhost);

    // 2. Base X calculation
    const rawX = dragState.currentX - dragState.offsetX;
    const draggedCenter = rawX + draggedItem.width / 2;

    // 3. Analyze the Target Shelf
    const shelfItems = getShelfItems(otherItems, targetShelfId);
    
    let insertIndex = 0;
    let isMagnetic = false;

    if (shelfItems.length > 0) {
      // Check start
      const distToStart = Math.abs(draggedCenter - shelfItems[0].x);
      if (distToStart < SNAP_DISTANCE) isMagnetic = true;

      // Check end
      const lastItem = shelfItems[shelfItems.length - 1];
      const distToEnd = Math.abs(draggedCenter - (lastItem.x + lastItem.width));
      if (distToEnd < SNAP_DISTANCE) isMagnetic = true;

      // Check between
      for (let i = 0; i < shelfItems.length; i++) {
        const itemCenter = shelfItems[i].x + shelfItems[i].width / 2;
        if (draggedCenter > itemCenter) {
          insertIndex = i + 1;
        }
        
        const dist = Math.abs(draggedCenter - itemCenter);
        if (dist < SNAP_DISTANCE) isMagnetic = true;
      }
    }

    // 4. Calculate Resulting Frame
    const resultFrame: ShelfItem[] = [];

    // A. The Dragged Item
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

    // B. The Other Items
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


  // --- POINTER EVENTS WINDOW BINDING ---

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

        // Click Detection
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

        // --- DROP & CLEANUP LOGIC ---
        
        // 1. Commit State
        const newItems = liveLayout;
        setItems(newItems);

        // 2. Recalculate Shelf Count
        // Find the highest shelf ID that actually has items
        const maxOccupiedShelf = newItems.reduce((max, item) => Math.max(max, item.shelfId), 0);
        
        // The new shelf count should be max occupied + 1 (because shelves are 0-indexed)
        // But never go below MIN_SHELVES
        const newShelfCount = Math.max(MIN_SHELVES, maxOccupiedShelf + 1);
        setShelfCount(newShelfCount);

        // 3. Notify Parent
        const updatedBooks = newItems
            .filter(i => i.type === 'book')
            .map(i => ({
                ...i.data!,
                position: { shelfId: i.shelfId, xOffset: i.x }
            }));
        onReorder(updatedBooks);

        // 4. Update Widget
        const widget = newItems.find(i => i.type === 'widget');
        if (widget) {
            setWidgetPos({ shelfId: widget.shelfId, x: widget.x });
        }

        // Reset
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


  // --- RENDER HELPERS ---

  const finalRenderItems = dragId ? liveLayout : items;

  return (
    <div 
        ref={containerRef} 
        className="w-full max-w-4xl mx-auto mt-8 relative select-none px-6 md:px-0"
        style={{ 
            height: `${(shelfCount * SHELF_HEIGHT) + 200}px`,
            touchAction: 'none' 
        }}
    >
      {/* --- FURNITURE FRAME: SIDE PANELS & TOP --- */}
      
      {/* Left Panel */}
      <div 
        className="absolute top-0 bottom-0 left-0 md:-left-4 w-4 md:w-6 bg-[#c4a484] rounded-l-md z-30 border-r border-[#8c6b4a]"
        style={{ boxShadow: 'inset 2px 0 5px rgba(255,255,255,0.2), inset -2px 0 5px rgba(0,0,0,0.2)' }}
      ></div>
      
      {/* Right Panel */}
      <div 
        className="absolute top-0 bottom-0 right-0 md:-right-4 w-4 md:w-6 bg-[#c4a484] rounded-r-md z-30 border-l border-[#8c6b4a]"
        style={{ boxShadow: 'inset -2px 0 5px rgba(255,255,255,0.2), inset 2px 0 5px rgba(0,0,0,0.2)' }}
      ></div>

      {/* Top Cap (Molding) */}
      <div 
        className="absolute -top-6 left-0 right-0 md:-left-6 md:-right-6 h-12 bg-[#b08d6b] rounded-sm z-40 shadow-lg flex items-center justify-center border-b-4 border-[#8c6b4a]"
        style={{ 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.2)'
        }}
      >
         {/* Texture overlay for top cap */}
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-multiply rounded-sm"></div>
      </div>


      {/* --- LAYER 1: SHELF BACKBOARDS (Back Layer) --- */}
      <div className="absolute top-0 bottom-0 left-4 right-4 md:left-0 md:right-0 bg-[#d4b494] z-0 opacity-80">
           {/* Global Inner Shadow from the frame */}
           <div className="absolute inset-0 pointer-events-none shadow-[inset_10px_0_20px_rgba(0,0,0,0.1),inset_-10px_0_20px_rgba(0,0,0,0.1)]"></div>
      </div>

      {[...Array(shelfCount + (ghostShelfActive ? 1 : 0))].map((_, i) => {
          const isGhost = i === shelfCount;
          const top = (i * SHELF_HEIGHT) + TOP_MARGIN;
          
          // Determine if this shelf exists in the "real" count or if it's the new potential one
          const isVisible = i < shelfCount || isGhost;
          if (!isVisible) return null;

          return (
            <div 
                key={`shelf-back-${i}`}
                className={`absolute left-2 right-2 md:left-0 md:right-0 transition-all duration-300 ${isGhost ? 'opacity-0' : 'opacity-100'}`}
                style={{ top: `${top}px`, height: `${SHELF_HEIGHT}px` }}
            >
                 {/* Shadow under the shelf above (Ambient Occlusion) */}
                 {!isGhost && (
                     <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/10 to-transparent"></div>
                 )}

                 {/* Ghost Indicator (Only visible when dragging new shelf) */}
                 {isGhost && (
                     <div className="absolute inset-x-4 top-10 bottom-4 border-2 border-dashed border-shelf-shadow/30 rounded-xl bg-shelf-wood/10 z-0 flex items-center justify-center opacity-100 animate-pulse">
                         <span className="font-hand text-2xl text-shelf-shadow/60 lowercase font-bold">create new shelf</span>
                     </div>
                 )}
            </div>
          );
      })}

      {/* --- LAYER 2: ITEMS (Books & Widgets) --- */}
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

      {/* --- LAYER 3: SHELF FLOORS (The Lip) --- */}
      {[...Array(shelfCount)].map((_, i) => {
         const top = (i * SHELF_HEIGHT) + TOP_MARGIN;
         return (
            <div 
                key={`shelf-front-${i}`}
                className="absolute left-2 right-2 md:left-0 md:right-0 pointer-events-none z-20"
                style={{ 
                    top: `${top + SHELF_FLOOR_Y - 10}px`, // Overlap bottom 10px of books
                    height: '30px' 
                }}
            >
                {/* Main Wood Shelf Lip */}
                <div className="h-7 w-full bg-[#c4a484] rounded-sm relative shadow-lg flex items-center justify-center border-t border-[#e6cbb0] border-b border-[#8c6b4a]">
                     {/* Wood Texture Overlay */}
                     <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-multiply rounded-sm"></div>
                     
                     {/* Top Edge Highlight */}
                     <div className="w-[98%] h-[1px] bg-white/40 absolute top-[1px] rounded-full"></div>
                     
                     {/* Shelf Bracket/Detail (Optional decoration) */}
                     <div className="absolute bottom-[-4px] left-8 w-12 h-2 bg-[#a38360] rounded-b-md shadow-sm"></div>
                     <div className="absolute bottom-[-4px] right-8 w-12 h-2 bg-[#a38360] rounded-b-md shadow-sm"></div>
                </div>
                
                {/* Deep Shadow Cast Below Shelf */}
                <div className="absolute top-6 left-2 right-2 h-12 bg-black/10 blur-xl rounded-full mix-blend-multiply"></div>
            </div>
         );
      })}
      
      {/* Empty Library Hint */}
      {items.length === 0 && !dragId && (
        <div className="absolute top-60 left-1/2 -translate-x-1/2 text-shelf-shadow/40 font-hand text-2xl animate-pulse select-none lowercase">
            library empty... add a book
        </div>
      )}
    </div>
  );
};

export default Bookshelf;
