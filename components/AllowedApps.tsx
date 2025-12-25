import React, { useState } from 'react';
import { UNALLOWED_APPS, CYCLE_APPS_BASE } from '../constants';
import { AppTimer, AppConfig, UnlockRequest, AppInfo } from '../types';
import AppIcon from './AppIcon';

interface AllowedAppsProps {
  appTimers: Record<string, AppTimer>;
  cycleAppIds: string[];
  appConfigs: Record<string, AppConfig>;
  unlockRequests: Record<string, UnlockRequest>;
  customApps: AppInfo[];
  minWaitMs: number;
  onRequestUnlock: (appId: string) => void;
  onAddCustomApp: (name: string) => void;
}

const AllowedApps: React.FC<AllowedAppsProps> = ({ 
  appTimers, cycleAppIds, appConfigs, unlockRequests, customApps, minWaitMs,
  onRequestUnlock, onAddCustomApp
}) => {
  const [newAppName, setNewAppName] = useState('');

  const formatWaitTime = (requestedAt: number) => {
    const elapsed = Date.now() - requestedAt;
    const remaining = Math.max(0, minWaitMs - elapsed);
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    return `${mins}m ${secs}s remaining`;
  };

  const allRestricted = UNALLOWED_APPS.concat(customApps);

  return (
    <div className="p-8 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto no-scrollbar">
      <header className="mb-10 relative">
        <div className="absolute -left-4 -top-4 w-20 h-20 bg-[var(--accent-color)]/5 blur-3xl rounded-full" />
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">App Shield</h2>
        <p className="text-slate-500 dark:text-slate-300 text-sm font-medium">Control your digital boundaries</p>
      </header>

      {/* Managed Communications */}
      <div className="space-y-6 mb-12">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-[0.2em] px-2">Managed Communication</h3>
        {CYCLE_APPS_BASE.map(app => {
          const config = appConfigs[app.id];
          return (
            <div key={app.id} className="bg-white dark:bg-slate-900 border transition-all duration-300 rounded-[36px] overflow-hidden border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-5">
                  <div className={`w-16 h-16 ${app.color} rounded-[24px] flex items-center justify-center text-white font-black shadow-lg ring-4 ring-white dark:ring-slate-800 shrink-0`}>
                    <AppIcon appId={app.id} className="w-full h-full p-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-black text-lg text-slate-800 dark:text-slate-100 tracking-tight leading-tight">{app.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg tracking-wider">Timed</span>
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500">{Math.round(config.allowedMs/60000)}m / {Math.round(config.lockMs/60000)}m</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unlock Discipline Section */}
      <div className="space-y-4 mb-14">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-[0.2em]">Restricted Apps</h3>
        </div>

        <div className="flex gap-2 mb-4 px-2">
          <input 
            type="text" 
            value={newAppName}
            onChange={(e) => setNewAppName(e.target.value)}
            placeholder="Add app to block list..."
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-[var(--accent-color)] text-slate-800 dark:text-slate-100"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newAppName.trim()) {
                onAddCustomApp(newAppName.trim());
                setNewAppName('');
              }
            }}
          />
          <button 
            onClick={() => {
              if (newAppName.trim()) {
                onAddCustomApp(newAppName.trim());
                setNewAppName('');
              }
            }}
            className="w-10 h-10 bg-[var(--accent-color)] text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {allRestricted.map(app => {
            const request = unlockRequests[app.id];
            const isPending = request && !request.expiresAt;
            const isUnlocked = request && request.expiresAt && Date.now() < request.expiresAt;
            const isPermanent = app.isPermanentBlock;
            
            return (
              <div key={app.id} className={`flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-[28px] border transition-all duration-300 ${isUnlocked ? 'border-emerald-500/30 ring-4 ring-emerald-500/5' : 'border-slate-100 dark:border-slate-800'}`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 ${app.color} rounded-[20px] flex items-center justify-center text-white font-black shadow-sm ${!isUnlocked ? 'grayscale opacity-60' : ''}`}>
                    <AppIcon appId={app.id} className="w-full h-full p-3" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-200 leading-tight">{app.name}</p>
                    {isPermanent ? (
                      <p className="text-[10px] font-black text-red-500 uppercase mt-0.5 tracking-tighter">Permanently Blocked</p>
                    ) : isPending ? (
                      <p className="text-[10px] font-black text-amber-500 uppercase mt-0.5">{formatWaitTime(request.requestedAt)}</p>
                    ) : isUnlocked ? (
                      <p className="text-[10px] font-black text-emerald-500 uppercase mt-0.5">Unlocked - Open in Sim</p>
                    ) : (
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase mt-0.5">Blocked - Request 1h Wait</p>
                    )}
                  </div>
                </div>
                
                {!isUnlocked && !isPermanent && (
                  <button 
                    disabled={isPending}
                    onClick={() => onRequestUnlock(app.id)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isPending ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md active:scale-95'}`}
                  >
                    {isPending ? 'Waiting' : 'Request'}
                  </button>
                )}
                
                {isPermanent && (
                  <div className="p-2 text-slate-300 dark:text-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AllowedApps;