import React, { useMemo } from 'react';
import { MOTIVATIONAL_QUOTES } from '../constants';

interface BlockedOverlayProps {
  appName: string;
  onClose: () => void;
}

const BlockedOverlay: React.FC<BlockedOverlayProps> = ({ appName, onClose }) => {
  const quote = useMemo(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)], []);

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col items-center justify-center px-10 text-center animate-in fade-in duration-300">
      <div className="mb-12">
        <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><rect x="10" y="10" width="4" height="4"/></svg>
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tighter">{appName} is Blocked</h2>
        
        <div className="space-y-4">
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              This app is blocked so you can stay focused. Social media access is restricted to promote productivity.
          </p>
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Note: Social Media is Always Blocked</p>
        </div>
      </div>

      <div className="mb-16 italic text-xl text-slate-400 dark:text-slate-500 font-light leading-relaxed max-w-xs">
        “{quote}”
      </div>

      <button 
        onClick={onClose}
        className="w-full py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-slate-200 dark:shadow-none hover:opacity-90 active:scale-95 transition-all"
      >
        OK
      </button>
      
      <p className="mt-8 text-[10px] text-slate-300 dark:text-slate-700 uppercase tracking-widest font-black">Focus Mode Active</p>
    </div>
  );
};

export default BlockedOverlay;