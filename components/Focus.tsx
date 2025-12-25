import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Task } from '../types';
import { MOTIVATIONAL_QUOTES } from '../constants';

interface FocusProps {
  userName: string;
  profileImage: string | null;
  tasks: Task[];
  activeTaskId: string | null;
  timerSeconds: number;
  totalSeconds: number;
  isTimerActive: boolean;
  language: 'en' | 'ar';
  onToggleTimer: () => void;
  onToggleMode: () => void;
  onSetTimerSeconds: (s: number) => void;
}

const Focus: React.FC<FocusProps> = ({ 
  userName, profileImage, tasks, activeTaskId,
  timerSeconds, totalSeconds, isTimerActive, language,
  onToggleTimer, onToggleMode, onSetTimerSeconds
}) => {
  const [showDurations, setShowDurations] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const wakeLockRef = useRef<any>(null);

  // Motivational logic: Rotate quotes every 30 seconds while the timer is active
  useEffect(() => {
    let interval: number | undefined;
    if (isTimerActive) {
      setQuoteIndex(Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
      
      interval = window.setInterval(() => {
        setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
      }, 30000);
    } else {
      setQuoteIndex(0);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  // Handle Full Screen Immersive Mode and Wake Lock
  useEffect(() => {
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
        releaseWakeLock();
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      releaseWakeLock();
    };
  }, []);

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch (err) {
        console.warn(`Wake Lock error: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current !== null) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  const enterFullScreen = async () => {
    // Set UI state first so the overlay shows even if native fullscreen fails
    setIsFullScreen(true);
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      await requestWakeLock();
    } catch (err) {
      console.warn(`System Fullscreen blocked: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const exitFullScreen = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.warn(`Exit Fullscreen error: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    setIsFullScreen(false);
    releaseWakeLock();
  };

  const activeTask = useMemo(() => 
    tasks.find(t => t.id === activeTaskId), 
  [tasks, activeTaskId]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  const translations = {
    en: { 
      deepSession: "Deep Session", 
      stayPresent: "Stay Present", 
      minFocus: "Min Focus", 
      stopwatch: "Stopwatch", 
      fullScreen: "Full Screen Focus", 
      exit: "Tap to Exit" 
    },
    ar: { 
      deepSession: "جلسة عميقة", 
      stayPresent: "ابقَ حاضراً", 
      minFocus: "دقيقة تركيز", 
      stopwatch: "ساعة إيقاف", 
      fullScreen: "تركيز بملء الشاشة", 
      exit: "اضغط للخروج" 
    }
  };

  const t = translations[language];

  const size = 220; 
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? (timerSeconds / totalSeconds) : 0;
  const offset = circumference * (1 - progress);

  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex];
  const isStopwatchMode = totalSeconds === 0;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-500" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {isFullScreen && (
        <div 
          onClick={exitFullScreen}
          className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center animate-in fade-in duration-500 cursor-pointer"
        >
          <div className="text-8xl font-mono font-black tracking-tighter tabular-nums text-white mb-8">
            {formatTime(timerSeconds)}
          </div>
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] animate-pulse">
            {t.exit}
          </p>
        </div>
      )}

      <section className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[var(--accent-color)]/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="text-center mb-12 z-10 flex flex-col items-center">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-16 h-16 rounded-2xl mb-4 border-4 border-white dark:border-slate-800 shadow-lg object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl mb-4 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          )}
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-1">{isStopwatchMode ? t.stopwatch : t.deepSession}</h4>
          <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{userName || 'Guardian'}</p>
        </div>
        
        <div className="relative flex items-center justify-center mb-12 z-10" style={{ width: size, height: size }}>
          <svg className="absolute w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth - 1}
              fill="transparent"
              className="text-slate-200 dark:text-slate-800/80"
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="var(--accent-color)"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-300 ease-linear"
            />
          </svg>
          
          <div className="flex flex-col items-center justify-center text-center z-20 pointer-events-none">
            <div className={`text-6xl font-mono font-black tracking-tighter tabular-nums leading-none ${isTimerActive ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-500'}`}>
              {formatTime(timerSeconds)}
            </div>
            {activeTask && (
              <p className="mt-4 text-[10px] font-black uppercase text-[var(--accent-color)] tracking-widest truncate max-w-[160px] px-4">{activeTask.text}</p>
            )}
          </div>
        </div>

        <div className="flex flex-row items-center justify-center space-x-8 z-10 w-full mb-8">
          <div className="relative">
            <button 
              disabled={isTimerActive} 
              onClick={() => setShowDurations(!showDurations)} 
              className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all shadow-sm active:scale-95 disabled:opacity-30 ${
                isStopwatchMode 
                  ? 'bg-[var(--accent-subtle)] border-[var(--accent-color)]/30 text-[var(--accent-color)]' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-400'
              }`}
            >
              {isStopwatchMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 2h4"/><path d="M12 14v-4"/><path d="M4 13a8 8 0 1 0 16 0 8 8 0 1 0-16 0z"/><path d="M12 2v2"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              )}
            </button>
            {showDurations && (
              <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-2xl rounded-2xl p-2 flex flex-col min-w-[140px] z-50">
                {[15, 25, 45, 60].map(d => (
                  <button key={d} onClick={() => {onSetTimerSeconds(d*60); setShowDurations(false);}} className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-left">
                    {d} {t.minFocus}
                  </button>
                ))}
                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                <button 
                  onClick={() => {onSetTimerSeconds(0); setShowDurations(false);}} 
                  className="py-3 px-4 text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-left uppercase tracking-widest"
                >
                  {t.stopwatch}
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                <button 
                  onClick={() => {enterFullScreen(); setShowDurations(false);}} 
                  className="py-3 px-4 text-xs font-black text-[var(--accent-color)] hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-left uppercase tracking-widest"
                >
                  {t.fullScreen}
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={onToggleTimer}
            className={`w-20 h-20 rounded-[28px] flex items-center justify-center transition-all shadow-xl active:scale-90 ${isTimerActive ? 'bg-orange-500 text-white shadow-orange-500/20' : 'bg-[var(--accent-color)] text-white shadow-[var(--accent-color)]/20'}`}
          >
            {isTimerActive ? (
              <svg width="28" height="28" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            ) : (
              <svg width="28" height="28" fill="currentColor" className="ml-1"><path d="M5 3l14 9-14 9V3z" /></svg>
            )}
          </button>

          <button 
            onClick={onToggleMode} 
            className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all shadow-sm active:scale-95 ${
              isStopwatchMode 
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-400'
                : 'bg-[var(--accent-subtle)] border-[var(--accent-color)]/30 text-[var(--accent-color)]'
            }`}
            aria-label="Toggle Mode"
          >
            {isStopwatchMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2h4"/><path d="M12 14v-4"/><path d="M4 13a8 8 0 1 0 16 0 8 8 0 1 0-16 0z"/><path d="M12 2v2"/>
              </svg>
            )}
          </button>
        </div>

        <div className="z-10 text-center max-w-[280px] h-4 flex items-center justify-center mb-12">
          <p className="text-[10px] font-black uppercase tracking-widest transition-all duration-500" style={{ color: isTimerActive ? 'var(--accent-color)' : 'var(--slate-400)' }}>
            {isTimerActive ? currentQuote : t.stayPresent}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Focus;