import React, { useState, useMemo } from 'react';
import { Task } from '../types';

interface TasksProps {
  tasks: Task[];
  activeTaskId: string | null;
  isTimerActive: boolean;
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSetActiveTask: (id: string | null) => void;
}

const Tasks: React.FC<TasksProps> = ({ 
  tasks, activeTaskId, isTimerActive,
  onAddTask, onToggleTask, onDeleteTask, onSetActiveTask
}) => {
  const [newTaskText, setNewTaskText] = useState('');

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed === b.completed) return b.createdAt - a.createdAt;
      return a.completed ? 1 : -1;
    });
  }, [tasks]);

  const handleAdd = () => {
    if (newTaskText.trim()) {
      onAddTask(newTaskText);
      setNewTaskText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <header className="px-8 pt-10 pb-6 shrink-0 animate-in fade-in slide-in-from-top-6 duration-[1200ms] ease-in-out">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">My Tasks</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium animate-in fade-in stagger-1">Stay organized and productive.</p>
      </header>

      <section className="flex-1 bg-white dark:bg-slate-900 rounded-t-[40px] shadow-2xl px-8 pt-10 overflow-y-auto no-scrollbar z-20 animate-in slide-in-from-bottom-10 duration-[1200ms] ease-in-out">
        <div className="flex items-center justify-between mb-8 animate-in fade-in stagger-2">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Pending Action</h3>
          <span className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest bg-[var(--accent-subtle)] px-3 py-1.5 rounded-xl transition-all duration-[900ms] ease-in-out hover:scale-105">
            {tasks.filter(t=>!t.completed).length} Objectives
          </span>
        </div>

        <div className="flex space-x-3 mb-10 group animate-in fade-in stagger-3">
          <input 
            type="text" value={newTaskText} onChange={(e)=>setNewTaskText(e.target.value)} placeholder="Add a new task..."
            className="flex-1 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 transition-all duration-500 ease-in-out placeholder:text-slate-400 dark:placeholder:text-slate-500"
            onKeyDown={(e) => { if(e.key === 'Enter') handleAdd(); }}
          />
          <button 
            onClick={handleAdd}
            className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center active:scale-75 shadow-xl transition-all duration-[700ms] ease-in-out hover:brightness-110 hover:-translate-y-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>

        <div className="space-y-4 pb-16">
          {sortedTasks.map((task, index) => (
            <div 
              key={task.id} 
              className={`flex items-center justify-between p-5 rounded-3xl border transition-all duration-[900ms] ease-in-out animate-in fade-in slide-in-from-right-4 ${activeTaskId === task.id ? 'bg-[var(--accent-color)]/5 border-[var(--accent-color)]/30 ring-2 ring-[var(--accent-color)]/5 scale-[1.02]' : 'bg-slate-50/50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              style={{ animationDelay: `${(index + 4) * 120}ms` }}
            >
              <div className="flex items-center space-x-4 flex-1 overflow-hidden">
                <button 
                  onClick={()=>onToggleTask(task.id)} 
                  className={`shrink-0 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-[700ms] ease-in-out active:scale-50 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[var(--accent-color)]'}`}
                >
                  {task.completed && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="animate-in zoom-in duration-[700ms] ease-in-out"><polyline points="20 6 9 17 4 12"/></svg>}
                </button>
                <button 
                  onClick={() => {
                    if (!isTimerActive) {
                      onSetActiveTask(task.id === activeTaskId ? null : task.id);
                    }
                  }} 
                  className={`flex-1 text-left text-base font-bold truncate transition-all duration-[900ms] ease-in-out ${task.completed ? 'text-slate-300 dark:text-slate-600 line-through' : activeTaskId === task.id ? 'text-[var(--accent-color)]' : 'text-slate-700 dark:text-slate-200'} active:opacity-60`}
                  disabled={task.completed}
                >
                  {task.text}
                </button>
              </div>
              <button 
                onClick={()=>onDeleteTask(task.id)} 
                className="text-slate-200 dark:text-slate-500 hover:text-red-500 p-2.5 active:scale-50 transition-all duration-[900ms] ease-in-out hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 opacity-20 animate-subtle-fade animate-scale-in transform-gpu">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 animate-bounce-subtle transform-gpu"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7-7H4a2 2 0 0 0-2 2v17z"/><path d="M14 1v7h7"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Your path is clear</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Tasks;