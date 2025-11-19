
import React, { useState, useRef, useEffect } from 'react';
import { BookDraft, Message, PRESET_COLORS } from '../types';
import { chatWithLibrarian } from '../services/geminiService';
import { Sparkles, Send, X, Check } from 'lucide-react';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (draft: BookDraft & { color: string }) => void;
}

const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, onAdd }) => {
  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'assistant', content: "hi friend! i'm page 🌿. what book are we adding to your shelf today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Draft State
  const [draft, setDraft] = useState<BookDraft>({
    title: '',
    author: '',
    rating: 0,
    genre: '',
    summary: '',
    emotionalImpact: 50,
    personalNote: '',
    color: '#1e3a8a' // Default nice blueish for start
  });
  
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatWithLibrarian(userMsg.content, draft, updatedMessages);
      
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: response.message 
      };
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, aiMsg]);
        
        if (response.draftUpdates && Object.keys(response.draftUpdates).length > 0) {
          setDraft(prev => ({ ...prev, ...response.draftUpdates }));
        }
        
        if (response.isComplete) {
          setIsReady(true);
        }
      }, 800);

    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "oopsie, i got a bit confused! can you say that again?" }]);
    }
  };

  const handleAdd = () => {
    onAdd({ ...draft, color: draft.color });
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setMessages([{ id: 'init', role: 'assistant', content: "hi friend! i'm page 🌿. what book are we adding to your shelf today?" }]);
      setDraft({
        title: '',
        author: '',
        rating: 0,
        genre: '',
        summary: '',
        emotionalImpact: 50,
        personalNote: '',
        color: '#1e3a8a'
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
  const mutedTextColorClass = isDarkColor(draft.color) ? 'text-white/60' : 'text-ink/60';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm transition-all duration-500">
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[32px] shadow-2xl flex overflow-hidden relative">
        
        {/* Close Button */}
        <button onClick={handleClose} className="absolute top-5 right-5 z-30 text-gray-400 hover:text-ink hover:rotate-90 transition-all duration-300 bg-transparent p-1">
            <X size={24} strokeWidth={2} />
        </button>

        {/* LEFT SIDE: Chat */}
        <div className="w-full md:w-[55%] flex flex-col border-r border-gray-100 bg-white relative">
            <div className="p-8 pb-4 flex items-center justify-between bg-white z-10">
                <h3 className="font-bold text-ink font-hand text-3xl lowercase tracking-wide">page</h3>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-4 space-y-6 custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end`}>
                        <div className={`
                            max-w-[85%] px-5 py-3 rounded-2xl font-hand text-xl leading-normal shadow-sm lowercase transition-all
                            ${msg.role === 'user' 
                                ? 'bg-ink text-white rounded-br-sm' 
                                : 'bg-[#f3f3f5] text-ink rounded-bl-sm'}
                        `}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start items-end">
                        <div className="bg-[#f3f3f5] text-gray-400 px-4 py-3 rounded-2xl rounded-bl-sm font-hand text-sm flex items-center gap-1 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
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
                        placeholder="say hello..."
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
        <div className="hidden md:flex w-[45%] bg-[#f9f7f2] p-10 flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-8 text-gray-300 font-hand text-sm tracking-widest lowercase">drafting...</div>
            
            {/* Red Dashed Border Area (Visual container per screenshot) */}
            <div className="border-2 border-dashed border-red-400/60 p-4 rounded-xl relative">
                {/* The Book Card */}
                <div 
                    className="w-[300px] aspect-[2/3] rounded-lg shadow-2xl flex flex-col relative overflow-hidden transition-colors duration-500"
                    style={{ backgroundColor: draft.color }}
                >
                    {/* Texture */}
                    <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>
                    
                    {/* Content Container */}
                    <div className="relative z-10 flex-1 flex flex-col items-center text-center p-6">
                        
                        {/* Top Space */}
                        <div className="flex-1 flex flex-col justify-end pb-4 w-full">
                            {draft.title ? (
                                <h2 className={`text-4xl font-hand font-bold leading-none lowercase mb-2 ${textColorClass}`}>
                                    {draft.title}
                                </h2>
                            ) : (
                                <div className="h-8 w-3/4 bg-black/10 rounded mx-auto animate-pulse"></div>
                            )}
                            
                            {draft.author ? (
                                <p className={`font-hand text-lg lowercase ${mutedTextColorClass}`}>
                                    by {draft.author}
                                </p>
                            ) : (
                                <div className="h-4 w-1/2 bg-black/10 rounded mx-auto mt-3 animate-pulse delay-75"></div>
                            )}
                        </div>

                        {/* Stars */}
                        <div className="flex justify-center gap-1 mb-8">
                            {[1,2,3,4,5].map(star => (
                                <button 
                                    key={star} 
                                    onClick={() => setDraft({...draft, rating: star})}
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

                        {/* Note Box */}
                        <div className={`w-full p-4 rounded-xl mb-6 transition-colors ${isDarkColor(draft.color) ? 'bg-white/20' : 'bg-black/5'}`}>
                             <p className={`font-hand text-lg italic leading-tight lowercase ${textColorClass}`}>
                                "{draft.personalNote || "waiting for your thoughts..."}"
                             </p>
                        </div>

                        {/* Color Dots (Bottom) */}
                        <div className="flex justify-center gap-2 mt-auto pt-2">
                            {PRESET_COLORS.slice(0, 8).map(c => (
                                <button 
                                    key={c}
                                    onClick={() => setDraft({...draft, color: c})}
                                    className={`w-3 h-3 rounded-full transition-all hover:scale-125 ${draft.color === c ? 'ring-2 ring-white scale-125' : 'opacity-60 hover:opacity-100'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Bottom Helper Text */}
            <p className="mt-4 text-red-400/60 text-xs font-hand lowercase max-w-[300px] text-center">
                这里的书的颜色 AI只能从我们定的下面的颜色里面去选择
            </p>

            {/* Add Button (Outside the dashed box) */}
            <div className={`absolute bottom-8 right-10 transition-all duration-500 ${isReady ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <button 
                    onClick={handleAdd}
                    className="flex items-center gap-2 text-ink/50 hover:text-ink font-hand text-xl lowercase transition-colors"
                >
                    <div className="w-10 h-10 bg-transparent border-2 border-current rounded-full flex items-center justify-center">
                        <PlusIcon />
                    </div>
                    add book
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export default AddBookModal;
