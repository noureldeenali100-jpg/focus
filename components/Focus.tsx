/**
 * Focus Dashboard Component.
 * Restored Legacy Visuals + SaaS Architecture + Framer Motion Enhancements.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, FocusSound } from '../types';
import { MOTIVATIONAL_QUOTES } from '../constants';

interface FocusProps {
  userName: string; profileImage: string | null; tasks: Task[]; activeTaskId: string | null;
  timerSeconds: number; totalSeconds: number; isTimerActive: boolean; isAnimationsEnabled: boolean; focusSound: FocusSound;
  onToggleTimer: () => void; onToggleMode: () => void; onSetTimerSeconds: (s: number) => void; onSetFocusSound: (s: FocusSound) => void;
  isAppFullscreen: boolean;
  setIsAppFullscreen: (v: boolean) => void;
}

const Focus: React.FC<FocusProps> = ({ 
  userName, tasks, activeTaskId,
  timerSeconds, totalSeconds, isTimerActive, focusSound,
  onToggleTimer, onToggleMode, onSetTimerSeconds, onSetFocusSound,
  isAppFullscreen, setIsAppFullscreen
}) => {
  const [showDurations, setShowDurations] = useState(false);
  const [showSounds, setShowSounds] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    let interval: number | undefined;
    if (isTimerActive) {
      setQuoteIndex(Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
      interval = window.setInterval(() => { setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length); }, 15000); 
    } else { setQuoteIndex(0); }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const enterFullscreen = useCallback(async () => {
    const docEl = document.documentElement as any;
    try {
      if (docEl.requestFullscreen) await docEl.requestFullscreen();
      else if (docEl.webkitRequestFullscreen) await docEl.webkitRequestFullscreen();
      setIsAppFullscreen(true);
    } catch (err) { setIsAppFullscreen(true); }
  }, [setIsAppFullscreen]);

  const exitFullscreen = useCallback(async () => {
    if (document.exitFullscreen) await document.exitFullscreen();
    setIsAppFullscreen(false);
  }, [setIsAppFullscreen]);

  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  // Elastic Scaling Architecture
  // Ensures perfect circularity and centering across all devices.
  const sizeClass = "w-[min(72vw,56vh,480px)] aspect-square";
  const radius = 250; 
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? (timerSeconds / totalSeconds) : 0;
  const offset = circumference * (1 - progress);
  
  return (
    <div className="flex flex-col h-full w-full bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-500 overflow-hidden relative">
      {/* Tactical Top Bar */}
      <header className="h-20 lg:h-28 shrink-0 flex items-center justify-between px-[clamp(1.5rem,6vw,4rem)] w-full z-40">
        <div className="relative">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSounds(!showSounds)} 
            className="w-12 h-12 lg:w-14 lg:h-14 rounded-[18px] bg-white dark:bg-slate-900 shadow-[4px_4px_10px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-[var(--accent-color)] active:scale-90 transition-all"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          </motion.button>
          <AnimatePresence>
            {showSounds && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute top-full mt-4 left-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-[28px] p-3 flex flex-col min-w-[200px] z-[60]"
              >
                {['none', 'rain', 'clock', 'library'].map((id) => (
                  <button key={id} onClick={() => {onSetFocusSound(id as FocusSound); setShowSounds(false);}} className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest rounded-[18px] text-left transition-all ${focusSound === id ? 'bg-[var(--accent-subtle)] text-[var(--accent-color)]' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}> {id} </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-1">Guardian Mode</h4>
          <p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{userName || 'Digital Shield'}</p>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={enterFullscreen} 
          className="w-12 h-12 lg:w-14 lg:h-14 rounded-[18px] bg-white dark:bg-slate-900 shadow-[4px_4px_10px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-[var(--accent-color)] active:scale-90 transition-all"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        </motion.button>
      </header>

      {/* Hero Interaction Stage */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <motion.div 
          animate={isTimerActive ? { scale: [1, 1.01, 1] } : { scale: 1 }}
          transition={isTimerActive ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : {}}
          className={`relative ${sizeClass} flex items-center justify-center group`}
        >
          {/* Neumorphic Shadow Ring */}
          <div className="absolute inset-[-10px] rounded-full shadow-[8px_8px_20px_rgba(0,0,0,0.04),-8px_-8px_20px_rgba(255,255,255,0.8)] dark:shadow-none pointer-events-none" />
          
          {/* Progress Architecture */}
          <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 540 540">
            <circle cx="270" cy="270" r={radius} stroke="currentColor" strokeWidth={strokeWidth - 2} fill="transparent" className="text-slate-100 dark:text-slate-800/40" />
            <motion.circle 
              cx="270" 
              cy="270" 
              r={radius} 
              stroke="var(--accent-color)" 
              strokeWidth={strokeWidth} 
              fill="transparent" 
              strokeDasharray={circumference} 
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "linear" }}
              strokeLinecap="round" 
              vectorEffect="non-scaling-stroke"
              style={{ filter: isTimerActive ? 'drop-shadow(0 0 8px var(--accent-color))' : 'none' }}
            />
          </svg>

          {/* Time & Mission Overlay */}
          <div className="flex flex-col items-center justify-center text-center z-10 pointer-events-none px-12">
            <motion.div 
              key={timeStr}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              className={`text-[clamp(4rem,16vh,9rem)] font-black tracking-tighter leading-none tabular-nums transition-all duration-700 ${isTimerActive ? 'text-slate-900 dark:text-white' : 'text-slate-200 dark:text-slate-800'}`}>
              {timeStr}
            </motion.div>
            {activeTaskId && tasks.find(t => t.id === activeTaskId) && (
              <p className="mt-4 lg:mt-8 text-[clamp(11px,2vh,18px)] font-black uppercase text-[var(--accent-color)] tracking-[0.4em] animate-fade-in max-w-[220px] lg:max-w-md truncate">
                {tasks.find(t => t.id === activeTaskId)?.text}
              </p>
            )}
          </div>
        </motion.div>

        {/* Tactical Control Cluster */}
        <div className="flex items-center justify-center gap-[clamp(1.5rem,6vw,4rem)] mt-[clamp(2rem,6vh,6rem)] z-20">
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isTimerActive} 
              onClick={() => setShowDurations(!showDurations)} 
              className="w-16 h-16 lg:w-20 lg:h-20 rounded-[24px] bg-white dark:bg-slate-900 shadow-[6px_6px_15px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 active:scale-90 transition-all disabled:opacity-30 hover:text-[var(--accent-color)]"
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </motion.button>
            <AnimatePresence>
              {showDurations && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-[32px] p-4 flex flex-col min-w-[240px] z-50"
                >
                  {[15, 25, 45, 60].map(d => (
                    <button key={d} onClick={() => {onSetTimerSeconds(d*60); setShowDurations(false);}} className="py-4 px-6 text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:bg-[var(--accent-subtle)] hover:text-[var(--accent-color)] rounded-[20px] text-left transition-all"> {d} Minutes </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleTimer} 
            className={`w-28 h-28 lg:w-36 lg:h-36 rounded-[40px] flex items-center justify-center transition-all duration-700 shadow-[10px_10px_30px_rgba(0,0,0,0.1)] active:scale-95 hover:brightness-110 ${isTimerActive ? 'bg-orange-500 text-white' : 'bg-[var(--accent-color)] text-white'}`}
          >
            {isTimerActive ? (
              <svg width="44" height="44" fill="currentColor"><rect x="10" y="4" width="6" height="36" rx="2"/><rect x="28" y="4" width="6" height="36" rx="2"/></svg>
            ) : (
              <svg width="44" height="44" fill="currentColor" className="ml-2"><path d="M5 3l30 21-30 21V3z" /></svg>
            )}
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleMode}
            className="w-16 h-16 lg:w-20 lg:h-20 rounded-[24px] bg-white dark:bg-slate-900 shadow-[6px_6px_15px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 active:scale-90 transition-all hover:text-orange-500"
          >
             <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 2h4"/><path d="M12 14v-4"/><path d="M4 13a8 8 0 1 0 16 0 8 8 0 1 0-16 0z"/><path d="M12 2v2"/></svg>
          </motion.button>
        </div>

        {/* Motivational Status */}
        <div className="mt-[clamp(2.5rem,7vh,8rem)] h-16 flex items-center justify-center px-12 text-center">
          <AnimatePresence mode="wait">
            <motion.p 
              key={quoteIndex} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-[clamp(11px,1.8vh,16px)] font-black uppercase tracking-[0.5em] text-slate-400 dark:text-slate-600"
            >
              {isTimerActive ? MOTIVATIONAL_QUOTES[quoteIndex] : "PROTOCOL ACTIVE • STANDBY"}
            </motion.p>
          </AnimatePresence>
        </div>
      </section>

      {/* Immersive Overlay */}
      <AnimatePresence>
        {isAppFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={exitFullscreen} 
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center cursor-pointer"
          >
             <motion.div 
               initial={{ scale: 0.8 }}
               animate={{ scale: 1 }}
               className="text-[min(28vw,40vh)] font-black text-white tabular-nums drop-shadow-[0_0_60px_rgba(37,99,235,0.5)]"
             >
               {timeStr}
             </motion.div>
             <p className="text-white/20 text-[11px] font-black uppercase tracking-[1em] mt-24 animate-pulse">Tap to resume terminal</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Focus;