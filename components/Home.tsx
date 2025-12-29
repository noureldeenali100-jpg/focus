import React, { useState, useMemo } from 'react';
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
}

const Home: React.FC<HomeProps> = ({ 
  userName, tasks, activeTaskId, isActivated,
  timerSeconds, totalSeconds, isTimerActive, onToggleTimer, onResetTimer, onSetTimerSeconds,
  onAddTask, onToggleTask, onDeleteTask, onSetActiveTask,
  onNavigate
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [showDurations, setShowDurations] = useState(false);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed === b.completed) return b.createdAt - a.createdAt;
      return a.completed ? 1 : -1;
    });
  }, [tasks]);

  const activeTask = useMemo(() => 
    tasks.find(t => t.id === activeTaskId), 
  [tasks, activeTaskId]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  const size = 180; 
  const strokeWidth = 6;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? (timerSeconds / totalSeconds) : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      <section className="px-6 pt-10 pb-10 flex flex-col items-center relative shrink-0">
        <div className="w-full flex items-center justify-between mb-10 z-10 px-4 max-w-lg mx-auto">
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70">Focus Status</h4>
            <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mt-1.5">Welcome, {userName || 'Guardian'}</p>
          </div>
        </div>
        
        <div className="relative flex items-center justify-center mb-10 z-10" style={{ width: size, height: size }}>
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox={`0 0 ${size} ${size}`}>
            <circle cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth={strokeWidth - 2} fill="transparent" className="text-slate-200/50 dark:text-slate-800/20" />
            <circle
              cx={center} cy={center} r={radius}
              stroke="var(--accent-color)" strokeWidth={strokeWidth}
              fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset}
              strokeLinecap="round" className="transition-all duration-300 ease-linear"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none">
            <div className={`text-4xl font-black tracking-tight tabular-nums leading-none ${isTimerActive ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-800'}`}>
              {formatTime(timerSeconds)}
            </div>
            {activeTask && (
              <p className="mt-2.5 text-[8px] font-black uppercase text-[var(--accent-color)] tracking-widest truncate max-w-[130px] px-4">{activeTask.text}</p>
            )}
          </div>
        </div>

        <div className="flex flex-row items-center justify-center space-x-6 z-10 w-full mb-2 max-w-sm mx-auto">
          <div className="relative">
            <button 
              disabled={isTimerActive} 
              onClick={() => setShowDurations(!showDurations)} 
              className="w-12 h-12 flex items-center justify-center rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-500 disabled:opacity-20 transition-all active:scale-90 shadow-sm"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </button>
            {showDurations && (
              <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] p-2 flex flex-col min-w-[120px] z-50 shadow-2xl">
                {[15, 25, 45, 60].map(d => (
                  <button key={d} onClick={() => {onSetTimerSeconds(d*60); setShowDurations(false);}} className="py-2.5 px-4 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-left">
                    {d}m Focus
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={onToggleTimer}
            className={`w-16 h-16 rounded-[28px] flex items-center justify-center transition-all active:scale-90 shadow-lg ${isTimerActive ? 'bg-orange-500 text-white shadow-orange-500/20' : 'bg-[var(--accent-color)] text-white shadow-[var(--accent-color)]/20'}`}
          >
            {isTimerActive ? (
              <svg width="26" height="26" fill="currentColor"><rect x="6" y="4" width="5" height="16" rx="2"/><rect x="15" y="4" width="5" height="16" rx="2"/></svg>
            ) : (
              <svg width="26" height="26" fill="currentColor" className="ml-1.5"><path d="M5 3l16 11-16 11V3z" /></svg>
            )}
          </button>

          <button 
            onClick={onResetTimer} 
            className="w-12 h-12 flex items-center justify-center rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-500 hover:text-red-500 transition-all active:scale-90 shadow-sm"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
        </div>
      </section>

      <section className="flex-1 bg-white dark:bg-slate-900 rounded-t-[48px] border-t border-slate-100 dark:border-slate-800 px-8 pt-12 overflow-y-auto no-scrollbar z-20">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-8 px-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Active Goals</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-2xl">
              {tasks.filter(t=>!t.completed).length} Pending
            </span>
          </div>

          <div className="flex space-x-3 mb-10">
            <input 
              type="text" value={newTaskText} onChange={(e)=>setNewTaskText(e.target.value)} placeholder="Target objective..."
              className="flex-1 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 rounded-[24px] px-6 py-4.5 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-[var(--accent-color)] transition-all"
              onKeyDown={(e) => { if(e.key === 'Enter' && newTaskText.trim()) { onAddTask(newTaskText); setNewTaskText(''); }}}
            />
            <button 
              onClick={()=>{if(newTaskText.trim()){onAddTask(newTaskText); setNewTaskText('');}}}
              className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 w-14 h-14 rounded-[24px] flex items-center justify-center active:scale-95 shadow-md"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>

          <div className="space-y-4 pb-20">
            {sortedTasks.map((task) => (
              <div key={task.id} className={`flex items-center justify-between p-5 rounded-[28px] border transition-all ${activeTaskId === task.id ? 'bg-[var(--accent-subtle)] border-[var(--accent-color)]/20 shadow-sm' : 'bg-slate-50/20 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/50'}`}>
                <div className="flex items-center space-x-4 flex-1 overflow-hidden">
                  <button 
                    onClick={()=>onToggleTask(task.id)} 
                    className={`shrink-0 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                  >
                    {task.completed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                  <button 
                    onClick={() => !isTimerActive && onSetActiveTask(task.id === activeTaskId ? null : task.id)} 
                    className={`flex-1 text-left text-sm font-bold truncate transition-colors ${task.completed ? 'text-slate-300 dark:text-slate-600 line-through' : activeTaskId === task.id ? 'text-[var(--accent-color)]' : 'text-slate-700 dark:text-slate-200'}`}
                    disabled={task.completed}
                  >
                    {task.text}
                  </button>
                </div>
                <button onClick={()=>onDeleteTask(task.id)} className="text-slate-300 dark:text-slate-700 hover:text-red-500 p-2.5 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;