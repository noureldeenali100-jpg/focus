/**
 * Focus Dashboard Component.
 * Harmonized Edition: Controls recalibrated to match the Floating Command Dock language.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, FocusSound } from '../types';
import { MOTIVATIONAL_QUOTES } from '../constants';

interface FocusProps {
  userName: string; profileImage: string | null; tasks: Task[]; activeTaskId: string | null;
  timerSeconds: number; totalSeconds: number; isTimerActive: boolean; isPaused: boolean; isAnimationsEnabled: boolean; focusSound: FocusSound;
  onToggleTimer: () => void; onToggleMode: () => void; onSetTimerSeconds: (s: number) => void; onSetFocusSound: (s: FocusSound) => void;
  onEndSession: () => void;
  isAppFullscreen: boolean;
  setIsAppFullscreen: (v: boolean) => void;
}

const Focus: React.FC<FocusProps> = ({ 
  userName, tasks, activeTaskId,
  timerSeconds, totalSeconds, isTimerActive, isPaused, focusSound,
  onToggleTimer, onToggleMode, onSetTimerSeconds, onSetFocusSound, onEndSession,
  isAppFullscreen, setIsAppFullscreen
}) => {
  const [showDurations, setShowDurations] = useState(false);
  const [showSounds, setShowSounds] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0]);

  const isStopwatch = totalSeconds === 0;

  useEffect(() => {
    if (isTimerActive && !isPaused) {
      const interval = setInterval(() => {
        setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [isTimerActive, isPaused]);

  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  
  const timeStrMins = mins.toString();
  const timeStrSecs = secs.toString().padStart(2, '0');

  const radius = 210; 
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = isStopwatch ? 1 : (totalSeconds > 0 ? (timerSeconds / totalSeconds) : 0);
  const offset = circumference * (1 - progress);
  
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMinutes);
    if (!isNaN(val) && val > 0) {
      onSetTimerSeconds(val * 60);
      setShowDurations(false);
      setCustomMinutes('');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden relative font-sans">
      <header className="h-20 shrink-0 flex items-center justify-between px-6 w-full z-40 max-w-lg mx-auto">
        <div className="relative">
          <motion.button 
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowSounds(!showSounds)} 
            className="w-12 h-12 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-[var(--accent-color)] transition-all shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          </motion.button>
          <AnimatePresence>
            {showSounds && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                className="absolute top-full mt-3 left-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-[32px] p-2 flex flex-col min-w-[160px] z-[60] shadow-2xl"
              >
                {['none', 'rain', 'clock', 'library'].map((id) => (
                  <button key={id} onClick={() => {onSetFocusSound(id as FocusSound); setShowSounds(false);}} className={`py-3.5 px-6 text-[10px] font-black uppercase tracking-widest rounded-full text-left transition-all ${focusSound === id ? 'bg-[var(--accent-color)] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}> {id} </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center flex-1">
          <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.5em] mb-0.5 opacity-60">Focus Engine</h4>
          <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none truncate max-w-[120px] mx-auto">{userName || 'Guardian'}</p>
        </div>
        
        <motion.button 
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsAppFullscreen(true)} 
          className="w-12 h-12 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-[var(--accent-color)] transition-all shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        </motion.button>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <motion.div className="relative w-[min(64vw,44vh,320px)] aspect-square flex items-center justify-center mb-6">
          <svg className="absolute w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 540 540">
            <circle cx="270" cy="270" r={radius} stroke="currentColor" strokeWidth={strokeWidth - 2} fill="transparent" className="text-slate-200/40 dark:text-slate-800/20" />
            {!isStopwatch && (
              <motion.circle 
                cx="270" cy="270" r={radius} 
                stroke="var(--accent-color)" strokeWidth={strokeWidth} fill="transparent" 
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, ease: "linear" }}
                strokeLinecap="round" 
              />
            )}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 pointer-events-none p-10">
            <div className={`flex items-baseline text-[clamp(2.5rem,8vh,5.5rem)] font-black tracking-tight leading-none tabular-nums ${isTimerActive ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-800'}`}>
              <span className="tabular-nums">{timeStrMins}</span>
              <span className="mx-0.5 opacity-30">:</span>
              <span className="tabular-nums">{timeStrSecs}</span>
            </div>
          </div>
        </motion.div>

        <div className="h-16 flex items-center justify-center px-10 text-center mb-10">
           <AnimatePresence mode="wait">
             <motion.p 
                key={quote}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 italic leading-relaxed max-w-[260px]"
             >
               “{quote}”
             </motion.p>
           </AnimatePresence>
        </div>

        {/* Harmonized Elevated Controls */}
        <div className="relative w-full max-w-sm flex flex-col items-center justify-center -mt-6">
          <div className="relative flex items-center justify-center w-full">
            <AnimatePresence>
              {(!isTimerActive || isPaused) && (
                <motion.div 
                  initial={{ opacity: 0, x: -30 }} 
                  animate={{ opacity: 1, x: -85 }} 
                  exit={{ opacity: 0, x: -30 }}
                  className="absolute"
                >
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowDurations(!showDurations)}
                    className="w-14 h-14 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all shadow-[0_15px_35px_-8px_rgba(0,0,0,0.15)]"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </motion.button>
                  <AnimatePresence>
                    {showDurations && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-[42px] p-3 flex flex-col gap-1.5 min-w-[170px] z-[60] shadow-2xl"
                      >
                        <form onSubmit={handleCustomSubmit} className="px-1 mb-2">
                          <input 
                            autoFocus
                            type="number" 
                            placeholder="Mins"
                            value={customMinutes}
                            onChange={(e) => setCustomMinutes(e.target.value)}
                            className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-full px-4 py-3.5 text-xs font-black outline-none focus:border-[var(--accent-color)] text-center transition-all"
                          />
                        </form>
                        <div className="grid grid-cols-2 gap-2">
                          {[15, 25, 45, 60].map(m => (
                            <button key={m} onClick={() => {onSetTimerSeconds(m*60); setShowDurations(false);}} className="py-3.5 text-[11px] font-black text-slate-600 dark:text-slate-200 hover:bg-[var(--accent-color)] hover:text-white rounded-full text-center transition-all"> {m}m </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Floating Play Button */}
            <motion.button 
              layout
              whileTap={{ scale: 0.94 }}
              onClick={onToggleTimer}
              className={`w-24 h-24 rounded-full z-10 flex items-center justify-center transition-all shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] ${isTimerActive && !isPaused ? 'bg-orange-500 text-white' : 'bg-[var(--accent-color)] text-white'}`}
            >
              {isTimerActive && !isPaused ? (
                <svg width="34" height="34" fill="currentColor"><rect x="6" y="4" width="7" height="26" rx="2.5"/><rect x="21" y="4" width="7" height="26" rx="2.5"/></svg>
              ) : (
                <svg width="34" height="34" fill="currentColor" className="ml-2"><path d="M5 3l22 14-22 14V3z" /></svg>
              )}
            </motion.button>

            <AnimatePresence>
              {(!isTimerActive || isPaused) && (
                <motion.div 
                  initial={{ opacity: 0, x: 30 }} 
                  animate={{ opacity: 1, x: 85 }} 
                  exit={{ opacity: 0, x: 30 }}
                  className="absolute"
                >
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={onToggleMode}
                    className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all shadow-[0_15px_35px_-8px_rgba(0,0,0,0.15)] ${isStopwatch ? 'bg-[var(--accent-subtle)] border-[var(--accent-color)]/30 text-[var(--accent-color)]' : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-slate-200/50 dark:border-slate-800 text-slate-500 hover:text-slate-800'}`}
                  >
                    {isStopwatch ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="m12 12 4 4"/><path d="m12 12-4-4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M20 12h2"/><path d="M2 12h2"/></svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 2h4"/><path d="M12 14v-4"/><path d="M4 13a8 8 0 1 0 16 0 8 8 0 1 0-16 0z"/></svg>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="h-16 mt-8 flex items-center">
            <AnimatePresence>
              {isPaused && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={onEndSession}
                  className="px-8 py-3.5 bg-red-500/10 dark:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-red-500/20 transition-all active:scale-95"
                >
                  End Session
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isAppFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsAppFullscreen(false)}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center cursor-pointer p-10"
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-baseline text-[22vw] font-black text-white tabular-nums tracking-tighter leading-none">
              <span>{timeStrMins}</span>
              <span className="mx-2 opacity-20">:</span>
              <span>{timeStrSecs}</span>
            </motion.div>
            <p className="text-white/30 text-[11px] font-black uppercase tracking-[1em] mt-16 animate-pulse text-center">Tap to resume</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Focus;