
import React, { useState } from 'react';
import { Key, ExternalLink, Check, AlertCircle } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!inputKey.trim()) {
      setError('please enter a key first');
      return;
    }
    if (!inputKey.startsWith('AIza')) {
      setError("that doesn't look like a valid gemini api key");
      return;
    }
    onSave(inputKey.trim());
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300">
      <div className="bg-[#fdfbf7] w-full max-w-md rounded-3xl shadow-2xl p-8 relative overflow-hidden">
        
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div className="mb-2 text-ink">
             <Key size={48} strokeWidth={1.5} />
          </div>

          <div className="space-y-2">
            <h2 className="font-hand font-bold text-3xl text-ink lowercase">unlock your librarian</h2>
            <p className="text-gray-500 font-hand text-lg lowercase leading-relaxed">
              to chat with <b>page</b>, you need a free google gemini api key. 
              it's totally free and keeps your shelf running!
            </p>
          </div>

          {/* Steps */}
          <div className="w-full bg-white p-5 rounded-2xl border border-stone-100 shadow-sm text-left space-y-3">
             <a 
               href="https://aistudio.google.com/app/apikey" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center justify-between group w-full p-3 bg-ink text-white rounded-xl hover:bg-gray-800 transition-colors"
             >
                <span className="font-hand lowercase text-lg">1. get free key here</span>
                <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform"/>
             </a>
             <div className="flex items-center gap-3 px-2 text-gray-400 font-hand lowercase text-sm">
                <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-xs font-bold">2</div>
                <span>copy the key from google ai studio</span>
             </div>
             <div className="flex items-center gap-3 px-2 text-gray-400 font-hand lowercase text-sm">
                <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-xs font-bold">3</div>
                <span>paste it below</span>
             </div>
          </div>

          {/* Input */}
          <div className="w-full space-y-2">
            <div className="relative">
                <input
                    type="text"
                    value={inputKey}
                    onChange={(e) => {
                        setInputKey(e.target.value);
                        setError('');
                    }}
                    placeholder="paste your AIza... key here"
                    className="w-full px-4 py-3 bg-stone-100 rounded-xl font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-stone-200 border border-transparent transition-all placeholder:font-hand placeholder:text-gray-400"
                />
            </div>
            {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm font-hand lowercase justify-center animate-pulse">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-[#e3eef6] hover:bg-[#d1e4f1] text-ink font-hand text-xl font-bold rounded-xl transition-colors lowercase flex items-center justify-center gap-2"
          >
            <Check size={20} />
            save & start
          </button>

          <p className="text-[10px] text-gray-300 lowercase font-sans text-center max-w-xs leading-tight">
            your key is stored locally in your browser. we never see it or share it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
