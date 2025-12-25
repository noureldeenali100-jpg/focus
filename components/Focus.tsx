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

  // Immersive Fullscreen Logic
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsAppFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [setIsAppFullscreen]);

  const enterFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsAppFullscreen(true);
    } catch (err) {
      console.warn("Fullscreen API failed", err);
      setIsAppFullscreen(true); 
    }
  }, [setIsAppFullscreen]);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setIsAppFullscreen(false);
    } catch (err) {
      setIsAppFullscreen(false);
    }
  }, [setIsAppFullscreen]);

  const formatTimeParts = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    const mStr = m.toString();
    const sStr = rs < 10 ? `0${rs}` : rs.toString();
    return { m: mStr, s: sStr };
  };

  const t = { deepSession: "Focus Timer", stayPresent: "Stay focused", minFocus: "Minutes", stopwatch: "Stopwatch", sounds: "Ambient Sounds", mute: "Mute", rain: "Rain", clock: "Ticking", library: "Library", custom: "Custom...", exitHint: "Tap anywhere to exit full screen" };

  const size = "clamp(180px, 45vh, 260px)";
  const strokeWidth = 8;
  const currentSizePx = 220;
  const radius = (currentSizePx - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? (timerSeconds / totalSeconds) : 0;
  const offset = circumference * (1 - progress);
  
  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex]; const isStopwatchMode = totalSeconds === 0;

  const soundOptions: {id: FocusSound, label: string}[] = [
    { id: 'none', label: t.mute }, { id: 'rain', label: t.rain }, { id: 'clock', label: t.clock }, { id: 'library', label: t.library }
  ];

  const handleSetCustom = () => {
    const val = parseInt(customValue);
    if (!isNaN(val) && val > 0) {
      onSetTimerSeconds(val * 60);
      setShowDurations(false);
      setCustomValue('');
    }
  };

  // Improved Digit Rendering for Visual Stability
  const TimerDigits = ({ seconds, className }: { seconds: number, className: string }) => {
    const { m, s } = formatTimeParts(seconds);
    return (
      <div className={`${className} flex items-center justify-center tabular-nums`}>
        <div className="flex items-center justify-center">
          {m.split('').map((digit, i) => (
            <span key={`m-${i}`} className="inline-block transition-colors duration-[1200ms] ease-in-out w-[0.6em] text-center">{digit}</span>
          ))}
        </div>
        <span className="inline-block px-1">:</span>
        <div className="flex items-center justify-center">
          {s.split('').map((digit, i) => (
            <span key={`s-${i}`} className="inline-block transition-colors duration-[1200ms] ease-in-out w-[0.6em] text-center">{digit}</span>
          ))}
        </div>
      </div>
    );
  };

  const timerCircle = () => {
    return (
      <div 
        className={`relative flex items-center justify-center transform-gpu transition-all duration-[1200ms] ease-in-out cursor-pointer z-20`} 
        style={{ width: size, height: size }}
        onClick={enterFullscreen}
      >
        <svg className="absolute w-full h-full -rotate-90 transform-gpu" viewBox="0 0 220 220">
          <circle cx={110} cy={110} r={radius} stroke="currentColor" strokeWidth={strokeWidth - 1} fill="transparent" className="text-slate-200 dark:text-slate-800/80" />
          <circle cx={110} cy={110} r={radius} stroke="var(--accent-color)" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-[stroke-dashoffset] duration-[1200ms] ease-in-out" />
        </svg>
        <div className="flex flex-col items-center justify-center text-center z-20 pointer-events-none px-4">
          <TimerDigits 
            seconds={timerSeconds} 
            className={`text-[clamp(3rem,8vh,5rem)] font-black tracking-tighter leading-none transform-gpu transition-colors duration-[1200ms] ease-in-out ${isTimerActive ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-500'}`} 
          />
          {activeTaskId && tasks.find(tk => tk.id === activeTaskId) && (
            <p className="mt-[2vh] text-[clamp(8px,1.5vh,11px)] font-black uppercase text-[var(--accent-color)] tracking-[0.15em] truncate max-w-[80%] animate-subtle-fade">{tasks.find(tk => tk.id === activeTaskId)?.text}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-[1000ms] ease-in-out relative">
      <section className={`flex-1 flex flex-col items-center justify-center px-6 py-[4vh] relative overflow-hidden`}>
        {/* Top Controls Container */}
        <div className="absolute top-5 left-0 right-0 flex justify-between px-5 z-50">
          <button onClick={() => setShowSounds(!showSounds)} className={`p-2 rounded-2xl bg-white/20 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-700 backdrop-blur-sm active:scale-90 transition-all duration-[700ms] ease-in-out shadow-sm ${focusSound !== 'none' ? 'text-[var(--accent-color)] border-[var(--accent-color)]/20' : 'text-slate-400 dark:text-slate-400'}`}>
            {focusSound === 'none' ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>}
          </button>
          
          <button onClick={enterFullscreen} className="p-2 rounded-2xl bg-white/20 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-700 backdrop-blur-sm active:scale-90 transition-all duration-[700ms] ease-in-out shadow-sm text-slate-400 dark:text-slate-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>
          
          {showSounds && (
            <div className="absolute top-full mt-3 left-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-2.5 flex flex-col min-w-[140px] z-50 animate-zoom-in">
              {soundOptions.map((opt) => (
                <button key={opt.id} onClick={() => {onSetFocusSound(opt.id); setShowSounds(false);}} className={`py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl text-start transition-all duration-[700ms] ease-in-out active:scale-95 ${focusSound === opt.id ? 'bg-[var(--accent-subtle)] text-[var(--accent-color)]' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-center mb-[4vh] z-10 flex flex-col items-center animate-fade-in">
          <h4 className="text-[clamp(9px,1.2vh,11px)] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{isStopwatchMode ? t.stopwatch : t.deepSession}</h4>
          <p className="text-[clamp(1.1rem,2.5vh,1.5rem)] font-black text-slate-900 dark:text-white tracking-tight leading-none">{userName || 'Guardian'}</p>
        </div>
        
        <div className="mb-[5vh] flex items-center justify-center w-full">
          {timerCircle()}
        </div>

        <div className="flex flex-row items-center justify-center gap-[4vw] md:gap-8 z-10 w-full mb-[5vh]">
          <div className={`relative transition-all duration-[900ms] ease-in-out transform-gpu ${isTimerActive ? '-translate-x-[200px] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
            <button 
              disabled={isTimerActive} 
              onClick={() => setShowDurations(!showDurations)} 
              className={`w-[clamp(48px,12vw,60px)] h-[clamp(48px,12vw,60px)] flex items-center justify-center rounded-[35%] border transition-all duration-[700ms] ease-in-out active:scale-90 ${isStopwatchMode ? 'bg-[var(--accent-subtle)] border-[var(--accent-color)]/40 text-[var(--accent-color)]' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-400'} shadow-sm`}
            >
              {isStopwatchMode ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2h4"/><path d="M12 14v-4"/><path d="M4 13a8 8 0 1 0 16 0 8 8 0 1 0-16 0z"/><path d="M12 2v2"/></svg> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
            </button>
            {showDurations && (
              <div className="absolute bottom-full mb-4 start-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-3 flex flex-col min-w-[180px] z-50 animate-zoom-in">
                {[15, 25, 45, 60].map((d) => (
                  <button key={d} onClick={() => {onSetTimerSeconds(d*60); setShowDurations(false);}} className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:bg-[var(--accent-subtle)] hover:text-[var(--accent-color)] rounded-xl text-start transition-all duration-[700ms] ease-in-out active:scale-95`}> {d} {t.minFocus} </button>
                ))}
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2 px-1">
                    <input 
                      type="number"
                      placeholder="Min"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSetCustom()}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-black text-slate-800 dark:text-white outline-none focus:border-[var(--accent-color)]"
                    />
                    <button 
                      onClick={handleSetCustom}
                      className="shrink-0 w-9 h-9 bg-[var(--accent-color)] text-white rounded-xl flex items-center justify-center active:scale-90 transition-transform duration-500 ease-in-out"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button onClick={onToggleTimer} className={`w-[clamp(70px,18vw,85px)] h-[clamp(70px,18vw,85px)] rounded-[38%] flex items-center justify-center transition-all duration-[900ms] ease-in-out shadow-2xl active:scale-90 hover:brightness-110 z-30 ${isTimerActive ? 'bg-orange-500 text-white' : 'bg-[var(--accent-color)] text-white'}`}>
            {isTimerActive ? <svg width="28" height="28" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg> : <svg width="28" height="28" fill="currentColor" className="ml-1"><path d="M5 3l14 9-14 9V3z" /></svg>}
          </button>
          
          <div className={`transition-all duration-[900ms] ease-in-out transform-gpu ${isTimerActive ? 'translate-x-[200px] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
            <button disabled={isTimerActive} onClick={onToggleMode} className={`w-[clamp(48px,12vw,60px)] h-[clamp(48px,12vw,60px)] flex items-center justify-center rounded-[35%] border transition-all duration-[700ms] ease-in-out active:scale-90 ${isStopwatchMode ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-400' : 'bg-[var(--accent-subtle)] border-[var(--accent-color)]/40 text-[var(--accent-color)]'} shadow-sm`}>
              {isStopwatchMode ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2h4"/><path d="M12 14v-4"/><path d="M4 13a8 8 0 1 0 16 0 8 8 0 1 0-16 0z"/><path d="M12 2v2"/></svg>}
            </button>
          </div>
        </div>

        <div className="z-10 text-center max-w-[320px] h-[6vh] flex items-center justify-center mb-4 transition-all duration-[1500ms] ease-in-out">
          <p key={quoteIndex} className="text-[clamp(10px,1.4vh,12px)] font-black uppercase tracking-[0.2em] leading-relaxed transition-all duration-[1500ms] ease-in-out transform-gpu px-4" style={{ color: isTimerActive ? 'var(--accent-color)' : 'rgb(148, 163, 184)', opacity: isTimerActive ? 1 : 0.6 }}> {isTimerActive ? currentQuote : t.stayPresent} </p>
        </div>
      </section>

      {/* Full Screen Overlay - Immersive edge-to-edge minimalist with tap-to-exit */}
      {isAppFullscreen && (
        <div 
          onClick={exitFullscreen}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-500 overflow-hidden cursor-pointer"
        >
          {/* Centered Timer Digits */}
          <TimerDigits 
            seconds={timerSeconds} 
            className="text-[min(120px,25vw)] font-black text-white tracking-tighter leading-none animate-in fade-in duration-700"
          />
          
          {/* Subtle Instruction Text */}
          <p className="absolute bottom-12 left-0 right-0 text-center text-white/25 text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in duration-500 delay-300">
            {t.exitHint}
          </p>
        </div>
      )}
    </div>
  );
};

export default Focus;