import React, { useState } from 'react';
import { FocusSession } from '../types';

interface SessionHistoryProps {
  sessions: FocusSession[];
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ sessions }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const t = {
    title: "Session History",
    subtitle: "Review your focus progress.",
    noSessions: "No sessions recorded yet.",
    from: "From",
    to: "To",
    duration: "Duration",
    status: "Status",
    completed: "Completed",
    canceled: "Canceled",
    breaks: "Breaks",
    target: "Target"
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden w-full">
      <header className="px-8 pt-10 pb-8 shrink-0 animate-in fade-in duration-700 max-w-5xl mx-auto w-full">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">{t.title}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium">{t.subtitle}</p>
      </header>

      <section className="flex-1 bg-white dark:bg-slate-900 rounded-t-[48px] shadow-2xl px-8 pt-12 overflow-y-auto no-scrollbar z-20 animate-in slide-in-from-bottom duration-700 w-full">
        <div className="max-w-5xl mx-auto w-full">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 opacity-20">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-6"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
              <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-500">{t.noSessions}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-32">
              {[...sessions].reverse().map((session, index) => {
                const isExpanded = expandedId === session.id;
                const isCompleted = session.status === 'completed';

                return (
                  <div 
                    key={session.id}
                    onClick={() => setExpandedId(isExpanded ? null : session.id)}
                    className={`p-6 rounded-[32px] border transition-all duration-500 cursor-pointer flex flex-col h-fit ${isExpanded ? 'bg-[var(--accent-subtle)] border-[var(--accent-color)]/30 ring-4 ring-[var(--accent-color)]/5' : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-widest mb-1">{formatDate(session.timestamp)}</p>
                        <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">
                          {formatTime(session.startTime)} — {formatTime(session.endTime)}
                        </h4>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl tracking-widest shadow-sm ${isCompleted ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'}`}>
                        {isCompleted ? t.completed : t.canceled}
                      </span>
                    </div>

                    <div className="flex items-center space-x-5 mt-4">
                      <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{formatDuration(session.actualFocusSeconds)}</span>
                      </div>
                      {session.breakCount > 0 && (
                        <div className="flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{session.breakCount} {t.breaks}</span>
                        </div>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-700/50 grid grid-cols-2 gap-6 animate-in fade-in duration-300">
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">{t.target}</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{session.targetDurationSeconds === 0 ? 'Stopwatch' : `${Math.floor(session.targetDurationSeconds/60)}m`}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">{t.breaks}</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{formatDuration(session.totalBreakSeconds)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SessionHistory;