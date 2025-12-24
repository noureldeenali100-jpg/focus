
import React, { useState } from 'react';
import { UNALLOWED_APPS, CYCLE_APPS_BASE } from '../constants';
import { AppTimer, AppConfig } from '../types';

interface AllowedAppsProps {
  appTimers: Record<string, AppTimer>;
  cycleAppIds: string[];
  appConfigs: Record<string, AppConfig>;
  isActivated: boolean;
  onUpdateConfig: (appId: string, allowedMins: number, lockMins: number) => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onToggleCycle: (id: string) => void;
}

const AllowedApps: React.FC<AllowedAppsProps> = ({ 
  appTimers, cycleAppIds, appConfigs, isActivated, 
  onUpdateConfig, onActivate 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = (id: string, allowed: number, lock: number) => {
    onUpdateConfig(id, allowed, lock);
    setEditingId(null);
  };

  return (
    <div className="p-8 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700 bg-slate-50 dark:bg-slate-950 min-h-full">
      <header className="mb-10 relative">
        <div className="absolute -left-4 -top-4 w-20 h-20 bg-[var(--accent-color)]/5 blur-3xl rounded-full" />
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">App Shield</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Control your digital boundaries</p>
      </header>

      <div className="space-y-6 mb-12">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-2">Managed Exceptions</h3>
        {CYCLE_APPS_BASE.map(app => {
          const config = appConfigs[app.id];
          const isEditing = editingId === app.id;
          return (
            <div key={app.id} className={`bg-white dark:bg-slate-900 border transition-all duration-300 rounded-[36px] overflow-hidden ${isEditing ? 'border-[var(--accent-color)] shadow-xl ring-4 ring-[var(--accent-color)]/5' : 'border-slate-100 dark:border-slate-800 shadow-sm'}`}>
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-5">
                  <div className={`w-16 h-16 ${app.color} rounded-[24px] flex items-center justify-center text-white font-black text-2xl shadow-lg ring-4 ring-white dark:ring-slate-800`}>
                    {app.icon}
                  </div>
                  <div>
                    <p className="font-black text-lg text-slate-800 dark:text-slate-100 tracking-tight">{app.name}</p>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg tracking-wider">Timed</span>
                      <p className="text-xs font-bold text-slate-400">{Math.round(config.allowedMs/60000)}m / {Math.round(config.lockMs/60000)}m</p>
                    </div>
                  </div>
                </div>
                {!isActivated && !isEditing && (
                  <button 
                    onClick={() => setEditingId(app.id)} 
                    className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[var(--accent-color)] transition-transform active:scale-90"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  </button>
                )}
              </div>
              {isEditing && (
                <div className="p-8 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                  <TimePicker 
                    label="Active Window" 
                    desc="Maximum continuous use allowed"
                    value={Math.round(config.allowedMs/60000)} 
                    options={[15, 20, 25, 30]} 
                    onChange={(v) => handleSave(app.id, v, Math.round(config.lockMs/60000))} 
                  />
                  <TimePicker 
                    label="Recovery Cycle" 
                    desc="Mandatory lockout after usage"
                    value={Math.round(config.lockMs/60000)} 
                    options={[60, 90, 120, 180]} 
                    onChange={(v) => handleSave(app.id, Math.round(config.allowedMs/60000), v)} 
                  />
                  <button onClick={() => setEditingId(null)} className="w-full py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[24px] text-sm font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg">
                    Update Constraint
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-4 mb-14">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Hard Restrictions</h3>
          <span className="text-[10px] font-black text-red-500/60 uppercase tracking-widest">Always Guarded</span>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {UNALLOWED_APPS.map(app => (
            <div key={app.id} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900/50 rounded-[28px] border border-slate-100 dark:border-slate-800 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 group">
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 ${app.color} rounded-[20px] flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:shadow-md transition-all`}>
                  {app.icon}
                </div>
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300 leading-tight">{app.name}</p>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mt-0.5">Blacklisted</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!isActivated && (
        <button onClick={onActivate} className="w-full py-6 bg-[var(--accent-color)] text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-[var(--accent-color)]/30 active:scale-95 transition-all sticky bottom-0 border-4 border-white dark:border-slate-950">
          Activate Focus Shield
        </button>
      )}
    </div>
  );
};

const TimePicker: React.FC<{ label: string; desc: string; value: number; options: number[]; onChange: (v: number) => void }> = ({ label, desc, value, options, onChange }) => (
  <div>
    <div className="mb-4">
      <p className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">{label}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{desc}</p>
    </div>
    <div className="flex flex-wrap gap-2.5">
      {options.map(opt => (
        <button 
          key={opt} onClick={() => onChange(opt)}
          className={`flex-1 min-w-[60px] py-3.5 rounded-[18px] text-xs font-black transition-all ${value === opt ? 'bg-[var(--accent-color)] text-white shadow-lg ring-4 ring-[var(--accent-color)]/10' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
        >
          {opt}m
        </button>
      ))}
    </div>
  </div>
);

export default AllowedApps;
