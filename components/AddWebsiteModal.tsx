
import React, { useState, useRef, useEffect } from 'react';
import { BookDraft, Message, PRESET_COLORS } from '../types';
import { chatWithLibrarian } from '../services/geminiService';
import { Send, X, Globe, Upload, Link as LinkIcon } from 'lucide-react';
import { playSfx } from '../services/audioService';

interface AddWebsiteModalProps {
  isOpen: boolean;
  apiKey: string;
  onClose: () => void;
  onAdd: (draft: BookDraft & { color: string }) => void;
  onBatchAdd: (drafts: (BookDraft & { color: string })[]) => void;
}

// --- TYPEWRITER COMPONENT ---
const TypewriterText = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setIsComplete(false);
    
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (Math.random() > 0.7) playSfx('typing');
      if (i >= text.length) {
        clearInterval(timer);
        setIsComplete(true);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <span>
      {displayed}
      {!isComplete && (
        <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-ink/40 animate-pulse rounded-full" />
      )}
    </span>
  );
};

const AddWebsiteModal: React.FC<AddWebsiteModalProps> = ({ isOpen, apiKey, onClose, onAdd, onBatchAdd }) => {
  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'assistant', content: "ooh, a new corner of the internet? paste the link first! 🌐" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Draft State
  const [draft, setDraft] = useState<BookDraft>({
    title: '',
    author: 'internet',
    rating: 0,
    genre: 'website',
    summary: '',
    emotionalImpact: 50,
    personalNote: '',
    color: PRESET_COLORS[0],
    url: ''
  });
  
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, messages.length]);

  if (!isOpen) return null;

  // Helper to ensure absolute URL
  const ensureUrlProtocol = (url: string) => {
    if (!url.trim()) return '';
    // Check if it starts with http:// or https://
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    playSfx('pop');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    
    // Basic URL detection for draft
    // If the input looks like a URL (has a dot, no spaces), we try to set it as the URL
    const isLikelyUrl = input.includes('.') && !input.includes(' ');
    if ((input.startsWith('http') || isLikelyUrl) && !draft.url) {
        setDraft(prev => ({ ...prev, url: ensureUrlProtocol(input) }));
    }

    try {
      const response = await chatWithLibrarian(apiKey, userMsg.content, draft, updatedMessages);
      
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: response.message 
      };
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, aiMsg]);
        
        if (response.draftUpdates && Object.keys(response.draftUpdates).length > 0) {
          const cleanUpdates = { ...response.draftUpdates };
          // Ensure AI provided URL is also clean
          if (cleanUpdates.url) {
              cleanUpdates.url = ensureUrlProtocol(cleanUpdates.url);
          }
          setDraft(prev => ({ ...prev, ...cleanUpdates }));
        }
        
        if (response.isComplete) {
          setIsReady(true);
        }
      }, 800);

    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "hmm, i couldn't reach that page. mind filling in the details?" }]);
    }
  };

  const handleAdd = () => {
    // Final safety check on URL
    const finalDraft = {
        ...draft,
        url: ensureUrlProtocol(draft.url || '')
    };
    onAdd({ ...finalDraft, color: finalDraft.color });
    handleClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playSfx('pickup');
    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target?.result as string;
        // Simple parser for Netscape Bookmark format
        const links: (BookDraft & { color: string })[] = [];
        const regex = /<A HREF="([^"]+)"[^>]*>([^<]+)<\/A>/gi;
        let match;
        
        let count = 0;
        while ((match = regex.exec(content)) !== null && count < 50) { // Limit to 50 for safety
            const url = match[1];
            const title = match[2];
            links.push({
                title: title.toLowerCase(),
                author: new URL(url).hostname.replace('www.', ''),
                rating: 3,
                genre: 'bookmark',
                summary: url,
                emotionalImpact: 50,
                personalNote: 'imported bookmark',
                color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
                url: url
            });
            count++;
        }

        if (links.length > 0) {
            onBatchAdd(links);
            handleClose();
            playSfx('success');
        } else {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "i couldn't find any bookmarks in that file... is it an html file?" }]);
        }
    };
    reader.readAsText(file);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setMessages([{ id: 'init', role: 'assistant', content: "ooh, a new corner of the internet? paste the link first! 🌐" }]);
      setDraft({
        title: '',
        author: 'internet',
        rating: 0,
        genre: 'website',
        summary: '',
        emotionalImpact: 50,
        personalNote: '',
        color: PRESET_COLORS[0],
        url: ''
      });
      setIsReady(false);
    }, 500);
  };

  // Helper to detect if color is dark (for text contrast)
  const isDarkColor = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness < 128;
  };

  const textColorClass = isDarkColor(draft.color) ? 'text-white/90' : 'text-ink/90';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm transition-all duration-500">
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[32px] shadow-2xl flex overflow-hidden relative">
        
        {/* Close Button */}
        <button onClick={handleClose} className="absolute top-5 right-5 z-30 text-gray-400 hover:text-ink hover:rotate-90 transition-all duration-300 bg-transparent p-1">
            <X size={24} strokeWidth={2} />
        </button>

        {/* LEFT SIDE: Chat */}
        <div className="w-full md:w-[50%] flex flex-col border-r border-gray-100 bg-white relative">
            <div className="p-8 pb-4 flex items-center justify-between bg-white z-10">
                <h3 className="font-bold text-ink font-hand text-3xl lowercase tracking-wide flex items-center gap-2">
                    page <span className="text-blue-400 text-lg">@web</span>
                </h3>
                
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-hand text-gray-400 hover:text-ink flex items-center gap-1 border border-dashed border-gray-300 px-3 py-1 rounded-full hover:bg-gray-50 transition-colors"
                    title="Import Chrome Bookmarks HTML"
                >
                    <Upload size={12} />
                    import bookmarks
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".html"
                    className="hidden"
                />
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-4 space-y-6 custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end`}>
                        <div className={`
                            max-w-[85%] px-5 py-3 rounded-2xl font-hand text-xl leading-normal shadow-sm lowercase transition-all
                            ${msg.role === 'user' 
                                ? 'bg-ink text-white rounded-br-sm' 
                                : 'bg-[#e3f2fd] text-ink rounded-bl-sm'}
                        `}>
                            {msg.role === 'assistant' ? (
                              <TypewriterText text={msg.content} />
                            ) : (
                              msg.content
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start items-end">
                        <div className="bg-[#e3f2fd] text-gray-400 px-4 py-3 rounded-2xl rounded-bl-sm font-hand text-sm flex items-center gap-1 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-8 pt-4 bg-white">
                <div 
                  className="relative flex items-center bg-[#f8f8f8] rounded-2xl overflow-hidden transition-all duration-300"
                  style={{
                    boxShadow: isInputFocused ? `0 0 0 2px ${draft.color}40` : 'none'
                  }}
                >
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        placeholder="paste url..."
                        className="w-full pl-6 pr-14 py-4 bg-transparent font-hand text-xl placeholder:text-gray-400 focus:outline-none lowercase"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="absolute right-2 w-10 h-10 flex items-center justify-center bg-gray-300 text-white rounded-xl hover:bg-ink transition-colors disabled:opacity-50 disabled:hover:bg-gray-300"
                    >
                        <Send size={18} strokeWidth={2.5} className="ml-0.5 mt-0.5" />
                    </button>
                </div>
            </div>
        </div>

        {/* RIGHT SIDE: Preview */}
        <div className="hidden md:flex w-[50%] bg-[#fcfbf9] p-10 flex-col items-center justify-center relative overflow-hidden">
            
            {/* The Website Card */}
            <div 
                className="w-[320px] aspect-[2/3] rounded-xl shadow-2xl flex flex-col relative overflow-hidden transition-colors duration-500"
                style={{ backgroundColor: draft.color }}
            >
                {/* Texture */}
                <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>
                
                {/* Content Container */}
                <div className="relative z-10 flex-1 flex flex-col items-center text-center p-8">
                    
                    {/* URL Hint Icon */}
                    <div className={`mb-4 p-2 rounded-full ${isDarkColor(draft.color) ? 'bg-white/20 text-white' : 'bg-black/5 text-ink'}`}>
                        <Globe size={24} />
                    </div>

                    {/* Top Space */}
                    <div className="flex-1 flex flex-col justify-center w-full">
                        {draft.title ? (
                            <h2 className={`text-3xl font-hand font-bold leading-none lowercase mb-3 break-words ${textColorClass}`}>
                                {draft.title}
                            </h2>
                        ) : (
                            <div className="h-8 w-3/4 bg-black/10 rounded mx-auto animate-pulse"></div>
                        )}
                        
                        {draft.url ? (
                            <p className={`font-sans text-xs opacity-60 truncate w-full px-4 ${textColorClass}`}>
                                {draft.url.replace(/(^\w+:|^)\/\//, '')}
                            </p>
                        ) : (
                            <div className="h-4 w-1/2 bg-black/10 rounded mx-auto mt-3 animate-pulse delay-75"></div>
                        )}
                        
                         {/* Stars */}
                        <div className="flex justify-center gap-1 mt-6">
                            {[1,2,3,4,5].map(star => (
                                <button 
                                    key={star} 
                                    onClick={() => {
                                        playSfx('click');
                                        setDraft({...draft, rating: star});
                                    }}
                                    className="focus:outline-none hover:scale-110 transition-transform"
                                >
                                    <svg 
                                        className={`w-5 h-5 ${star <= draft.rating ? 'text-white fill-current' : 'text-white/30'}`}
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        fill="none"
                                    >
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Note Box */}
                    <div className={`w-full p-5 rounded-2xl mb-6 transition-colors backdrop-blur-sm ${isDarkColor(draft.color) ? 'bg-white/20' : 'bg-black/5'}`}>
                         <p className={`font-hand text-xl italic leading-tight lowercase ${textColorClass}`}>
                            "{draft.personalNote || "waiting for your thoughts..."}"
                         </p>
                    </div>

                    {/* Color Dots */}
                    <div className="flex justify-center gap-2 mt-auto pt-4 pb-2">
                        {PRESET_COLORS.slice(0, 8).map(c => (
                            <button 
                                key={c}
                                onClick={() => {
                                    playSfx('click');
                                    setDraft({...draft, color: c});
                                }}
                                className={`w-3 h-3 rounded-full transition-all hover:scale-125 shadow-sm ${draft.color === c ? 'ring-2 ring-white scale-125' : 'opacity-60 hover:opacity-100'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Button */}
            <div className={`absolute bottom-10 right-12 transition-all duration-500 ${isReady ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <button 
                    onClick={handleAdd}
                    className="flex items-center gap-2 text-ink/40 hover:text-ink font-hand text-xl lowercase transition-colors"
                >
                    <div className="w-8 h-8 bg-transparent border-2 border-current rounded-full flex items-center justify-center">
                        <LinkIcon size={16} />
                    </div>
                    add site
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AddWebsiteModal;
