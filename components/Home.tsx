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

  // Logical Separation: Intelligent task sorting for planning efficiency
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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <section className="px-6 pt-6 pb-6 flex flex-col items-center relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--accent-color)]/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="w-full flex items-center justify-between mb-8 z-10">
          <div>
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">Digital Shield</h4>
            <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none mt-1">Hello, {userName || 'Guardian'}</p>
          </div>
        </div>
        
        <div className="relative flex items-center justify-center mb-6 z-10" style={{ width: size, height: size }}>
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
            <div className={`text-5xl font-mono font-black tracking-tighter tabular-nums leading-none ${isTimerActive ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-500'}`}>
              {formatTime(timerSeconds)}
            </div>
            {/* Context-aware display: Shows active task if selected, otherwise focused on the session itself */}
            {activeTask && (
              <p className="mt-3 text-[9px] font-black uppercase text-[var(--accent-color)] tracking-widest truncate max-w-[140px] px-4">{activeTask.text}</p>
            )}
          </div>
        </div>

        <div className="flex flex-row items-center justify-center space-x-6 z-10 w-full mb-2">
          <div className="relative">
            <button 
              disabled={isTimerActive} 
              onClick={() => setShowDurations(!showDurations)} 
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-400 disabled:opacity-30 shadow-sm active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </button>
            {showDurations && (
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl rounded-2xl p-2 flex flex-col min-w-[120px] z-50">
                {[15, 25, 45, 60].map(d => (
                  <button key={d} onClick={() => {onSetTimerSeconds(d*60); setShowDurations(false);}} className="py-2.5 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-left">
                    {d} Min Focus
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={onToggleTimer}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90 ${isTimerActive ? 'bg-orange-500 text-white' : 'bg-[var(--accent-color)] text-white'}`}
          >
            {isTimerActive ? (
              <svg width="24" height="24" fill="currentColor"><rect x="5" y="4" width="4" height="16" rx="1"/><rect x="15" y="4" width="4" height="16" rx="1"/></svg>
            ) : (
              <svg width="24" height="24" fill="currentColor" className="ml-1"><path d="M5 3l14 9-14 9V3z" /></svg>
            )}
          </button>

          <button 
            onClick={onResetTimer} 
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-400 hover:text-red-500 shadow-sm active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
        </div>
      </section>

      <section className="flex-1 bg-white dark:bg-slate-900 rounded-t-[32px] shadow-2xl px-6 pt-8 overflow-y-auto no-scrollbar z-20">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Today's Goals</h3>
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
            {tasks.filter(t=>!t.completed).length} Pending
          </span>
        </div>

        <div className="flex space-x-2 mb-6">
          <input 
            type="text" value={newTaskText} onChange={(e)=>setNewTaskText(e.target.value)} placeholder="Envision a new objective..."
            className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            onKeyDown={(e) => { if(e.key === 'Enter' && newTaskText.trim()) { onAddTask(newTaskText); setNewTaskText(''); }}}
          />
          <button 
            onClick={()=>{if(newTaskText.trim()){onAddTask(newTaskText); setNewTaskText('');}}}
            className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 w-12 h-12 rounded-xl flex items-center justify-center active:scale-95 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>

        <div className="space-y-3 pb-12">
          {sortedTasks.map((task) => (
            <div key={task.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${activeTaskId === task.id ? 'bg-[var(--accent-color)]/5 border-[var(--accent-color)]/20' : 'bg-slate-50/30 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'}`}>
              <div className="flex items-center space-x-3 flex-1 overflow-hidden">
                <button 
                  onClick={()=>onToggleTask(task.id)} 
                  className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all active:scale-90 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                >
                  {task.completed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </button>
                {/* Execution Phase Locking: Focus target cannot be switched while the timer is running, enforcing commitment */}
                <button 
                  onClick={() => {
                    if (!isTimerActive) {
                      onSetActiveTask(task.id === activeTaskId ? null : task.id);
                    }
                  }} 
                  className={`flex-1 text-left text-sm font-bold truncate transition-colors ${task.completed ? 'text-slate-300 dark:text-slate-500 line-through' : activeTaskId === task.id ? 'text-[var(--accent-color)]' : 'text-slate-700 dark:text-slate-200'}`}
                  disabled={task.completed}
                >
                  {task.text}
                </button>
              </div>
              <button onClick={()=>onDeleteTask(task.id)} className="text-slate-200 dark:text-slate-700 hover:text-red-500 p-2 active:scale-90 transition-transform">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 opacity-30">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Silence is Productive</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;