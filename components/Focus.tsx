/**
 * Focus Dashboard Component.
 * Professional Master Series: Architected for supreme optical balance and ergonomic precision.
 * 
 * DESIGN SPECIFICATION:
 * - Verticality: Content is distributed using a "Weighted Center" strategy.
 * - Clearance: pb-[140px] provides definitive safe-zone above floating navigation.
 * - Improvements: Reduced main control button scale for balanced aesthetic; 
 *   perfectly centered time display; optional glowing ring effect.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, FocusSound } from '../types';
import { MOTIVATIONAL_QUOTES } from '../constants';

interface FocusProps {
  userName: string; profileImage: string | null; tasks: Task[]; activeTaskId: string | null;
  timerSeconds: number; totalSeconds: number; isTimerActive: boolean; isPaused: boolean; isAnimationsEnabled: boolean; focusSound: FocusSound;
  isTimerGlowEnabled: boolean;
  onToggleTimer: () => void; onToggleMode: () => void; onSetTimerSeconds: (s: number) => void; onSetFocusSound: (s: FocusSound) => void;
  onEndSession: () => void;
  isAppFullscreen: boolean;
  setIsAppFullscreen: (v: boolean) => void;
}

const Focus: React.FC<FocusProps> = ({ 
  userName, tasks, activeTaskId,
  timerSeconds, totalSeconds, isTimerActive, isPaused, focusSound,
  isTimerGlowEnabled,
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

  // Precision Geometry
  const radius = 220; 
  const strokeWidth = 14;
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

  /** High-Fidelity Design Tokens */
  const glassSurface = "bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/40 dark:border-slate-800/40 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.1)]";
  const innerGlow = "after:absolute after:inset-0 after:rounded-full after:ring-1 after:ring-inset after:ring-white/40 dark:after:ring-white/10 after:pointer-events-none";

  return (
    <div className="flex flex-col h-full w-full bg-[#FBFDFF] dark:bg-slate-950 transition-colors duration-700 overflow-hidden relative font-sans">
      
      {/* Tier 1: Fixed Header */}
      <header className="h-20 shrink-0 flex items-center justify-between px-10 w-full z-40 max-w-xl mx-auto">
        <div className="relative">
          <motion.button 
            whileTap={{ scale: 0.94 }}
            onClick={() => setShowSounds(!showSounds)} 
            className={`w-12 h-12 rounded-full flex items-center justify-center text-slate-500 hover:text-[var(--accent-color)] transition-all relative ${glassSurface} ${innerGlow}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          </motion.button>
          <AnimatePresence>
            {showSounds && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                className={`absolute top-full mt-4 left-0 rounded-[32px] p-2 flex flex-col min-w-[160px] z-[60] ${glassSurface}`}
              >
                {['none', 'rain', 'clock', 'library'].map((id) => (
                  <button key={id} onClick={() => {onSetFocusSound(id as FocusSound); setShowSounds(false);}} className={`py-3.5 px-6 text-[10px] font-black uppercase rounded-full text-left transition-all ${focusSound === id ? 'bg-[var(--accent-color)] text-white shadow-lg' : 'text-slate-500 hover:bg-white/40 dark:hover:bg-slate-800/40'}`}> {id} </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center flex-1">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-0.5 opacity-50">Focus Core</h4>
          <p className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none truncate max-w-[130px] mx-auto">{userName || 'Guardian'}</p>
        </div>
        
        <motion.button 
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsAppFullscreen(true)} 
          className={`w-12 h-12 rounded-full flex items-center justify-center text-slate-500 hover:text-[var(--accent-color)] transition-all relative ${glassSurface} ${innerGlow}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        </motion.button>
      </header>

      {/* Main Interactive Stage */}
      <section className="flex-1 flex flex-col justify-between items-center relative overflow-hidden">
        
        {/* Tier 2: Visual Centerpiece (Timer + Ring) */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg px-6">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-[min(70vw,34vh,340px)] aspect-square flex items-center justify-center mb-8"
          >
            <svg className="absolute w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 600 600">
              <defs>
                <filter id="focus-caustic-glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="15" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <circle 
                cx="300" cy="300" r={radius} 
                stroke="currentColor" strokeWidth={strokeWidth - 6} fill="transparent" 
                className="text-slate-200/40 dark:text-slate-800/20" 
              />
              {!isStopwatch && (
                <motion.circle 
                  cx="300" cy="300" r={radius} 
                  stroke="var(--accent-color)" strokeWidth={strokeWidth} fill="transparent" 
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1, ease: "linear" }}
                  strokeLinecap="round"
                  filter={isTimerActive && !isPaused && isTimerGlowEnabled ? "url(#focus-caustic-glow)" : "none"}
                  className="transition-all duration-300"
                />
              )}
            </svg>

            {/* Optimized Centered Time HUD */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 pointer-events-none">
              <div className={`flex items-center justify-center text-[clamp(2.5rem,8.5vh,5.5rem)] font-black tracking-tighter leading-none tabular-nums ${isTimerActive ? 'text-slate-900 dark:text-white' : 'text-slate-200 dark:text-slate-800'}`}>
                <span className="tabular-nums">{timeStrMins}</span>
                <span className="mx-0.5 opacity-15">:</span>
                <span className="tabular-nums">{timeStrSecs}</span>
              </div>
            </div>
          </motion.div>

          <div className="h-20 flex flex-col items-center justify-center text-center px-10">
             <AnimatePresence mode="wait">
               <motion.p 
                  key={quote}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-[12px] font-medium text-slate-400 dark:text-slate-500 italic leading-relaxed max-w-[280px]"
               >
                 “{quote}”
               </motion.p>
             </AnimatePresence>
             {activeTaskId && (
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 px-4 py-1.5 bg-[var(--accent-subtle)] border border-[var(--accent-color)]/10 rounded-full shadow-sm backdrop-blur-xl">
                 <p className="text-[9px] font-black uppercase text-[var(--accent-color)] tracking-widest truncate max-w-[150px]">{tasks.find(t => t.id === activeTaskId)?.text}</p>
               </motion.div>
             )}
          </div>
        </div>

        {/* Tier 3: Ergonomic Control Hub */}
        <div className="relative w-full max-w-sm flex flex-col items-center justify-center pb-[140px] lg:pb-12 shrink-0">
          <div className="relative flex items-center justify-center w-full h-28">
            
            {/* Auxiliary Control: Duration Picker */}
            <AnimatePresence>
              {(!isTimerActive || isPaused) && (
                <motion.div 
                  initial={{ opacity: 0, x: 10, scale: 0.8 }} 
                  animate={{ opacity: 1, x: -90, scale: 1 }} 
                  exit={{ opacity: 0, x: 10, scale: 0.8 }}
                  className="absolute"
                >
                  <motion.button 
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setShowDurations(!showDurations)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all relative ${glassSurface} ${innerGlow}`}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </motion.button>
                  <AnimatePresence>
                    {showDurations && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`absolute bottom-full mb-6 left-1/2 -translate-x-1/2 rounded-[42px] p-3 flex flex-col gap-1.5 min-w-[170px] z-[60] ${glassSurface}`}
                      >
                        <form onSubmit={handleCustomSubmit} className="px-1 mb-2">
                          <input 
                            autoFocus
                            type="number" 
                            placeholder="Mins"
                            value={customMinutes}
                            onChange={(e) => setCustomMinutes(e.target.value)}
                            className="w-full bg-white/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-full px-4 py-3 text-xs font-black outline-none focus:border-[var(--accent-color)] text-center transition-all shadow-inner"
                          />
                        </form>
                        <div className="grid grid-cols-2 gap-2">
                          {[15, 25, 45, 60].map(m => (
                            <button key={m} onClick={() => {onSetTimerSeconds(m*60); setShowDurations(false);}} className="py-3.5 text-[10px] font-black text-slate-600 dark:text-slate-200 hover:bg-[var(--accent-color)] hover:text-white rounded-full text-center transition-all active:scale-95"> {m}m </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Primary Command Hub: Play / Pause - Reduced to 88px for visual balance */}
            <motion.button 
              layout
              whileTap={{ scale: 0.96 }}
              onClick={onToggleTimer}
              className={`w-[88px] h-[88px] rounded-full z-10 flex items-center justify-center transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] relative ${isTimerActive && !isPaused ? 'bg-orange-500 text-white shadow-orange-500/40' : 'bg-[var(--accent-color)] text-white shadow-[var(--accent-color)]/40'}`}
            >
              <AnimatePresence mode="wait">
                {isTimerActive && !isPaused ? (
                  <motion.svg key="pause" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} width="32" height="32" fill="currentColor"><rect x="6" y="4" width="8" height="26" rx="2.5"/><rect x="20" y="4" width="8" height="26" rx="2.5"/></motion.svg>
                ) : (
                  <motion.svg key="play" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} width="32" height="32" fill="currentColor" className="ml-1.5"><path d="M5 3l22 14-22 14V3z" /></motion.svg>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Auxiliary Control: Mode Switcher */}
            <AnimatePresence>
              {(!isTimerActive || isPaused) && (
                <motion.div 
                  initial={{ opacity: 0, x: -10, scale: 0.8 }} 
                  animate={{ opacity: 1, x: 90, scale: 1 }} 
                  exit={{ opacity: 0, x: -10, scale: 0.8 }}
                  className="absolute"
                >
                  <motion.button 
                    whileTap={{ scale: 0.92 }}
                    onClick={onToggleMode}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all relative ${glassSurface} ${innerGlow} ${isStopwatch ? 'text-[var(--accent-color)]' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
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
          
          {/* Terminate Control */}
          <div className="h-16 mt-6 flex items-center justify-center">
            <AnimatePresence>
              {isPaused && (
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  onClick={onEndSession}
                  className="px-10 py-3.5 bg-red-500/10 dark:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.35em] rounded-full hover:bg-red-500/20 transition-all active:scale-95 shadow-sm border border-red-500/15"
                >
                  Terminate Session
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Immersive HUD Overlay */}
      <AnimatePresence>
        {isAppFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsAppFullscreen(false)}
            className="fixed inset-0 z-[500] bg-black/98 backdrop-blur-[40px] flex flex-col items-center justify-center cursor-pointer p-10"
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-baseline text-[25vw] font-black text-white tabular-nums tracking-tighter leading-none">
              <span>{timeStrMins}</span>
              <span className="mx-3 opacity-10">:</span>
              <span>{timeStrSecs}</span>
            </motion.div>
            <p className="text-white/10 text-[10px] font-black uppercase tracking-[1.5em] mt-20 animate-pulse text-center">Tap to restore</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Focus;