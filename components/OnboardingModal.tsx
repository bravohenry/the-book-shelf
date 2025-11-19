
import React, { useState } from 'react';
import { ArrowRight, Check, Sparkles, Hand, Radio, Key, BookOpen } from 'lucide-react';
import { playSfx } from '../services/audioService';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    id: 'welcome',
    icon: <Sparkles size={48} className="text-yellow-400" />,
    title: "welcome home",
    desc: "this is your new digital sanctuary. a cozy place to keep your favorite books and websites.",
  },
  {
    id: 'ai',
    icon: <span className="text-5xl">🌿</span>,
    title: "meet page",
    desc: "page is your ai librarian. just tell page a title or paste a link, and they'll catalog it for you with a cute little note.",
    note: "(you'll need a free api key for this!)"
  },
  {
    id: 'physics',
    icon: <Hand size={48} className="text-ink" />,
    title: "make it yours",
    desc: "drag books to organize them. drop them in the bottom-left corner to archive. it's messy, just like a real shelf.",
  },
  {
    id: 'cozy',
    icon: <Radio size={48} className="text-rose-400" />,
    title: "stay a while",
    desc: "turn on the radio for some lo-fi beats, change the theme, and enjoy the vibes.",
  }
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    playSfx('click');
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const stepData = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-500">
      <div className="bg-[#fdfbf7] w-full max-w-md rounded-[32px] shadow-2xl p-8 relative overflow-hidden border-4 border-white/50">
        
        {/* Texture Overlay */}
        <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>

        {/* Progress Dots */}
        <div className="absolute top-6 left-0 right-0 flex justify-center gap-2">
            {STEPS.map((_, idx) => (
                <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-ink w-4' : 'bg-gray-300'}`}
                />
            ))}
        </div>

        <div className="flex flex-col items-center text-center mt-8 min-h-[280px]">
            {/* Icon Container */}
            <div className="w-24 h-24 bg-white rounded-full shadow-sm border border-stone-100 flex items-center justify-center mb-6 animate-bounce-subtle">
                {stepData.icon}
            </div>

            <h2 className="font-hand font-bold text-3xl text-ink lowercase mb-4">
                {stepData.title}
            </h2>
            
            <p className="text-gray-500 font-hand text-xl lowercase leading-relaxed max-w-[80%]">
                {stepData.desc}
            </p>
            
            {stepData.note && (
                <p className="mt-2 text-blue-400 font-hand text-sm lowercase font-bold">
                    {stepData.note}
                </p>
            )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
            <button 
                onClick={() => { playSfx('click'); onClose(); }}
                className="text-gray-400 hover:text-ink font-hand text-lg lowercase px-4 py-2 transition-colors"
            >
                skip
            </button>

            <button 
                onClick={handleNext}
                className="bg-ink text-white px-6 py-3 rounded-2xl font-hand text-xl lowercase flex items-center gap-2 hover:bg-gray-800 hover:scale-105 transition-all shadow-lg"
            >
                {currentStep === STEPS.length - 1 ? (
                    <>let's go <Check size={18} /></>
                ) : (
                    <>next <ArrowRight size={18} /></>
                )}
            </button>
        </div>

      </div>
    </div>
  );
};

export default OnboardingModal;
