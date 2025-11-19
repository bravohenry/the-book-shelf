

import React from 'react';
import { Book, Ornament } from '../types';
import { X, RotateCcw, Trash2 } from 'lucide-react';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  archivedBooks: Book[];
  archivedOrnaments: Ornament[];
  onRestore: (item: Book | Ornament, type: 'book' | 'ornament') => void;
  onDelete: (itemId: string, type: 'book' | 'ornament') => void;
}

const ArchiveModal: React.FC<ArchiveModalProps> = ({ 
  isOpen, onClose, archivedBooks, archivedOrnaments, onRestore, onDelete 
}) => {
  if (!isOpen) return null;

  const totalItems = archivedBooks.length + archivedOrnaments.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm transition-opacity">
      <div className="bg-[#fdfbf7] w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-200 bg-[#f4f1ea] flex items-center justify-between">
            <div className="flex items-center gap-3">
                <h2 className="font-hand font-bold text-3xl text-ink lowercase">archive box</h2>
                <span className="bg-cardboard px-3 py-1 rounded-full text-xs font-bold text-ink/60">
                    {totalItems} items
                </span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-ink transition-colors p-2">
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-noise">
            {totalItems === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-4 opacity-60">
                    <div className="w-24 h-24 bg-cardboard/30 rounded-full flex items-center justify-center">
                         <div className="w-12 h-1 bg-cardboard rounded-full"></div>
                    </div>
                    <p className="font-hand text-xl lowercase">box is empty...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {/* Books */}
                    {archivedBooks.map(book => (
                        <div key={book.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex items-center justify-between group hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div 
                                    className="w-3 h-16 rounded-sm shadow-inner"
                                    style={{ backgroundColor: book.color }}
                                ></div>
                                <div>
                                    <h3 className="font-bold text-ink font-hand text-xl leading-none mb-1 lowercase">{book.title}</h3>
                                    <p className="text-gray-400 text-sm lowercase">by {book.author}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => onRestore(book, 'book')}
                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg flex items-center gap-2 transition-colors font-hand text-sm font-bold lowercase"
                                    title="Put back on shelf"
                                >
                                    <RotateCcw size={16} />
                                    put back
                                </button>
                                <div className="w-px h-4 bg-gray-200"></div>
                                <button 
                                    onClick={() => onDelete(book.id, 'book')}
                                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Discard forever"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Ornaments */}
                    {archivedOrnaments.map(ornament => (
                         <div key={ornament.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex items-center justify-between group hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                                    📻
                                </div>
                                <div>
                                    <h3 className="font-bold text-ink font-hand text-xl leading-none mb-1 lowercase">
                                        lo-fi radio
                                    </h3>
                                    <p className="text-gray-400 text-sm lowercase">decoration</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => onRestore(ornament, 'ornament')}
                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg flex items-center gap-2 transition-colors font-hand text-sm font-bold lowercase"
                                >
                                    <RotateCcw size={16} />
                                    put back
                                </button>
                                <div className="w-px h-4 bg-gray-200"></div>
                                <button 
                                    onClick={() => onDelete(ornament.id, 'ornament')}
                                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-[#f4f1ea] border-t border-stone-200 text-center">
             <p className="text-xs text-gray-400 font-hand lowercase">items here are safe but hidden from your shelf</p>
        </div>

      </div>
    </div>
  );
};

export default ArchiveModal;