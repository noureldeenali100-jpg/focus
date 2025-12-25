import React, { useState, useEffect, useRef } from 'react';
import { Task, FocusSound } from '../types';
import { MOTIVATIONAL_QUOTES } from '../constants';

interface FocusProps {
  userName: string; profileImage: string | null; tasks: Task[]; activeTaskId: string | null;
  timerSeconds: number; totalSeconds: number; isTimerActive: boolean; focusSound: FocusSound;
  isFullScreen: boolean; onToggleFullScreen: (fs: boolean) => void;
  onToggleTimer: () => void; onToggleMode: () => void; onSetTimerSeconds: (s: number) => void; onSetFocusSound: (s: FocusSound) => void;
}

const Focus: React.FC<FocusProps> = ({ 
  userName, profileImage, tasks, activeTaskId,
  timerSeconds, totalSeconds, isTimerActive, focusSound,
  isFullScreen, onToggleFullScreen,
  onToggleTimer, onToggleMode, onSetTimerSeconds, onSetFocusSound
}) => {
  const [showDurations, setShowDurations] = useState(false);
  const [showSounds, setShowSounds] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    let interval: number | undefined;
    if (isTimerActive) {
      setQuoteIndex(Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
      interval = window.setInterval(() => { setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length); }, 20000); 
    } else { setQuoteIndex(0); }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const enterFullScreen = async () => {
    onToggleFullScreen(true);
    try { if (document.documentElement.requestFullscreen) { await document.documentElement.requestFullscreen(); } } catch (e) {}
  };

  const exitFullScreen = async () => {
    if (document.fullscreenElement) { try { await document.exitFullscreen(); } catch (e) {} }
    onToggleFullScreen(false);
  };

  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) onToggleFullScreen(false);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [onToggleFullScreen]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60); const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  const t = { deepSession: "Focus Timer", stayPresent: "Stay focused", minFocus: "Minutes", stopwatch: "Stopwatch", fullScreen: "Full Screen Mode", exit: "Tap to close", sounds: "Ambient Sounds", mute: "Mute", rain: "Rain", clock: "Ticking", library: "Library" };

  const size = 220; const strokeWidth = 8; const radius = (size - strokeWidth * 2) / 2; const center = size / 2;
  const circumference = 2 * Math.PI * radius; const progress = totalSeconds > 0 ? (timerSeconds / totalSeconds) : 0;
  const offset = circumference * (1 - progress);
  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex]; const isStopwatchMode = totalSeconds === 0;

  const soundOptions: {id: FocusSound, label: string}[] = [
    { id: 'none', label: t.mute }, { id: 'rain', label: t.rain }, { id: 'clock', label: t.clock }, { id: 'library', label: t.library }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors">
      {isFullScreen && (
        <div onClick={exitFullScreen} className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center cursor-pointer transform-gpu animate-in fade-in duration-500">
          <div className="text-8xl font-black tracking-tighter tabular-nums text-white mb-8 transition-transform transform-gpu">{formatTime(timerSeconds)}</div>
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] opacity-60">{t.exit}</p>
        </div>
      )}

      <section className={`flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden transition-all duration-500 ${isFullScreen ? 'opacity-0' : 'opacity-100'}`}>
        <div className="absolute top-5 start-5 z-50">
          <button onClick={() => setShowSounds(!showSounds)} className={`p-2 rounded-2xl bg-white/20 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-700 backdrop-blur-sm active:scale-90 transition-all shadow-sm ${focusSound !== 'none' ? 'text-[var(--accent-color)] border-[var(--accent-color)]/20' : 'text-slate-400 dark:text-slate-400'}`}>
            {focusSound === 'none' ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>}
          </button>
          {showSounds && (
            <div className="absolute top-full mt-3 start-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-2.5 flex flex-col min-w-[140px] z-50 animate-in zoom-in-95">
              {soundOptions.map((opt) => (
                <button key={opt.id} onClick={() => {onSetFocusSound(opt.id); setShowSounds(false);}} className={`py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl text-start transition-all active:scale-95 ${focusSound === opt.id ? 'bg-[var(--accent-subtle)] text-[var(--accent-color)]' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={enterFullScreen} className="absolute top-5 end-5 z-50 p-2 rounded-2xl bg-white/20 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-700 text-slate-400 dark:text-slate-400 backdrop-blur-sm active:scale-90">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>
        </button>

        <div className="text-center mb-12 z-10 flex flex-col items-center">
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{isStopwatchMode ? t.stopwatch : t.deepSession}</h4>
          <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{userName || 'Guardian'}</p>
        </div>
        
        <div className="relative flex items-center justify-center mb-12 z-10 transform-gpu" style={{ width: size, height: size }}>
          <svg className="absolute w-full h-full -rotate-90 transform-gpu" viewBox={`0 0 ${size} ${size}`}>
            <circle cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth={strokeWidth - 1} fill="transparent" className="text-slate-200 dark:text-slate-800/80" />
            <circle cx={center} cy={center} r={radius} stroke="var(--accent-color)" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-[stroke-dashoffset] duration-1000 ease-linear" />
          </svg>
          <div className="flex flex-col items-center justify-center text-center z-20 pointer-events-none">
            <div className={`text-6xl font-black tracking-tighter tabular-nums leading-none transform-gpu transition-colors ${isTimerActive ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-500'}`}>{formatTime(timerSeconds)}</div>
            {activeTaskId && tasks.find(tk => tk.id === activeTaskId) && (
              <p className="mt-5 text-[10px] font-black uppercase text-[var(--accent-color)] tracking-[0.15em] truncate max-w-[170px] px-4">{tasks.find(tk => tk.id === activeTaskId)?.text}</p>
            )}
          </div>
        </div>

        <div className="flex flex-row items-center justify-center gap-8 z-10 w-full mb-10">
          <div className="relative">
            <button disabled={isTimerActive} onClick={() => setShowDurations(!showDurations)} className={`w-14 h-14 flex items-center justify-center rounded-3xl border transition-all active:scale-90 ${isStopwatchMode ? 'bg-[var(--accent-subtle)] border-[var(--accent-color)]/40 text-[var(--accent-color)]' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-400'} ${isTimerActive ? 'opacity-0 pointer-events-none' : 'opacity-100 shadow-sm'}`}>
              {isStopwatchMode ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2h4"/><path d="M12 14v-4"/><path d="M4 13a8 8 0 1 0 16 0 8 8 0 1 0-16 0z"/><path d="M12 2v2"/></svg> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
            </button>
            {showDurations && (
              <div className="absolute bottom-full mb-4 start-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-2.5 flex flex-col min-w-[160px] z-50 animate-in zoom-in-95">
                {[15, 25, 45, 60].map((d) => (
                  <button key={d} onClick={() => {onSetTimerSeconds(d*60); setShowDurations(false);}} className={`py-3.5 px-4 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:bg-[var(--accent-subtle)] hover:text-[var(--accent-color)] rounded-xl text-start transition-all active:scale-95`}> {d} {t.minFocus} </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={onToggleTimer} className={`w-20 h-20 rounded-[36px] flex items-center justify-center transition-all shadow-2xl active:scale-75 ${isTimerActive ? 'bg-orange-500 text-white' : 'bg-[var(--accent-color)] text-white'}`}>
            {isTimerActive ? <svg width="28" height="28" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg> : <svg width="28" height="28" fill="currentColor" className="ml-1"><path d="M5 3l14 9-14 9V3z" /></svg>}
          </button>
          <button disabled={isTimerActive} onClick={onToggleMode} className={`w-14 h-14 flex items-center justify-center rounded-3xl border transition-all active:scale-90 ${isStopwatchMode ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-400' : 'bg-[var(--accent-subtle)] border-[var(--accent-color)]/40 text-[var(--accent-color)]'} ${isTimerActive ? 'opacity-0 pointer-events-none' : 'opacity-100 shadow-sm'}`}>
            {isStopwatchMode ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2h4"/><path d="M12 14v-4"/><path d="M4 13a8 8 0 1 0 16 0 8 8 0 1 0-16 0z"/><path d="M12 2v2"/></svg>}
          </button>
        </div>

        <div className="z-10 text-center max-w-[280px] h-10 flex items-center justify-center mb-10">
          <p key={quoteIndex} className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed transition-colors transform-gpu" style={{ color: isTimerActive ? 'var(--accent-color)' : 'rgb(148, 163, 184)' }}> {isTimerActive ? currentQuote : t.stayPresent} </p>
        </div>
      </section>
    </div>
  );
};

export default Focus;