import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed === b.completed) return b.createdAt - a.createdAt;
      return a.completed ? 1 : -1;
    });
  }, [tasks]);

  const handleStartEdit = (task: Task) => {
    setEditingId(task.id);
    setEditingText(task.text);
  };

  const handleSaveEdit = () => {
    if (editingId && editingText.trim()) {
      onUpdateTask(editingId, editingText.trim());
      setEditingId(null);
      setEditingText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative w-full overflow-hidden">
      {/* Optimized Header Space */}
      <header className="px-10 pt-6 pb-4 shrink-0">
        <motion.h2 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-0.5"
        >
          Checklist
        </motion.h2>
        <p className="text-slate-400 text-[10px] font-black opacity-80 uppercase tracking-[0.2em]">Objective Tracker</p>
      </header>

      <section className="flex-1 bg-white dark:bg-slate-900 rounded-t-[36px] border-t border-slate-100 dark:border-slate-800 px-8 pt-8 overflow-y-auto no-scrollbar">
        <div className="flex space-x-2.5 mb-8">
          <input 
            type="text" value={newTaskText} onChange={(e)=>setNewTaskText(e.target.value)} placeholder="Define objective..."
            className="flex-1 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-[24px] px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-[var(--accent-color)] transition-all"
            onKeyDown={(e) => { if(e.key === 'Enter' && newTaskText.trim()) { onAddTask(newTaskText); setNewTaskText(''); }}}
          />
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => { if(newTaskText.trim()) { onAddTask(newTaskText); setNewTaskText(''); }}}
            className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 w-14 h-14 rounded-[24px] flex items-center justify-center shrink-0 shadow-md"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </motion.button>
        </div>

        <motion.div layout className="space-y-3 pb-32">
          <AnimatePresence mode="popLayout">
            {sortedTasks.map((task) => (
              <motion.div 
                key={task.id} 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`flex items-center p-5 rounded-[28px] border transition-all ${activeTaskId === task.id ? 'bg-[var(--accent-subtle)] border-[var(--accent-color)]/20 shadow-sm' : 'bg-slate-50/30 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/60'}`}
              >
                <motion.button 
                  whileTap={{ scale: 1.2 }}
                  onClick={()=>onToggleTask(task.id)} 
                  className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                >
                  {task.completed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5"><polyline points="20 6 9 17 4 12"/></svg>}
                </motion.button>
                
                {editingId === task.id ? (
                  <div className="flex-1 flex px-4">
                    <input 
                      autoFocus
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                      className="w-full bg-white dark:bg-slate-800 border-b border-[var(--accent-color)] text-sm font-black outline-none py-1"
                    />
                  </div>
                ) : (
                  <button 
                    onClick={() => !isTimerActive && onSetActiveTask(task.id === activeTaskId ? null : task.id)}
                    className={`flex-1 text-left px-4 text-sm font-black truncate tracking-tight transition-all ${task.completed ? 'text-slate-300 dark:text-slate-600 line-through' : activeTaskId === task.id ? 'text-[var(--accent-color)]' : 'text-slate-700 dark:text-slate-200'}`}
                  >
                    {task.text}
                  </button>
                )}

                <div className="flex space-x-1">
                  {!task.completed && (
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleStartEdit(task)}
                      className="text-slate-300 dark:text-slate-700 p-2 rounded-xl transition-colors hover:text-[var(--accent-color)]"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </motion.button>
                  )}
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={()=>onDeleteTask(task.id)} 
                    className="text-slate-300 dark:text-slate-700 p-2 rounded-xl transition-colors hover:text-red-500"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
    </div>
  );
};

export default Tasks;