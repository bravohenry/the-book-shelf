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
    color: PRESET_COLORS[0]
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
      // Pass full history (updatedMessages) to the service
      const response = await chatWithLibrarian(userMsg.content, draft, updatedMessages);
      
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: response.message 
      };
      
      // Simulate realistic typing delay based on message length
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
        color: PRESET_COLORS[0]
      });
      setIsReady(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-md transition-all duration-500">
      <div className="bg-[#fcfcfc] w-full max-w-5xl h-[85vh] rounded-[32px] shadow-2xl border-[6px] border-white flex overflow-hidden relative ring-1 ring-black/5">
        
        {/* Close Button */}
        <button onClick={handleClose} className="absolute top-6 right-6 z-20 text-gray-400 hover:text-ink hover:rotate-90 transition-all duration-300 bg-white rounded-full p-1 shadow-sm">
            <X size={24} strokeWidth={2} />
        </button>

        {/* LEFT SIDE: Chat Interface */}
        <div className="w-full md:w-[55%] flex flex-col border-r border-gray-100 bg-white">
            {/* Header - Simplified: No icon */}
            <div className="p-6 border-b border-gray-50 flex items-center bg-white/50 backdrop-blur-sm z-10">
                <h3 className="font-bold text-ink font-hand text-3xl lowercase tracking-wide">page</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end`}>
                        <div className={`
                            max-w-[85%] px-5 py-3 rounded-2xl font-hand text-xl leading-normal shadow-sm lowercase transition-all
                            ${msg.role === 'user' 
                                ? 'bg-ink text-white rounded-br-sm' 
                                : 'bg-[#f4f4f5] text-ink rounded-bl-sm'}
                        `}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start items-end">
                        <div className="bg-[#f4f4f5] text-gray-400 px-4 py-3 rounded-2xl rounded-bl-sm font-hand text-sm flex items-center gap-1 shadow-sm">
                            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75"></span>
                            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 bg-white">
                <div 
                  className="relative flex items-center shadow-sm rounded-2xl overflow-hidden border transition-all duration-300"
                  style={{
                    borderColor: isInputFocused ? draft.color : '#f3f4f6',
                    boxShadow: isInputFocused ? `0 0 0 3px ${draft.color}40` : 'none'
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
                        className="w-full pl-6 pr-14 py-4 bg-gray-50/50 font-hand text-xl placeholder:text-gray-300 focus:outline-none lowercase"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="absolute right-2 p-2 bg-ink text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        <Send size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>

        {/* RIGHT SIDE: Live Draft Preview as BOOK COVER */}
        <div className="hidden md:flex w-[45%] bg-[#f9f7f2] p-8 flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-noise opacity-50"></div>
            
            <h3 className="absolute top-8 text-gray-400 font-hand text-sm tracking-widest font-bold z-10 opacity-50 lowercase">
                {isReady ? "ready to add!" : "drafting..."}
            </h3>
            
            {/* The Book Cover Card */}
            <div 
                className="w-full max-w-[320px] aspect-[2/3] rounded-r-md rounded-l-sm shadow-book-hover p-6 transition-all duration-700 relative z-10 flex flex-col overflow-hidden"
                style={{ backgroundColor: draft.color }}
            >
                {/* Texture Overlay */}
                <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none"></div>

                {/* Spine/Binding Effect */}
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-black/5 border-r border-black/5 z-20"></div>
                <div className="absolute left-1 top-0 bottom-0 w-[1px] bg-white/20 z-20"></div>
                
                {/* Cover Content */}
                <div className="relative z-10 flex-1 flex flex-col items-center text-center ml-3 h-full p-2 border border-white/10 rounded-sm">
                    
                    {/* Top Section: Title & Author */}
                    <div className="mt-8 mb-2 w-full flex flex-col justify-center min-h-[30%]">
                        {draft.title ? (
                            <h2 className="text-4xl font-hand font-bold text-ink leading-tight lowercase break-words drop-shadow-sm">{draft.title}</h2>
                        ) : (
                            <div className="h-8 w-3/4 bg-black/5 rounded-md mx-auto animate-pulse"></div>
                        )}
                        {draft.author ? (
                            <p className="font-hand text-ink/60 text-xl mt-3 lowercase">by {draft.author}</p>
                        ) : (
                            <div className="h-4 w-1/2 bg-black/5 rounded-md mx-auto mt-4 animate-pulse delay-100"></div>
                        )}
                    </div>

                    {/* Middle Section: Decoration / Stars */}
                    <div className="flex-1 flex items-center justify-center w-full">
                        <div className="flex justify-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                            {[1,2,3,4,5].map(star => (
                                <button 
                                    key={star} 
                                    onClick={() => setDraft({...draft, rating: star})}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <svg 
                                        className={`w-6 h-6 transition-colors drop-shadow-sm ${star <= draft.rating ? 'fill-white text-white' : 'text-black/10'}`}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    >
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Section: Blurb/Note */}
                    <div className="relative p-4 bg-white/40 backdrop-blur-sm rounded-xl shadow-sm w-full mb-6 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                         <Sparkles size={14} className="absolute -top-2 -right-2 text-white drop-shadow-sm" strokeWidth={2.5} />
                         <p className="font-hand text-ink text-lg leading-relaxed italic min-h-[3rem] lowercase break-words">
                            "{draft.personalNote || "waiting for your thoughts..."}"
                         </p>
                    </div>

                    {/* Footer: Color Swatches */}
                    <div className="flex justify-center flex-wrap gap-2 pb-2">
                        {PRESET_COLORS.map(c => (
                            <button 
                                key={c}
                                onClick={() => setDraft({...draft, color: c})}
                                className={`w-3 h-3 rounded-full transition-all hover:scale-150 shadow-sm border border-black/5 ${draft.color === c ? 'ring-2 ring-white ring-offset-1 scale-125' : 'opacity-60 hover:opacity-100'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className={`absolute bottom-8 transition-all duration-500 transform ${isReady ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <button 
                    onClick={handleAdd}
                    className="bg-ink text-white px-10 py-3 rounded-full font-hand font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 lowercase"
                    >
                    <Check size={20} strokeWidth={3} />
                    add to shelf
                    </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AddBookModal;