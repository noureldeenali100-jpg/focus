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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative w-full overflow-hidden">
      <header className="px-[clamp(1.5rem,5vw,3rem)] pt-[clamp(2rem,6vh,4rem)] pb-8 shrink-0 animate-in fade-in slide-in-from-top duration-300 w-full">
        <h2 className="text-[clamp(2rem,6vw,3.5rem)] font-black text-slate-900 dark:text-white tracking-tighter mb-2">My Checklist</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium">Protocol: Clear the queue.</p>
      </header>

      <section className="flex-1 bg-white dark:bg-slate-900 rounded-t-[48px] shadow-2xl px-[clamp(1.5rem,5vw,3rem)] pt-10 overflow-y-auto no-scrollbar z-20 animate-in slide-in-from-bottom duration-400 w-full">
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending Operations</h3>
            <span className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest bg-[var(--accent-subtle)] px-4 py-1.5 rounded-xl">
              {tasks.filter(t=>!t.completed).length} Pending
            </span>
          </div>

          <div className="flex space-x-3 mb-10">
            <input 
              type="text" value={newTaskText} onChange={(e)=>setNewTaskText(e.target.value)} placeholder="Define new objective..."
              className="flex-1 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-base font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-[var(--accent-color)] transition-all placeholder:text-slate-400"
              onKeyDown={(e) => { if(e.key === 'Enter') handleAdd(); }}
            />
            <button 
              onClick={handleAdd}
              className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center active:scale-75 shadow-md shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-32">
            {sortedTasks.map((task, index) => (
              <div 
                key={task.id} 
                className={`flex flex-col p-5 rounded-[28px] border transition-all duration-300 ${activeTaskId === task.id ? 'bg-[var(--accent-color)]/5 border-[var(--accent-color)]/30 ring-2 ring-[var(--accent-color)]/5' : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'}`}
                style={{ animationDelay: `${index * 25}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 overflow-hidden">
                    <button 
                      onClick={()=>onToggleTask(task.id)} 
                      className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                    >
                      {task.completed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                    
                    {editingTaskId === task.id ? (
                      <input 
                        autoFocus
                        className="flex-1 bg-transparent border-b border-[var(--accent-color)] py-1 text-base font-bold text-slate-800 dark:text-slate-100 outline-none"
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
                        className={`flex-1 text-left text-base font-bold truncate transition-all ${task.completed ? 'text-slate-300 dark:text-slate-600 line-through' : activeTaskId === task.id ? 'text-[var(--accent-color)]' : 'text-slate-700 dark:text-slate-200'}`}
                        disabled={task.completed}
                      >
                        {task.text}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button onClick={() => startEditing(task)} className="text-slate-300 dark:text-slate-600 hover:text-[var(--accent-color)] p-2 active:scale-75 transition-all">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={()=>onDeleteTask(task.id)} className="text-slate-200 dark:text-slate-500 hover:text-red-500 p-2 active:scale-75 transition-all">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detail Overlay */}
      {detailTask && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center animate-in fade-in duration-300 px-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-[40px] md:rounded-[40px] p-10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-400">
             <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-6 leading-tight">{detailTask.text}</h3>
             <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Created</p>
                   <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{new Date(detailTask.createdAt).toLocaleDateString()}</p>
                </div>
                {detailTask.completedAt && (
                   <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Achieved</p>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{new Date(detailTask.completedAt).toLocaleDateString()}</p>
                   </div>
                )}
             </div>
             <button onClick={() => setDetailTaskId(null)} className="w-full py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-3xl font-black uppercase tracking-widest active:scale-95 transition-all">Close Protocol</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;