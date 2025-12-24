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

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <header className="px-6 pt-10 pb-6 shrink-0">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">Today's Objectives</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Plan your path to productivity</p>
      </header>

      <section className="flex-1 bg-white dark:bg-slate-900 rounded-t-[32px] shadow-2xl px-6 pt-8 overflow-y-auto no-scrollbar z-20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active List</h3>
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
            {tasks.filter(t=>!t.completed).length} Pending
          </span>
        </div>

        <div className="flex space-x-2 mb-8">
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
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Nothing on your horizon</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Tasks;