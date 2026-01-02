import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types.ts';

interface TasksProps {
  tasks: Task[];
  activeTaskId: string | null;
  isTimerActive: boolean;
  isAnimationsEnabled: boolean;
  onAddTask: (text: string, description?: string) => void;
  onUpdateTask: (id: string, text: string, description?: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSetActiveTask: (id: string | null) => void;
}

const Tasks: React.FC<TasksProps> = ({ 
  tasks, activeTaskId, isTimerActive, isAnimationsEnabled,
  onAddTask, onUpdateTask, onToggleTask, onDeleteTask, onSetActiveTask
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingDesc, setEditingDesc] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed === b.completed) return b.createdAt - a.createdAt;
      return a.completed ? 1 : -1;
    });
  }, [tasks]);

  const handleStartEdit = (task: Task) => {
    setEditingId(task.id);
    setEditingText(task.text);
    setEditingDesc(task.description || '');
  };

  const handleSaveEdit = () => {
    if (editingId && editingText.trim()) {
      onUpdateTask(editingId, editingText.trim(), editingDesc.trim());
      setEditingId(null);
    }
  };

  // Fixed: Explicitly cast 'spring' as const to avoid type mismatch with Framer Motion Transition.
  const transition = isAnimationsEnabled ? { type: "spring" as const, stiffness: 400, damping: 30 } : { duration: 0 };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative w-full overflow-hidden font-sans">
      <header className="px-10 pt-8 pb-6 shrink-0 flex justify-between items-center z-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-0.5">Checklist</h2>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse"></div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Strategic Objectives</p>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(!isAdding)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isAdding ? 'bg-slate-200 dark:bg-slate-800 text-slate-600' : 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/25'}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform duration-500 ${isAdding ? 'rotate-45' : ''}`}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </motion.button>
      </header>

      <section className="flex-1 bg-white dark:bg-slate-900 rounded-t-[48px] border-t border-slate-100 dark:border-slate-800/50 px-6 pt-10 overflow-y-auto no-scrollbar shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.05)]">
        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={transition}
              className="mb-10 space-y-4 bg-slate-50 dark:bg-slate-800/40 p-7 rounded-[40px] border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-inner"
            >
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">Task Title</label>
                <input 
                  type="text" value={newTaskText} onChange={(e)=>setNewTaskText(e.target.value)} placeholder="e.g., Deep Work Session"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl px-6 py-4 text-sm font-bold outline-none focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-subtle)] transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">Description & Context</label>
                <textarea 
                  value={newTaskDesc} onChange={(e)=>setNewTaskDesc(e.target.value)} placeholder="What are the key steps for this objective?"
                  className="w-full h-28 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[32px] px-6 py-4 text-sm font-medium outline-none focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-subtle)] resize-none transition-all"
                />
              </div>
              <button 
                disabled={!newTaskText.trim()}
                onClick={() => { onAddTask(newTaskText.trim(), newTaskDesc.trim()); setNewTaskText(''); setNewTaskDesc(''); setIsAdding(false); }}
                className="w-full py-5 bg-[var(--accent-color)] text-white font-black uppercase text-xs tracking-[0.2em] rounded-3xl disabled:opacity-30 active:scale-95 transition-all shadow-xl shadow-[var(--accent-color)]/20"
              >
                Add to Sanctuary
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout className="space-y-5 pb-40 px-2">
          <AnimatePresence mode="popLayout">
            {sortedTasks.length === 0 && !isAdding && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                className="py-20 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">No active objectives</p>
              </motion.div>
            )}
            
            {sortedTasks.map((task) => (
              <motion.div 
                key={task.id} 
                layout
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                transition={transition}
                className={`relative group flex flex-col rounded-[36px] border transition-all duration-500 ${editingId === task.id ? 'bg-white dark:bg-slate-800 border-[var(--accent-color)] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] z-20 scale-[1.02]' : expandedId === task.id ? 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-800/50' : activeTaskId === task.id ? 'bg-[var(--accent-subtle)] border-[var(--accent-color)]/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700'}`}
              >
                <div className="flex items-start p-6">
                  {/* Status Toggle */}
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={()=>onToggleTask(task.id)} 
                    className={`mt-1 shrink-0 w-8 h-8 rounded-2xl border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                  >
                    {task.completed && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5"><polyline points="20 6 9 17 4 12"/></svg>}
                  </motion.button>
                  
                  {/* Content Area */}
                  <div className="flex-1 flex flex-col px-5 min-w-0">
                    {editingId === task.id ? (
                      <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-[var(--accent-color)] tracking-widest ml-1">Title</label>
                          <input 
                            autoFocus
                            type="text" value={editingText} onChange={(e) => setEditingText(e.target.value)}
                            className="w-full bg-transparent text-base font-black outline-none border-b-2 border-slate-100 dark:border-slate-700 focus:border-[var(--accent-color)] transition-all py-1"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-[var(--accent-color)] tracking-widest ml-1">Context</label>
                          <textarea 
                            value={editingDesc} onChange={(e) => setEditingDesc(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 text-xs font-medium outline-none border border-slate-100 dark:border-slate-700 focus:border-[var(--accent-color)] transition-all resize-none h-24"
                            placeholder="Add steps or context..."
                          />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                           <button 
                            onClick={handleSaveEdit}
                            className="flex-1 py-3 bg-[var(--accent-color)] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[var(--accent-color)]/20 active:scale-95 transition-all"
                           >
                             Save Changes
                           </button>
                           <button 
                            onClick={() => setEditingId(null)}
                            className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                           >
                             Cancel
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="cursor-pointer" 
                        onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                      >
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if(!isTimerActive) onSetActiveTask(task.id === activeTaskId ? null : task.id); 
                          }}
                          className={`text-left text-base font-black tracking-tight leading-tight transition-all duration-300 ${task.completed ? 'text-slate-300 dark:text-slate-600 line-through' : activeTaskId === task.id ? 'text-[var(--accent-color)]' : 'text-slate-800 dark:text-slate-100'}`}
                        >
                          {task.text}
                        </button>
                        
                        <AnimatePresence>
                          {(task.description || (expandedId === task.id)) && !task.completed && (
                            <motion.p 
                              layout
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className={`text-[11px] font-medium leading-relaxed mt-1.5 transition-colors ${expandedId === task.id ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500 truncate'}`}
                            >
                              {task.description || "No description provided."}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Desktop Actions */}
                  {!editingId && (
                    <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-all duration-300 -mr-2">
                      {!task.completed && (
                        <motion.button 
                          whileTap={{ scale: 0.9 }} 
                          onClick={() => handleStartEdit(task)} 
                          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[var(--accent-color)] hover:bg-[var(--accent-subtle)] rounded-full transition-all"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </motion.button>
                      )}
                      <motion.button 
                        whileTap={{ scale: 0.9 }} 
                        onClick={()=> { if(confirm('Permanently delete this objective?')) onDeleteTask(task.id); }} 
                        className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Floating Insight Tooltip */}
      {!isAdding && tasks.length > 0 && (
        <div className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none z-10 px-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/90 dark:bg-slate-100/90 backdrop-blur-xl px-6 py-2.5 rounded-full shadow-2xl flex items-center space-x-3 border border-white/10 dark:border-black/5"
          >
            <span className="text-[9px] font-black uppercase text-white dark:text-slate-900 tracking-[0.2em]">{tasks.filter(t=>!t.completed).length} Pending</span>
            <div className="w-1 h-1 rounded-full bg-white/20 dark:bg-slate-900/20"></div>
            <span className="text-[9px] font-black uppercase text-emerald-400 dark:text-emerald-600 tracking-[0.2em]">{tasks.filter(t=>t.completed).length} Mastered</span>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Tasks;