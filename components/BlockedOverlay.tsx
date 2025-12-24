
import React, { useMemo, useState, useEffect } from 'react';
import { MOTIVATIONAL_QUOTES } from '../constants';

interface BlockedOverlayProps {
  appName: string;
  lockedUntil?: number | null;
  onClose: () => void;
}

const BlockedOverlay: React.FC<BlockedOverlayProps> = ({ appName, lockedUntil, onClose }) => {
  const quote = useMemo(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)], []);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const diff = lockedUntil - Date.now();
      if (diff <= 0) {
        onClose();
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col items-center justify-center px-10 text-center animate-in fade-in duration-300">
      <div className="mb-12">
        <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          {lockedUntil ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          )}
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tighter">{appName} Restricted</h2>
        
        {lockedUntil ? (
          <div className="space-y-2">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Usage limit reached. Available again in:</p>
            <p className="text-4xl font-black text-red-600 dark:text-red-500 font-mono tracking-tighter">{timeLeft}</p>
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">This app is permanently blocked to maximize your potential.</p>
        )}
      </div>

      <div className="mb-16 italic text-xl text-slate-400 dark:text-slate-500 font-light leading-relaxed max-w-xs">
        “{quote}”
      </div>

      <button 
        onClick={onClose}
        className="w-full py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-slate-200 dark:shadow-none hover:opacity-90 active:scale-95 transition-all"
      >
        Dismiss
      </button>
      
      <p className="mt-8 text-[10px] text-slate-300 dark:text-slate-700 uppercase tracking-widest font-black">Focus Guardian Elite</p>
    </div>
  );
};

export default BlockedOverlay;
