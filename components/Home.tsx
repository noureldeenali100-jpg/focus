
import React, { useState } from 'react';
import { Task, Screen } from '../types';

interface HomeProps {
  userName: string;
  tasks: Task[];
  activeTaskId: string | null;
  isActivated: boolean;
  timerSeconds: number;
  totalSeconds: number;
  isTimerActive: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSetTimerSeconds: (s: number) => void;
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSetActiveTask: (id: string | null) => void;
  onNavigate: (screen: Screen) => void;
  onNavigateSimulator: () => void;
}

const Home: React.FC<HomeProps> = ({ 
  userName, tasks, activeTaskId, isActivated,
  timerSeconds, totalSeconds, isTimerActive, onToggleTimer, onResetTimer, onSetTimerSeconds,
  onAddTask, onToggleTask, onDeleteTask, onSetActiveTask,
  onNavigate, onNavigateSimulator
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [showDurations, setShowDurations] = useState(false);

  const activeTask = tasks.find(t => t.id === activeTaskId);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  // Resized Timer - Optimizing for balanced vertical hierarchy
  const size = 220; 
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? (timerSeconds / totalSeconds) : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 selection:bg-[var(--accent-color)] selection:text-white transition-colors duration-500">
      <section className="px-6 pt-8 pb-8 flex flex-col items-center relative overflow-hidden shrink-0">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--accent-color)]/5 dark:bg-[var(--accent-color)]/10 blur-[100px] rounded-full pointer-events-none" />

        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-8 z-10">
          Shield for {userName || 'Guardian'}
        </h4>
        
        {/* Compact Centered Timer Ring */}
        <div className="relative flex items-center justify-center mb-8 z-10" style={{ width: size, height: size }}>
          <svg className="absolute w-full h-full -rotate-90 transition-transform duration-300" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth - 2}
              fill="transparent"
              className="text-slate-200/50 dark:text-slate-800/40"
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
            <div className={`text-[56px] font-mono font-black tracking-[-0.05em] tabular-nums transition-all duration-500 leading-none ${isTimerActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>
              {formatTime(timerSeconds)}
            </div>
            {activeTask && (
              <div className="mt-2 px-3 py-1 bg-[var(--accent-color)]/5 dark:bg-[var(--accent-color)]/10 rounded-full border border-[var(--accent-color)]/10">
                <p className="text-[8px] font-black uppercase text-[var(--accent-color)] tracking-widest truncate max-w-[140px]">{activeTask.text}</p>
              </div>
            )}
          </div>
        </div>

        {/* Compact Controls Aligned on Vertical Axis */}
        <div className="flex flex-row items-center justify-center space-x-10 z-10 w-full">
          <div className="relative">
            <button 
              disabled={isTimerActive} 
              onClick={() => setShowDurations(!showDurations)} 
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:text-[var(--accent-color)] disabled:opacity-20 transition-all shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </button>
            {showDurations && (
              <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-[24px] p-2 flex flex-col space-y-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300 min-w-[120px]">
                {[15, 25, 45, 60].map(d => (
                  <button 
                    key={d} 
                    onClick={() => {onSetTimerSeconds(d*60); setShowDurations(false);}} 
                    className="py-3 px-4 hover:bg-[var(--accent-color)]/5 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl transition-all"
                  >
                    {d} Minutes
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={onToggleTimer}
            className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-300 shadow-xl active:scale-90 hover:brightness-110 ${isTimerActive ? 'bg-orange-500 text-white shadow-orange-500/20 ring-4 ring-orange-500/5' : 'bg-[var(--accent-color)] text-white shadow-[var(--accent-color)]/20 ring-4 ring-[var(--accent-color)]/5'}`}
          >
            {isTimerActive ? (
              <svg width="20" height="20" fill="currentColor"><rect x="5" y="4" width="4" height="16" rx="1.5"/><rect x="15" y="4" width="4" height="16" rx="1.5"/></svg>
            ) : (
              <svg width="20" height="20" fill="currentColor" className="ml-1"><path d="M5 3l14 9-14 9V3z" /></svg>
            )}
          </button>

          <button 
            onClick={onResetTimer} 
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:text-red-500 transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
        </div>
      </section>

      {/* Primary Working Area: Task Dashboard */}
      <section className="flex-1 bg-white dark:bg-slate-900 rounded-t-[48px] shadow-[0_-12px_40px_-10px_rgba(0,0,0,0.08)] px-8 pt-10 overflow-y-auto no-scrollbar z-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Focus Journal</h3>
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Today's Objectives</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
             <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{tasks.filter(t=>!t.completed).length} Pending</span>
          </div>
        </div>

        <div className="flex space-x-2 mb-8">
          <input 
            type="text" value={newTaskText} onChange={(e)=>setNewTaskText(e.target.value)} placeholder="Envision your next goal..."
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-4 focus:ring-[var(--accent-color)]/5 transition-all placeholder:text-slate-400/60"
            onKeyDown={(e) => { if(e.key === 'Enter' && newTaskText.trim()) { onAddTask(newTaskText); setNewTaskText(''); }}}
          />
          <button 
            onClick={()=>{if(newTaskText.trim()){onAddTask(newTaskText); setNewTaskText('');}}}
            className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 w-12 h-12 rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>

        <div className="space-y-3 pb-8">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={`flex items-center justify-between p-4 rounded-[24px] border transition-all duration-300 ${activeTaskId === task.id ? 'bg-[var(--accent-color)]/5 border-[var(--accent-color)]/20' : 'bg-white dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/50'}`}
            >
              <div className="flex items-center space-x-3 flex-1">
                <button 
                  onClick={()=>onToggleTask(task.id)} 
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                >
                  {task.completed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </button>
                <button 
                  onClick={()=>onSetActiveTask(task.id === activeTaskId ? null : task.id)} 
                  className={`flex-1 text-left text-xs font-bold tracking-tight transition-colors ${task.completed ? 'text-slate-300 dark:text-slate-700 line-through' : activeTaskId === task.id ? 'text-[var(--accent-color)]' : 'text-slate-700 dark:text-slate-200'}`}
                >
                  {task.text}
                </button>
              </div>
              <button 
                onClick={()=>onDeleteTask(task.id)} 
                className="text-slate-200 dark:text-slate-800 hover:text-red-500 transition-colors p-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          ))}
          {tasks.length > 0 && tasks.some(t => t.completed) && (
            <p className="text-[9px] text-center font-black uppercase tracking-[0.1em] text-slate-300 dark:text-slate-700 mt-4 py-4 border-t border-slate-50 dark:border-slate-800/50">
              Completed tasks are removed after 7 days
            </p>
          )}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 opacity-30">
              <div className="w-12 h-12 rounded-[18px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
              </div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Clear Space · Clear Mind</p>
            </div>
          )}
        </div>
      </section>

      {/* Simulator Link */}
      <button 
        onClick={onNavigateSimulator} 
        className="fixed right-6 bottom-[110px] w-12 h-12 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl flex items-center justify-center shadow-2xl active:scale-95 transition-all z-50 border-2 border-white dark:border-slate-950"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
      </button>
    </div>
  );
};

export default Home;
