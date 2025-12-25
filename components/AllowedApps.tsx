import React, { useState } from 'react';
import { UNALLOWED_APPS, CYCLE_APPS_BASE, COMMON_APPS_TO_BLOCK } from '../constants';
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
  onAddCustomApp: (app: AppInfo) => void;
}

const AllowedApps: React.FC<AllowedAppsProps> = ({ 
  appTimers, cycleAppIds, appConfigs, unlockRequests, customApps, minWaitMs,
  onRequestUnlock, onAddCustomApp
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const formatWaitTime = (requestedAt: number) => {
    const elapsed = Date.now() - requestedAt;
    const remaining = Math.max(0, minWaitMs - elapsed);
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    return `${mins}m ${secs}s remaining`;
  };

  const allRestricted = UNALLOWED_APPS.concat(customApps);
  const availableToBlock = COMMON_APPS_TO_BLOCK.filter(app => !allRestricted.find(r => r.id === app.id));

  return (
    <div className="p-8 pb-32 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto no-scrollbar">
      <header className="mb-12 relative animate-in fade-in duration-700">
        <div className="absolute -left-6 -top-6 w-24 h-24 bg-[var(--accent-color)]/5 blur-3xl rounded-full animate-pulse-soft" />
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Blocked Apps</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium animate-in fade-in stagger-1">Control which apps you can use.</p>
      </header>

      {/* Managed Communications */}
      <div className="space-y-6 mb-14 animate-in fade-in duration-700 stagger-2">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] px-2">Focus Managed</h3>
        {CYCLE_APPS_BASE.map((app, i) => {
          const config = appConfigs[app.id] || { allowedMs: 1800000, lockMs: 3600000 };
          return (
            <div 
              key={app.id} 
              className={`bg-white dark:bg-slate-900 border transition-all duration-500 rounded-[36px] overflow-hidden border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md animate-in fade-in`}
              style={{ animationDelay: `${(i+2) * 100}ms` }}
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-5">
                  <div className="w-16 h-16 bg-transparent flex items-center justify-center shrink-0 transition-transform duration-500">
                    <AppIcon appId={app.id} className="w-full h-full" />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-black text-lg text-slate-800 dark:text-slate-100 tracking-tight leading-none">{app.name}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg tracking-wider">Active</span>
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-400">{Math.round(config.allowedMs/60000)}m / {Math.round(config.lockMs/60000)}m</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Restricted Apps Section */}
      <div className="space-y-4 mb-16 animate-in fade-in duration-700 stagger-3">
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Restricted List</h3>
        </div>

        <button 
          onClick={() => setIsPickerOpen(true)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 flex items-center justify-between shadow-sm active:scale-95 transition-all duration-300 hover:shadow-md mb-6"
        >
          <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-700 dark:text-slate-100">Add to Block List</span>
          <div className="w-10 h-10 bg-[var(--accent-color)] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--accent-color)]/20 animate-in scale-in duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          </div>
        </button>

        <div className="grid grid-cols-1 gap-4">
          {allRestricted.map((app, i) => {
            const request = unlockRequests[app.id];
            const isPending = request && !request.expiresAt;
            const isUnlocked = request && request.expiresAt && Date.now() < request.expiresAt;
            const isPermanent = app.isPermanentBlock;
            
            return (
              <div 
                key={app.id} 
                className={`flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-[32px] border transition-all duration-500 animate-in fade-in ${isUnlocked ? 'border-emerald-500/40 ring-4 ring-emerald-500/5 scale-[1.02]' : 'border-slate-100 dark:border-slate-800'}`}
                style={{ animationDelay: `${(i+5) * 80}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 bg-transparent flex items-center justify-center transition-all duration-700 ${!isUnlocked ? 'grayscale opacity-70 scale-95' : 'grayscale-0 opacity-100 scale-100'}`}>
                    <AppIcon appId={app.id} className="w-full h-full" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-100 leading-tight">{app.name}</p>
                    {isPermanent ? (
                      <p className="text-[10px] font-black text-red-500 uppercase mt-1 tracking-tighter opacity-90">Hard Blocked</p>
                    ) : isPending ? (
                      <p className="text-[10px] font-black text-amber-500 uppercase mt-1 animate-pulse">{formatWaitTime(request.requestedAt)}</p>
                    ) : isUnlocked ? (
                      <p className="text-[10px] font-black text-emerald-500 uppercase mt-1">Ready to use</p>
                    ) : (
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase mt-1 tracking-tight">Wait 1h to use</p>
                    )}
                  </div>
                </div>
                
                {!isUnlocked && !isPermanent && (
                  <button 
                    disabled={isPending}
                    onClick={(e) => { e.stopPropagation(); onRequestUnlock(app.id); }}
                    className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-75 ${isPending ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500' : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xl'}`}
                  >
                    {isPending ? 'Waiting' : 'Request'}
                  </button>
                )}
                
                {isPermanent && (
                  <div className="p-2.5 text-slate-200 dark:text-slate-600 animate-in zoom-in duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* App Picker Modal Overlay */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-300 backdrop-blur-sm">
          <div className="absolute inset-0 bg-slate-950/60" onClick={() => setIsPickerOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[48px] shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.5)] p-10 pb-14 animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-8 shrink-0" />
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 shrink-0">Choose App</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 shrink-0">Select an application to enforce focus.</p>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
              {availableToBlock.map((app, i) => (
                <button 
                  key={app.id} 
                  onClick={() => { onAddCustomApp(app); setIsPickerOpen(false); }}
                  className="w-full flex items-center space-x-5 p-5 rounded-[28px] border-2 border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.96] animate-in fade-in"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="w-14 h-14 bg-transparent flex items-center justify-center shrink-0">
                    <AppIcon appId={app.id} className="w-full h-full" />
                  </div>
                  <span className="font-extrabold text-lg text-slate-800 dark:text-slate-100">{app.name}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setIsPickerOpen(false)}
              className="mt-8 w-full py-5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-3xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllowedApps;