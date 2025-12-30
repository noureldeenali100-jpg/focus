/**
 * SessionHistory Component.
 * Refined with professional staggered animations and clean data visualization.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FocusSession } from '../types';

interface SessionHistoryProps {
  sessions: FocusSession[];
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ sessions }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todaySessions = sessions.filter(s => new Date(s.timestamp).setHours(0, 0, 0, 0) === today);
    const completed = sessions.filter(s => s.status === 'completed');
    const totalFocusTime = completed.reduce((acc, s) => acc + s.actualFocusSeconds, 0);
    
    return {
      totalTime: Math.floor(totalFocusTime / 3600),
      totalTimeMins: Math.floor((totalFocusTime % 3600) / 60),
      sessionsToday: todaySessions.length,
      successRate: sessions.length ? Math.round((completed.length / sessions.length) * 100) : 0
    };
  }, [sessions]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const listContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const listItem = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden w-full font-sans">
      <header className="px-8 pt-10 pb-6 shrink-0 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Insights</h2>
          <div className="bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center space-x-1">
             <span className="text-[10px] font-black px-3 py-1 bg-[var(--accent-subtle)] text-[var(--accent-color)] rounded-xl uppercase tracking-tighter">History</span>
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Quantify your productivity journey.</p>
      </header>

      <section className="flex-1 bg-white dark:bg-slate-900 rounded-t-[48px] shadow-2xl px-8 pt-10 overflow-y-auto no-scrollbar z-20 w-full border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-xl mx-auto w-full">
          
          {/* Summary Dashboard */}
          <div className="grid grid-cols-3 gap-3 mb-12">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-[28px] border border-slate-100 dark:border-slate-800/50 flex flex-col items-center text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Hours</span>
              <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                {stats.totalTime}<span className="text-xs opacity-40 ml-0.5">h</span>
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-[28px] border border-slate-100 dark:border-slate-800/50 flex flex-col items-center text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Today</span>
              <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.sessionsToday}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-[28px] border border-slate-100 dark:border-slate-800/50 flex flex-col items-center text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Success</span>
              <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                {stats.successRate}<span className="text-xs opacity-40 ml-0.5">%</span>
              </p>
            </motion.div>
          </div>

          <div className="mb-6 flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Timeline</h3>
            <div className="h-px flex-1 mx-4 bg-slate-100 dark:bg-slate-800"></div>
          </div>

          <motion.div 
            variants={listContainer}
            initial="hidden"
            animate="show"
            className="space-y-4 pb-32"
          >
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 opacity-30 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">No logs found</p>
              </div>
            ) : (
              [...sessions].reverse().map((session) => {
                const isExpanded = expandedId === session.id;
                const isCompleted = session.status === 'completed';
                const progress = session.targetDurationSeconds > 0 ? (session.actualFocusSeconds / session.targetDurationSeconds) * 100 : 100;

                return (
                  <motion.div 
                    key={session.id}
                    layout
                    variants={listItem}
                    onClick={() => setExpandedId(isExpanded ? null : session.id)}
                    className={`group relative p-6 rounded-[32px] border transition-all cursor-pointer ${isExpanded ? 'bg-slate-50 dark:bg-slate-800/60 border-[var(--accent-color)]/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">{formatDate(session.timestamp)}</p>
                        </div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                          {formatTime(session.startTime)} <span className="text-slate-300 dark:text-slate-700 mx-1">—</span> {formatTime(session.endTime)}
                        </h4>
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${isCompleted ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {isCompleted ? 'Goal Met' : 'Aborted'}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-1">Focus Time</span>
                        <p className="text-sm font-black text-slate-700 dark:text-slate-200 tabular-nums">{formatDuration(session.actualFocusSeconds)}</p>
                      </div>
                      <div className="flex-1">
                         <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                           <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${Math.min(100, progress)}%` }}
                            className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-red-400'}`} 
                           />
                         </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-2 gap-6 overflow-hidden"
                        >
                          <div>
                            <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">Objective Target</span>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              {session.targetDurationSeconds === 0 ? 'Infinite Flow' : formatDuration(session.targetDurationSeconds)}
                            </p>
                          </div>
                          <div>
                            <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">Efficiency Rate</span>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{Math.round(progress)}% of goal</p>
                          </div>
                          {session.breakCount > 0 && (
                            <div className="col-span-2 flex items-center space-x-2 text-slate-400 dark:text-slate-500">
                               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                               <span className="text-[10px] font-bold">{session.breakCount} Interruption{session.breakCount > 1 ? 's' : ''} during session</span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {!isExpanded && (
                       <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-300"><path d="m6 9 6 6 6-6"/></svg>
                       </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SessionHistory;