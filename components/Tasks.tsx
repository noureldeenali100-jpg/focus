import React, { useState, useMemo } from 'react';
import { Task } from '../types';

interface TasksProps {
  tasks: Task[];
  activeTaskId: string | null;
  isTimerActive: boolean;
  onAddTask: (text: string) => void;
  onUpdateTask: (id: string, text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSetActiveTask: (id: string | null) => void;
}

const Tasks: React.FC<TasksProps> = ({ 
  tasks, activeTaskId, isTimerActive,
  onAddTask, onUpdateTask, onToggleTask, onDeleteTask, onSetActiveTask
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);

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

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditValue(task.text);
  };

  const saveEdit = () => {
    if (editingTaskId && editValue.trim()) {
      onUpdateTask(editingTaskId, editValue);
      setEditingTaskId(null);
    }
  };

  const detailTask = useMemo(() => tasks.find(t => t.id === detailTaskId), [tasks, detailTaskId]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative w-full">
      <header className="px-8 pt-10 pb-8 shrink-0 animate-in fade-in slide-in-from-top duration-300 max-w-4xl mx-auto w-full">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">My Tasks</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium animate-in fade-in">Stay organized and productive.</p>
      </header>

      <section className="flex-1 bg-white dark:bg-slate-900 rounded-t-[48px] shadow-2xl px-8 pt-10 overflow-y-auto no-scrollbar z-20 animate-in slide-in-from-bottom duration-400 w-full">
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-8 animate-in fade-in">
            <h3 className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center leading-none">Pending Action</h3>
            <span className="inline-flex items-center justify-center text-[10px] md:text-xs font-black text-[var(--accent-color)] uppercase tracking-widest bg-[var(--accent-subtle)] px-4 py-1.5 rounded-xl transition-all duration-300 leading-none">
              {tasks.filter(t=>!t.completed).length} Objectives
            </span>
          </div>

          <div className="flex space-x-3 mb-10 group animate-in fade-in">
            <input 
              type="text" value={newTaskText} onChange={(e)=>setNewTaskText(e.target.value)} placeholder="Add a new task..."
              className="flex-1 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-base font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              onKeyDown={(e) => { if(e.key === 'Enter') handleAdd(); }}
            />
            <button 
              onClick={handleAdd}
              className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center active:scale-75 shadow-md transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pb-32">
            {sortedTasks.map((task, index) => (
              <div 
                key={task.id} 
                className={`flex flex-col p-4 px-6 rounded-[28px] border transition-all duration-300 animate-in fade-in slide-in-from-right ${activeTaskId === task.id ? 'bg-[var(--accent-color)]/5 border-[var(--accent-color)]/30 ring-2 ring-[var(--accent-color)]/5' : 'bg-slate-50/50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}
                style={{ animationDelay: `${index * 25}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 overflow-hidden">
                    <button 
                      onClick={()=>onToggleTask(task.id)} 
                      className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 active:scale-50 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                    >
                      {task.completed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="animate-in zoom-in duration-300"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                    
                    {editingTaskId === task.id ? (
                      <input 
                        autoFocus
                        className="flex-1 bg-transparent border-b border-[var(--accent-color)] py-1 text-base font-bold text-slate-800 dark:text-slate-100 outline-none leading-none"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      />
                    ) : (
                      <button 
                        onClick={() => {
                          if (!isTimerActive) {
                            onSetActiveTask(task.id === activeTaskId ? null : task.id);
                          } else {
                            setDetailTaskId(task.id);
                          }
                        }} 
                        onDoubleClick={() => setDetailTaskId(task.id)}
                        className={`flex-1 text-left text-base font-bold truncate transition-all duration-300 flex items-center h-full ${task.completed ? 'text-slate-300 dark:text-slate-600 line-through' : activeTaskId === task.id ? 'text-[var(--accent-color)]' : 'text-slate-700 dark:text-slate-200'} active:opacity-60 leading-tight`}
                        disabled={task.completed}
                      >
                        {task.text}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => startEditing(task)}
                      className="text-slate-300 dark:text-slate-600 hover:text-[var(--accent-color)] p-2 active:scale-75 transition-all flex items-center justify-center"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button 
                      onClick={()=>onDeleteTask(task.id)} 
                      className="text-slate-200 dark:text-slate-500 hover:text-red-500 p-2 active:scale-75 transition-all flex items-center justify-center"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end mt-2">
                  <span className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.15em] flex items-center leading-none">
                    {new Date(task.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 opacity-20">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <p className="text-sm font-black uppercase tracking-widest text-slate-400">Clear mind, clear tasks</p>
            </div>
          )}
        </div>
      </section>

      {/* Task Detail View Overlay */}
      {detailTask && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center animate-in fade-in duration-300 px-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-[48px] md:rounded-[48px] p-10 pb-16 animate-in slide-in-from-bottom duration-400 shadow-2xl overflow-hidden">
            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-10 md:hidden" />
            
            <header className="mb-10 text-center md:text-left">
              <span className={`inline-flex items-center justify-center text-[10px] md:text-xs font-black uppercase tracking-[0.2em] px-4 py-2 rounded-2xl mb-6 leading-none ${detailTask.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                {detailTask.completed ? 'Achieved' : 'Pending Objective'}
              </span>
              <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">{detailTask.text}</h3>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="flex items-center space-x-5 p-6 bg-slate-50 dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700">
                <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-2">Established At</p>
                  <p className="text-sm md:text-base font-extrabold text-slate-700 dark:text-slate-200">
                    {new Date(detailTask.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {detailTask.completedAt && (
                <div className="flex items-center space-x-5 p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-[32px] border border-emerald-100 dark:border-emerald-800/50">
                  <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 dark:text-emerald-500 uppercase tracking-widest leading-none mb-2">Finalized At</p>
                    <p className="text-sm md:text-base font-extrabold text-slate-700 dark:text-slate-200">
                      {new Date(detailTask.completedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setDetailTaskId(null)}
              className="w-full py-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[28px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl flex items-center justify-center"
            >
              Return to List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;