import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Task, FocusSound } from '../types';
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
  focusSound: FocusSound;
  onToggleTimer: () => void;
  onToggleMode: () => void;
  onSetTimerSeconds: (s: number) => void;
  onSetFocusSound: (s: FocusSound) => void;
}

const Focus: React.FC<FocusProps> = ({ 
  userName, profileImage, tasks, activeTaskId,
  timerSeconds, totalSeconds, isTimerActive, language, focusSound,
  onToggleTimer, onToggleMode, onSetTimerSeconds, onSetFocusSound
}) => {
  const [showDurations, setShowDurations] = useState(false);
  const [showSounds, setShowSounds] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    let interval: number | undefined;
    if (isTimerActive) {
      setQuoteIndex(Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
      
      interval = window.setInterval(() => {
        setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
      }, 20000); 
    } else {
      setQuoteIndex(0);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

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
      deepSession: "Focus Timer", 
      stayPresent: "Stay focused", 
      minFocus: "Minutes", 
      stopwatch: "Stopwatch", 
      fullScreen: "Full Screen Mode", 
      exit: "Tap to close",
      sounds: "Ambient Sounds",
      mute: "Mute",
      rain: "Rain",
      clock: "Ticking",
      library: "Library"
    },
    ar: { 
      deepSession: "جلسة عميقة", 
      stayPresent: "ابقَ حاضراً", 
      minFocus: "دقيقة تركيز", 
      stopwatch: "ساعة إيقاف", 
      fullScreen: "تركيز بملء الشاشة", 
      exit: "اضغط للخروج",
      sounds: "أصوات محيطة",
      mute: "صامت",
      rain: "مطر",
      clock: "تكتكة",
      library: "مكتبة"
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

  const soundOptions: {id: FocusSound, label: string}[] = [
    { id: 'none', label: t.mute },
    { id: 'rain', label: t.rain },
    { id: 'clock', label: t.clock },
    { id: 'library', label: t.library }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {isFullScreen && (
        <div 
          onClick={exitFullScreen}
          className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center animate-in fade-in duration-700 cursor-pointer"
        >
          <div className="text-8xl font-black tracking-tighter tabular-nums text-white mb-8 animate-pulse-soft">
            {formatTime(timerSeconds)}
          </div>
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] animate-pulse">
            {t.exit}
          </p>
        </div>
      )}

      <section className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Subtle Sound Toggle Button (Top-Left) */}
        <div className="absolute top-5 left-5 z-50">
          <button 
            onClick={() => setShowSounds(!showSounds)}
            className={`p-2 rounded-2xl bg-white/20 dark:bg-slate-900/20 border border-slate-200/30 dark:border-slate-800/30 backdrop-blur-sm active:scale-90 transition-all shadow-sm ${focusSound !== 'none' ? 'text-[var(--accent-color)] border-[var(--accent-color)]/20' : 'text-slate-400 dark:text-slate-500'}`}
            aria-label="Sound Selection"
          >
            {focusSound === 'none' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            )}
          </button>
          
          {showSounds && (
            <div className="absolute top-full mt-3 left-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-2.5 flex flex-col min-w-[140px] z-50 animate-in zoom-in-95 slide-in-from-top-4 duration-300">
              {soundOptions.map((opt, i) => (
                <button 
                  key={opt.id} 
                  onClick={() => {onSetFocusSound(opt.id); setShowSounds(false);}} 
                  className={`py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl text-left transition-all active:scale-95 animate-in fade-in stagger-${i+1} ${focusSound === opt.id ? 'bg-[var(--accent-subtle)] text-[var(--accent-color)]' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Minimal Full Screen Toggle Button (Top-Right) */}
        <button 
          onClick={enterFullScreen}
          className="absolute top-5 right-5 z-50 p-2 rounded-2xl bg-white/20 dark:bg-slate-900/20 border border-slate-200/30 dark:border-slate-800/30 text-slate-400 dark:text-slate-500 backdrop-blur-sm active:scale-90 transition-all hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/20 shadow-sm"
          aria-label="Enter Full Screen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>

        {/* Animated background glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[var(--accent-color)]/5 blur-[120px] rounded-full pointer-events-none transition-all duration-1000 ease-in-out" 
          style={{ transform: isTimerActive ? 'translate(-50%, -50%) scale(1.4)' : 'translate(-50%, -50%) scale(1)' }} 
        />

        <div className="text-center mb-12 z-10 flex flex-col items-center animate-in slide-in-from-top-4 duration-700">
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1 animate-in fade-in stagger-1">{isStopwatchMode ? t.stopwatch : t.deepSession}</h4>
          <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight animate-in fade-in stagger-2">{userName || 'Guardian'}</p>
        </div>
        
        <div className="relative flex items-center justify-center mb-12 z-10 transition-transform duration-700 ease-out" style={{ width: size, height: size, transform: isTimerActive ? 'scale(1.04)' : 'scale(1)' }}>
          <svg className="absolute w-full h-full -rotate-90 drop-shadow-sm" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth - 1}
              fill="transparent"
              className="text-slate-200 dark:text-slate-800/80 transition-colors duration-700"
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
              className="transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)"
            />
          </svg>
          
          <div className="flex flex-col items-center justify-center text-center z-20 pointer-events-none">
            <div className={`text-6xl font-black tracking-tighter tabular-nums leading-none transition-all duration-700 ${isTimerActive ? 'text-slate-900 dark:text-white scale-100 drop-shadow-md' : 'text-slate-300 dark:text-slate-600'}`}>
              {formatTime(timerSeconds)}
            </div>
            {activeTask && (
              <p className="mt-5 text-[10px] font-black uppercase text-[var(--accent-color)] tracking-[0.15em] truncate max-w-[170px] px-4 animate-in slide-in-from-bottom-2 duration-500">{activeTask.text}</p>
            )}
          </div>
        </div>

        <div className="flex flex-row items-center justify-center space-x-8 z-10 w-full mb-10 animate-in slide-in-from-bottom-4 duration-700">
          <div className="relative transition-all duration-500">
            <button 
              disabled={isTimerActive} 
              onClick={() => setShowDurations(!showDurations)} 
              className={`w-14 h-14 flex items-center justify-center rounded-3xl border transition-all duration-500 shadow-sm active:scale-90 ${
                isStopwatchMode 
                  ? 'bg-[var(--accent-subtle)] border-[var(--accent-color)]/40 text-[var(--accent-color)]' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
              } ${isTimerActive ? 'opacity-0 pointer-events-none -translate-x-4' : 'opacity-100 hover:shadow-lg hover:-translate-y-0.5'}`}
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
              <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-2.5 flex flex-col min-w-[160px] z-50 animate-in zoom-in-95 slide-in-from-bottom-6 duration-300">
                {[15, 25, 45, 60].map((d, i) => (
                  <button key={d} onClick={() => {onSetTimerSeconds(d*60); setShowDurations(false);}} className={`py-3.5 px-4 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:bg-[var(--accent-subtle)] hover:text-[var(--accent-color)] rounded-xl text-left transition-all active:scale-95 animate-in fade-in stagger-${i+1}`}>
                    {d} {t.minFocus}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={onToggleTimer}
            className={`w-20 h-20 rounded-[36px] flex items-center justify-center transition-all duration-500 shadow-2xl active:scale-75 ${isTimerActive ? 'bg-orange-500 text-white shadow-orange-500/40' : 'bg-[var(--accent-color)] text-white shadow-[var(--accent-color)]/40'} hover:brightness-110 hover:-translate-y-1`}
          >
            {isTimerActive ? (
              <svg width="28" height="28" fill="currentColor" className="animate-in scale-in duration-300"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            ) : (
              <svg width="28" height="28" fill="currentColor" className="ml-1 animate-in scale-in duration-300"><path d="M5 3l14 9-14 9V3z" /></svg>
            )}
          </button>

          <button 
            disabled={isTimerActive}
            onClick={onToggleMode} 
            className={`w-14 h-14 flex items-center justify-center rounded-3xl border transition-all duration-500 shadow-sm active:scale-90 ${
              isStopwatchMode 
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                : 'bg-[var(--accent-subtle)] border-[var(--accent-color)]/40 text-[var(--accent-color)]'
            } ${isTimerActive ? 'opacity-0 pointer-events-none translate-x-4' : 'opacity-100 hover:shadow-lg hover:-translate-y-0.5'}`}
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

        <div className="z-10 text-center max-w-[280px] h-10 flex items-center justify-center mb-10 overflow-hidden">
          <p key={quoteIndex} className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed animate-in fade-in slide-in-from-bottom-3 duration-1000" style={{ color: isTimerActive ? 'var(--accent-color)' : 'rgb(148, 163, 184)' }}>
            {isTimerActive ? currentQuote : t.stayPresent}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Focus;