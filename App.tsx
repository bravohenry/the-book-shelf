
import React, { useState, useEffect, useRef } from 'react';
import Bookshelf from './components/Bookshelf';
import BookDetailModal from './components/BookDetailModal';
import AddBookModal from './components/AddBookModal';
import AddWebsiteModal from './components/AddWebsiteModal';
import ArchiveBox from './components/ArchiveBox';
import ArchiveModal from './components/ArchiveModal';
import ApiKeyModal from './components/ApiKeyModal';
import OnboardingModal from './components/OnboardingModal';
import { Book, BookDraft, INITIAL_BOOKS, Ornament, INITIAL_ORNAMENTS } from './types';
import { Plus, BookOpen, Globe } from 'lucide-react';
import { playSfx } from './services/audioService';

const THEMES = [
  { id: 'neutral', bg: '#f4f1ea', label: 'neutral' },
  { id: 'cool', bg: '#e3eef6', label: 'cool' },
  { id: 'warm', bg: '#fdf2f4', label: 'warm' },
];

// Royalty-free Lo-Fi track
const LOFI_TRACK_URL = "/audio/lofi-study.mp3";

const App: React.FC = () => {
  // --- STATE WITH PERSISTENCE ---
  
  // Books
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem('ems_books');
      return saved ? JSON.parse(saved) : INITIAL_BOOKS;
    } catch (e) {
      return INITIAL_BOOKS;
    }
  });

  // Ornaments
  const [ornaments, setOrnaments] = useState<Ornament[]>(() => {
    try {
      const saved = localStorage.getItem('ems_ornaments');
      return saved ? JSON.parse(saved) : INITIAL_ORNAMENTS;
    } catch (e) {
      return INITIAL_ORNAMENTS;
    }
  });

  // Archived Items
  const [archivedBooks, setArchivedBooks] = useState<Book[]>(() => {
      try {
        const saved = localStorage.getItem('ems_archived_books');
        return saved ? JSON.parse(saved) : [];
      } catch (e) { return []; }
  });

  const [archivedOrnaments, setArchivedOrnaments] = useState<Ornament[]>(() => {
      try {
        const saved = localStorage.getItem('ems_archived_ornaments');
        return saved ? JSON.parse(saved) : [];
      } catch (e) { return []; }
  });
  
  // Text & Theme
  const [shelfTitle, setShelfTitle] = useState(() => localStorage.getItem('ems_title') || "the wonderful book shelf");
  const [shelfSubtitle, setShelfSubtitle] = useState(() => localStorage.getItem('ems_subtitle') || "curated with love");
  const [activeThemeId, setActiveThemeId] = useState<string>(() => localStorage.getItem('ems_theme') || 'neutral');
  const [backgroundColor, setBackgroundColor] = useState(() => {
      const savedId = localStorage.getItem('ems_theme') || 'neutral';
      const theme = THEMES.find(t => t.id === savedId);
      return theme ? theme.bg : THEMES[0].bg;
  });

  // API Key
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ems_gemini_api_key') || '');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Onboarding State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // --- PERSISTENCE EFFECTS ---
  
  useEffect(() => { localStorage.setItem('ems_books', JSON.stringify(books)); }, [books]);
  useEffect(() => { localStorage.setItem('ems_ornaments', JSON.stringify(ornaments)); }, [ornaments]);
  useEffect(() => { localStorage.setItem('ems_archived_books', JSON.stringify(archivedBooks)); }, [archivedBooks]);
  useEffect(() => { localStorage.setItem('ems_archived_ornaments', JSON.stringify(archivedOrnaments)); }, [archivedOrnaments]);
  useEffect(() => { localStorage.setItem('ems_title', shelfTitle); }, [shelfTitle]);
  useEffect(() => { localStorage.setItem('ems_subtitle', shelfSubtitle); }, [shelfSubtitle]);
  useEffect(() => { localStorage.setItem('ems_theme', activeThemeId); }, [activeThemeId]);
  useEffect(() => { 
      if(apiKey) localStorage.setItem('ems_gemini_api_key', apiKey); 
  }, [apiKey]);


  // --- EPHEMERAL STATE ---

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedBookRect, setSelectedBookRect] = useState<DOMRect | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddWebsiteModalOpen, setIsAddWebsiteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  const [isHoveringArchive, setIsHoveringArchive] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setLoaded(true);
    audioRef.current = new Audio(LOFI_TRACK_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;
    
    // Check for first time user
    const hasSeenGuide = localStorage.getItem('ems_has_seen_guide');
    if (!hasSeenGuide) {
        // Delay slightly for effect
        setTimeout(() => setIsOnboardingOpen(true), 1000);
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (e.clientX < 200 && e.clientY > window.innerHeight - 200) {
            setIsHoveringArchive(true);
        } else {
            setIsHoveringArchive(false);
        }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  // --- HANDLERS ---
  
  const handleCloseOnboarding = () => {
      setIsOnboardingOpen(false);
      localStorage.setItem('ems_has_seen_guide', 'true');
      // If no API key, suggest adding it after guide
      if (!apiKey) {
          setTimeout(() => setIsApiKeyModalOpen(true), 500);
      }
  };

  const checkKeyAndOpen = (modalSetter: (val: boolean) => void) => {
      playSfx('pop');
      if (!apiKey) {
          setIsApiKeyModalOpen(true);
      } else {
          modalSetter(true);
      }
  };

  const handleSaveApiKey = (key: string) => {
      playSfx('success');
      setApiKey(key);
      setIsApiKeyModalOpen(false);
  };

  const handleAddBook = (draft: BookDraft & { color: string }) => {
    addBookItem(draft, 'book');
  };

  const handleAddWebsite = (draft: BookDraft & { color: string }) => {
    addBookItem(draft, 'website');
  };

  const handleBatchAddWebsites = (drafts: (BookDraft & { color: string })[]) => {
    const newBooks: Book[] = drafts.map((draft, idx) => createBookFromDraft(draft, 'website', idx));
    setBooks([...books, ...newBooks]);
  };

  const createBookFromDraft = (draft: BookDraft & { color: string }, type: 'book' | 'website', indexOffset: number = 0): Book => {
    const styles = ['simple', 'classic', 'modern', 'pattern-dots', 'pattern-lines'] as const;
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const randomRotation = (Math.random() * 4) - 2; 
    const randomHeight = 85 + Math.random() * 15; 
    
    return {
      id: (Date.now() + indexOffset).toString(),
      itemType: type,
      url: draft.url,
      ...draft,
      spineStyle: randomStyle,
      height: randomHeight,
      rotation: randomRotation,
      position: { shelfId: 0, xOffset: 50 } 
    };
  };

  const addBookItem = (draft: BookDraft & { color: string }, type: 'book' | 'website') => {
    playSfx('success');
    const newBook = createBookFromDraft(draft, type);
    setBooks([...books, newBook]);
  };

  const handleArchiveItem = (id: string, type: 'book' | 'ornament') => {
      playSfx('drop'); 
      if (type === 'book') {
          const item = books.find(b => b.id === id);
          if (item) {
              setBooks(books.filter(b => b.id !== id));
              setArchivedBooks([...archivedBooks, item]);
          }
      } else {
          const item = ornaments.find(o => o.id === id);
          if (item) {
              setOrnaments(ornaments.filter(o => o.id !== id));
              setArchivedOrnaments([...archivedOrnaments, item]);
          }
      }
  };

  const handleRestoreItem = (item: Book | Ornament, type: 'book' | 'ornament') => {
      playSfx('pickup');
      if (type === 'book') {
          setArchivedBooks(archivedBooks.filter(b => b.id !== item.id));
          setBooks([{ ...(item as Book), position: { shelfId: 0, xOffset: 50 } }, ...books]);
      } else {
          setArchivedOrnaments(archivedOrnaments.filter(o => o.id !== item.id));
          setOrnaments([{ ...(item as Ornament), position: { shelfId: 0, xOffset: 100 } }, ...ornaments]);
      }
  };
  
  const handleDeleteForever = (id: string, type: 'book' | 'ornament') => {
      playSfx('click');
      if (type === 'book') {
          setArchivedBooks(archivedBooks.filter(b => b.id !== id));
      } else {
          setArchivedOrnaments(archivedOrnaments.filter(o => o.id !== id));
      }
  };

  const handleThemeChange = (theme: typeof THEMES[0]) => {
    playSfx('pop');
    setBackgroundColor(theme.bg);
    setActiveThemeId(theme.id);
  };
  
  const handleBookClick = (book: Book, rect: DOMRect) => {
      playSfx('click');
      setSelectedBookRect(rect);
      setSelectedBook(book);
  };

  return (
    <div 
      className={`min-h-screen transition-all duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'} bg-noise overflow-hidden relative flex flex-col`}
      style={{ backgroundColor: backgroundColor }}
    >
      <div className="flex-1 flex flex-col items-center justify-center w-full py-12">
        {/* Header */}
        <header className="text-center px-4 relative z-10 shrink-0 mb-8">
          <div className="inline-block relative w-full max-w-3xl">
              <input
                type="text"
                value={shelfTitle}
                onChange={(e) => setShelfTitle(e.target.value)}
                className="text-5xl font-hand font-bold text-ink tracking-wide mb-1 relative z-10 drop-shadow-sm lowercase bg-transparent border-none text-center w-full focus:ring-0 focus:outline-none placeholder-ink/50 hover:opacity-80 transition-opacity cursor-text selection:bg-yellow-200"
                spellCheck={false}
              />
              <input
                type="text"
                value={shelfSubtitle}
                onChange={(e) => setShelfSubtitle(e.target.value)}
                className="text-gray-400 font-hand text-sm tracking-widest lowercase mt-0 text-center w-full bg-transparent border-none focus:ring-0 focus:outline-none focus:outline-none placeholder-gray-300 hover:text-ink transition-colors focus:outline-none"
                spellCheck={false}
              />
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 w-full">
          <Bookshelf 
            books={books} 
            ornaments={ornaments}
            onBookClick={handleBookClick} 
            onReorderBooks={setBooks}
            onReorderOrnaments={setOrnaments}
            lightSource={'left'}
            isMusicPlaying={isMusicPlaying}
            onToggleMusic={toggleMusic}
            onDragStateChange={setIsDraggingItem}
            onArchiveItem={handleArchiveItem}
          />
        </main>
      </div>

      {/* Theme Switcher */}
      <div className="fixed top-6 right-6 z-40 group opacity-0 hover:opacity-100 transition-opacity duration-300">
         <div className="flex items-center gap-3 bg-ink/10 hover:bg-ink/80 text-[#fdfbf7] px-4 py-2 rounded-full shadow-sm hover:shadow-xl backdrop-blur-md transition-all">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme)}
                className={`w-4 h-4 rounded-full border transition-all duration-300 ${
                  activeThemeId === theme.id 
                    ? 'border-white scale-110 ring-1 ring-white/50' 
                    : 'border-transparent opacity-60 hover:scale-110 hover:opacity-100'
                }`}
                style={{ backgroundColor: theme.bg }}
                title={theme.label}
              />
            ))}
         </div>
      </div>

      {/* Hover Menu for Adding Items */}
      <div className="fixed bottom-8 right-6 md:bottom-10 md:right-10 z-40 group flex flex-col items-end gap-3">
        
        {/* Sub-buttons (Appear on Hover) */}
        <div className="flex flex-col gap-3 transition-all duration-300 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
            <button
                onClick={() => checkKeyAndOpen(setIsAddWebsiteModalOpen)}
                className="flex items-center justify-end gap-3 group/btn"
            >
                <span className="bg-ink text-paper px-3 py-1 rounded-lg font-hand text-sm lowercase shadow-md opacity-0 group-hover/btn:opacity-100 transition-opacity">add website</span>
                <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-ink border-2 border-transparent hover:border-ink transition-colors">
                    <Globe size={20} />
                </div>
            </button>

            <button
                onClick={() => checkKeyAndOpen(setIsAddModalOpen)}
                className="flex items-center justify-end gap-3 group/btn"
            >
                <span className="bg-ink text-paper px-3 py-1 rounded-lg font-hand text-sm lowercase shadow-md opacity-0 group-hover/btn:opacity-100 transition-opacity">add book</span>
                <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-ink border-2 border-transparent hover:border-ink transition-colors">
                    <BookOpen size={20} />
                </div>
            </button>
        </div>

        {/* Main FAB */}
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300
            bg-white/80 text-gray-400 border-2 border-white shadow-sm
            hover:bg-ink hover:text-[#fdfbf7] hover:shadow-xl
            font-hand text-xl lowercase backdrop-blur-sm"
        >
          <span className="group-hover:rotate-90 transition-transform duration-300">
            <Plus size={20} />
          </span>
          add...
        </button>
      </div>

      {/* Archive Box */}
      <ArchiveBox 
          isVisible={isDraggingItem || isHoveringArchive}
          isHovered={isHoveringArchive}
          onClick={() => {
            playSfx('pop');
            setIsArchiveModalOpen(true);
          }}
          itemCount={archivedBooks.length + archivedOrnaments.length}
      />

      {/* Modals */}
      <BookDetailModal 
        book={selectedBook} 
        isOpen={!!selectedBook} 
        onClose={() => setSelectedBook(null)} 
        originRect={selectedBookRect}
      />

      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} 
        onSave={handleSaveApiKey} 
      />
      
      <OnboardingModal 
        isOpen={isOnboardingOpen}
        onClose={handleCloseOnboarding}
      />

      <AddBookModal
        isOpen={isAddModalOpen}
        apiKey={apiKey}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddBook}
      />

      <AddWebsiteModal
        isOpen={isAddWebsiteModalOpen}
        apiKey={apiKey}
        onClose={() => setIsAddWebsiteModalOpen(false)}
        onAdd={handleAddWebsite}
        onBatchAdd={handleBatchAddWebsites}
      />
      
      <ArchiveModal 
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        archivedBooks={archivedBooks}
        archivedOrnaments={archivedOrnaments}
        onRestore={handleRestoreItem}
        onDelete={handleDeleteForever}
      />
      
    </div>
  );
};

export default App;
