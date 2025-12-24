import React, { useState, useMemo } from 'react';
import { Task } from '../types';

interface FocusProps {
  userName: string;
  tasks: Task[];
  activeTaskId: string | null;
  timerSeconds: number;
  totalSeconds: number;
  isTimerActive: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSetTimerSeconds: (s: number) => void;
}

const Focus: React.FC<FocusProps> = ({ 
  userName, tasks, activeTaskId,
  timerSeconds, totalSeconds, isTimerActive, onToggleTimer, onResetTimer, onSetTimerSeconds
}) => {
  const [showDurations, setShowDurations] = useState(false);

  const activeTask = useMemo(() => 
    tasks.find(t => t.id === activeTaskId), 
  [tasks, activeTaskId]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  const size = 220; 
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? (timerSeconds / totalSeconds) : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <section className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[var(--accent-color)]/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="text-center mb-12 z-10">
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-1">Deep Session</h4>
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
              className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-400 disabled:opacity-30 shadow-sm active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </button>
            {showDurations && (
              <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-2xl rounded-2xl p-2 flex flex-col min-w-[140px] z-50">
                {[15, 25, 45, 60].map(d => (
                  <button key={d} onClick={() => {onSetTimerSeconds(d*60); setShowDurations(false);}} className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-left">
                    {d} Min Focus
                  </button>
                ))}
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
            onClick={onResetTimer} 
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-400 hover:text-red-500 shadow-sm active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
        </div>

        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 z-10">Stay Present</p>
      </section>
    </div>
  );
};

export default Focus;