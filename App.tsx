
import React, { useState, useEffect, useRef } from 'react';
import Bookshelf from './components/Bookshelf';
import BookDetailModal from './components/BookDetailModal';
import AddBookModal from './components/AddBookModal';
import { Book, BookDraft, INITIAL_BOOKS } from './types';
import { Plus } from 'lucide-react';

const THEMES = [
  { id: 'neutral', bg: '#f0eadd', label: 'neutral' },
  { id: 'cool', bg: '#daeaf6', label: 'cool' },
  { id: 'warm', bg: '#fce1e4', label: 'warm' },
];

// Royalty-free Lo-Fi track
const LOFI_TRACK_URL = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112762.mp3";

const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  
  // Selection State
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedBookRect, setSelectedBookRect] = useState<DOMRect | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  // Content State
  const [shelfTitle, setShelfTitle] = useState("em's book shelf");
  const [shelfSubtitle, setShelfSubtitle] = useState("curated with love");
  
  // Theme & Background State
  const [backgroundColor, setBackgroundColor] = useState(THEMES[0].bg);
  const [activeThemeId, setActiveThemeId] = useState<string>('neutral');

  // Music State
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setLoaded(true);
    // Initialize Audio
    audioRef.current = new Audio(LOFI_TRACK_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio play failed (interaction required):", e));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const handleAddBook = (draft: BookDraft & { color: string }) => {
    const styles = ['simple', 'classic', 'modern', 'pattern-dots', 'pattern-lines'] as const;
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const randomRotation = (Math.random() * 4) - 2; 
    const randomHeight = 85 + Math.random() * 15; 
    
    // Default placement for new books (start of shelf 0)
    // In a real app, we'd find the first empty spot
    const newBook: Book = {
      id: Date.now().toString(),
      ...draft,
      spineStyle: randomStyle,
      height: randomHeight,
      rotation: randomRotation,
      position: { shelfId: 0, xOffset: 50 } // Default placement, will overlap but user can move
    };
    setBooks([...books, newBook]);
  };

  const handleReorderBooks = (reorderedBooks: Book[]) => {
    setBooks(reorderedBooks);
  };

  const handleThemeChange = (theme: typeof THEMES[0]) => {
    setBackgroundColor(theme.bg);
    setActiveThemeId(theme.id);
  };
  
  const handleBookClick = (book: Book, rect: DOMRect) => {
      setSelectedBookRect(rect);
      setSelectedBook(book);
  };

  const handleCloseBook = () => {
    setSelectedBook(null);
  };

  const lightSource = 'left';

  return (
    <div 
      className={`min-h-screen transition-all duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'} pb-32 bg-noise overflow-hidden relative`}
      style={{ backgroundColor: backgroundColor }}
    >
      {/* Header */}
      <header className="pt-16 md:pt-20 text-center px-4 mb-8 relative z-10">
        <div className="inline-block relative w-full max-w-3xl">
            <input
              type="text"
              value={shelfTitle}
              onChange={(e) => setShelfTitle(e.target.value)}
              className="text-5xl md:text-7xl font-hand font-bold text-ink tracking-wide mb-1 relative z-10 drop-shadow-sm lowercase bg-transparent border-none text-center w-full focus:ring-0 focus:outline-none placeholder-ink/50 hover:opacity-80 transition-opacity cursor-text selection:bg-yellow-200"
              spellCheck={false}
            />
            <input
              type="text"
              value={shelfSubtitle}
              onChange={(e) => setShelfSubtitle(e.target.value)}
              className="text-gray-500 font-hand text-sm tracking-widest lowercase mt-1 text-center w-full bg-transparent border-none focus:ring-0 placeholder-gray-300 hover:text-ink transition-colors"
              spellCheck={false}
            />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        <Bookshelf 
          books={books} 
          onBookClick={handleBookClick} 
          onReorder={handleReorderBooks}
          lightSource={lightSource}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={toggleMusic}
        />
      </main>

      {/* Theme Switcher - Bottom Left */}
      <div className="fixed bottom-8 left-6 md:bottom-10 md:left-10 z-40 group opacity-0 hover:opacity-100 transition-opacity duration-300">
         <div className="flex items-center gap-3 bg-ink/80 text-[#fdfbf7] px-6 py-3 md:py-4 rounded-full shadow-2xl border-4 border-white/10 backdrop-blur-md relative">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme)}
                className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 transition-all duration-300 ${
                  activeThemeId === theme.id 
                    ? 'border-white scale-110 ring-2 ring-white/20' 
                    : 'border-transparent hover:scale-110 opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: theme.bg }}
                title={theme.label}
              />
            ))}
         </div>
      </div>

      {/* Sticky Add Button */}
      <div className="fixed bottom-8 right-6 md:bottom-10 md:right-10 z-40 group">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-3 px-5 py-3 md:py-4 rounded-full transition-all duration-300
            bg-transparent text-gray-400 border-4 border-transparent shadow-none
            group-hover:bg-ink group-hover:text-[#fdfbf7] group-hover:shadow-2xl group-hover:border-white/10 group-hover:-translate-y-1
            font-hand text-xl font-bold lowercase"
        >
          <div className="bg-transparent group-hover:bg-white/20 rounded-full p-1 group-hover:rotate-90 transition-all duration-500 text-gray-400 group-hover:text-white">
            <Plus size={24} strokeWidth={2.5} />
          </div>
          add book
        </button>
      </div>

      <BookDetailModal 
        book={selectedBook} 
        isOpen={!!selectedBook} 
        onClose={handleCloseBook} 
        originRect={selectedBookRect}
      />

      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddBook}
      />
      
    </div>
  );
};

export default App;
