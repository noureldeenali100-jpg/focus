/**
 * Focus Dashboard Component.
 * The primary interface for controlling focus timers and sessions.
 * Features ultra-precise SVG progress indicators and elastic UI scaling.
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  const [customValue, setCustomValue] = useState('');

  useEffect(() => {
    let interval: number | undefined;
    if (isTimerActive) {
      setQuoteIndex(Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
      interval = window.setInterval(() => { setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length); }, 20000); 
    } else { setQuoteIndex(0); }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      if (!isCurrentlyFullscreen) setIsAppFullscreen(false);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [setIsAppFullscreen]);

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

  // Elastic Scaling Logic:
  // Mobile: Scales based on viewport width (max 75vw)
  // Desktop: Scales based on viewport height (max 55vh)
  // Absolute max: 520px
  const sizeClass = "w-[min(75vw,55vh,520px)] aspect-square";
  const radius = 250; // Internal SVG radius
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? (timerSeconds / totalSeconds) : 0;
  const offset = circumference * (1 - progress);
  
  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex]; 
  const isStopwatchMode = totalSeconds === 0;

  const handleSetCustom = () => {
    const val = parseInt(customValue);
    if (!isNaN(val) && val > 0) {
      onSetTimerSeconds(val * 60);
      setShowDurations(false);
      setCustomValue('');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden relative">
      {/* Precision Header Bar */}
      <header className="h-16 lg:h-24 shrink-0 flex items-center justify-between px-6 lg:px-12 w-full z-40 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md border-b border-slate-200/40 dark:border-slate-800/40">
        <div className="relative">
          <button onClick={() => setShowSounds(!showSounds)} className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-[var(--accent-color)] active:scale-90 transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          </button>
          {showSounds && (
            <div className="absolute top-full mt-4 left-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-[2rem] p-3 flex flex-col min-w-[200px] z-[60] animate-zoom-in">
              {['none', 'rain', 'clock', 'library'].map((id) => (
                <button key={id} onClick={() => {onSetFocusSound(id as FocusSound); setShowSounds(false);}} className={`py-4 px-6 text-xs font-black uppercase tracking-widest rounded-[1.5rem] text-left transition-all ${focusSound === id ? 'bg-[var(--accent-subtle)] text-[var(--accent-color)]' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}> {id} </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-center flex-1 max-w-[200px] lg:max-w-md">
          <h4 className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-0.5">Focus Mode</h4>
          <p className="text-lg lg:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none truncate">{userName || 'Guardian'}</p>
        </div>
        
        <button onClick={enterFullscreen} className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-[var(--accent-color)] active:scale-90 transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
        </button>
      </header>

      {/* Elastic Content Stage */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className={`relative ${sizeClass} flex items-center justify-center transform-gpu transition-all duration-700 ease-out`}>
          {/* Progress Circle SVG - with non-scaling stroke for consistency */}
          <svg className="absolute w-full h-full -rotate-90 drop-shadow-2xl" viewBox="0 0 540 540">
            <circle cx="270" cy="270" r={radius} stroke="currentColor" strokeWidth={strokeWidth - 2} fill="transparent" className="text-slate-200 dark:text-slate-800/40" vectorEffect="non-scaling-stroke" />
            <circle cx="270" cy="270" r={radius} stroke="var(--accent-color)" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-[stroke-dashoffset] duration-300 ease-linear" vectorEffect="non-scaling-stroke" />
          </svg>

          {/* Time & Task Centerpoint */}
          <div className="flex flex-col items-center justify-center text-center z-10 pointer-events-none px-10">
            <div className={`text-[clamp(3.5rem,15vh,8rem)] lg:text-[clamp(6rem,20vh,11rem)] font-black tracking-tighter leading-none tabular-nums transition-colors duration-500 ${isTimerActive ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-700'}`}>
              {timeStr}
            </div>
            {activeTaskId && tasks.find(t => t.id === activeTaskId) && (
              <p className="mt-4 lg:mt-8 text-[clamp(11px,2.2vh,18px)] font-black uppercase text-[var(--accent-color)] tracking-[0.3em] animate-fade-in max-w-[200px] lg:max-w-md truncate">
                {tasks.find(t => t.id === activeTaskId)?.text}
              </p>
            )}
          </div>
        </div>

        {/* Tactical Control Bar */}
        <div className="flex items-center justify-center gap-8 lg:gap-16 mt-12 lg:mt-20 z-20">
          <div className="relative">
            <button 
              disabled={isTimerActive} 
              onClick={() => setShowDurations(!showDurations)} 
              className="w-14 h-14 lg:w-16 lg:h-16 rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 active:scale-90 transition-all disabled:opacity-30 hover:text-[var(--accent-color)]"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </button>
            {showDurations && (
              <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-[2.5rem] p-4 flex flex-col min-w-[220px] z-50 animate-zoom-in">
                {[15, 25, 45, 60].map(d => (
                  <button key={d} onClick={() => {onSetTimerSeconds(d*60); setShowDurations(false);}} className="py-4 px-6 text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:bg-[var(--accent-subtle)] hover:text-[var(--accent-color)] rounded-[1.5rem] text-left transition-all"> {d} Minutes </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={onToggleTimer} 
            className={`w-24 h-24 lg:w-32 lg:h-32 rounded-[3.5rem] flex items-center justify-center transition-all duration-500 shadow-2xl active:scale-95 hover:brightness-110 ${isTimerActive ? 'bg-orange-500 text-white' : 'bg-[var(--accent-color)] text-white'}`}
          >
            {isTimerActive ? (
              <svg width="40" height="40" fill="currentColor"><rect x="8" y="4" width="6" height="32" rx="2"/><rect x="26" y="4" width="6" height="32" rx="2"/></svg>
            ) : (
              <svg width="40" height="40" fill="currentColor" className="ml-2"><path d="M5 3l28 17-28 17V3z" /></svg>
            )}
          </button>

          <button 
            onClick={onToggleMode}
            className="w-14 h-14 lg:w-16 lg:h-16 rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 active:scale-90 transition-all hover:text-orange-500"
          >
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 2h4"/><path d="M12 14v-4"/><path d="M4 13a8 8 0 1 0 16 0 8 8 0 1 0-16 0z"/><path d="M12 2v2"/></svg>
          </button>
        </div>

        {/* Immersive Text */}
        <div className="mt-12 lg:mt-20 h-12 flex items-center justify-center px-12 text-center">
          <p key={quoteIndex} className="text-[clamp(11px,1.8vh,16px)] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 animate-in fade-in slide-in-from-bottom duration-1000">
            {isTimerActive ? currentQuote : "Commit to your goals"}
          </p>
        </div>
      </section>

      {/* Immersive Fullscreen Overlay */}
      {isAppFullscreen && (
        <div onClick={exitFullscreen} className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center cursor-pointer animate-in fade-in">
           <div className="text-[min(25vw,35vh)] font-black text-white tabular-nums drop-shadow-[0_0_50px_rgba(37,99,235,0.4)]">{timeStr}</div>
           <p className="text-white/20 text-[10px] font-black uppercase tracking-[1em] mt-24 animate-pulse">Protocol Active • Tap to exit</p>
        </div>
      )}
    </div>
  );
};

export default Focus;