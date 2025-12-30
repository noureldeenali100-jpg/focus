import React from 'react';
import { motion } from 'framer-motion';

interface PostSessionPromptProps {
  onTakeBreak: () => void;
  onContinue: () => void;
  userName: string;
}

const PostSessionPrompt: React.FC<PostSessionPromptProps> = ({ onTakeBreak, onContinue, userName }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[48px] p-10 text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-800"
      >
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">Session Complete</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed px-2">
          Outstanding work, {userName}. You've maintained deep focus. How should we proceed?
        </p>

        <div className="flex flex-col gap-4">
          <motion.button 
            whileTap={{ scale: 0.96 }}
            onClick={onTakeBreak}
            className="w-full py-5 bg-[var(--accent-color)] text-white rounded-full font-black uppercase text-xs tracking-widest shadow-xl shadow-[var(--accent-color)]/20 transition-all"
          >
            Take 5m Break
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.96 }}
            onClick={onContinue}
            className="w-full py-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full font-black uppercase text-xs tracking-widest border border-slate-200 dark:border-slate-700 transition-all"
          >
            Stay in Flow
          </motion.button>
        </div>

        <p className="mt-8 text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em]">Guardian Recommendation</p>
      </motion.div>
    </motion.div>
  );
};

export default PostSessionPrompt;